import express from 'express';
import cors from 'cors';
import urlMetadata from 'url-metadata';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape', async (req, res) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Upgrade-Insecure-Requests': '1'
        };

        // Shein Anti-Bot Bypass: Use Facebook Crawler UA (proven to get OG tags)
        if (url.includes('shein.')) {
            headers['User-Agent'] = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
        }

        const metadata = await urlMetadata(url, {
            requestHeaders: headers,
            timeout: 10000,
            includeJSONLD: true,
        });

        // Extract title
        let title = metadata['og:title'] || metadata['twitter:title'] || metadata['title'] || '';

        // Extract description
        let description = metadata['og:description'] || metadata['twitter:description'] || metadata['description'] || '';

        // Extract image
        let image = metadata['og:image'] || metadata['twitter:image'] || metadata['image'] || '';

        // Extract price
        let price = '';
        let currency = 'USD';

        // Helper: Check JSON-LD
        if (metadata.jsonld) {
            console.log('JSON-LD found:', true);
            let items = metadata.jsonld;
            if (!Array.isArray(items)) items = [items];

            // Flatten @graph if present (common in WP/Yoast)
            let flattenedItems = [];
            for (const item of items) {
                if (item && item['@graph'] && Array.isArray(item['@graph'])) {
                    flattenedItems = flattenedItems.concat(item['@graph']);
                } else {
                    flattenedItems.push(item);
                }
            }
            items = flattenedItems;

            for (const item of items) {
                if (!item) continue;

                // Debug log types found
                console.log('JSON-LD Type:', item['@type']);

                // Check for Product
                if (item['@type'] === 'Product' || item['@type'] === 'http://schema.org/Product') {
                    console.log('Product Found');
                    if (!title && item.name) title = item.name;
                    if (!description && item.description) description = item.description;
                    if (!image && item.image) {
                        image = Array.isArray(item.image) ? item.image[0] : (item.image.url || item.image);
                    }

                    // Check offers
                    const offers = item.offers;
                    if (offers) {
                        const offer = Array.isArray(offers) ? offers[0] : offers;
                        if (offer) {
                            if (offer.price) price = offer.price;
                            if (offer.priceCurrency) currency = offer.priceCurrency;
                            if (!price && offer.lowPrice) price = offer.lowPrice; // AggregateOffer
                            if (!price && offer.highPrice) price = offer.highPrice;
                        }
                    }
                }
            }
        } else {
            console.log('No JSON-LD found');
        }

        console.log('Scraped Data:', { title: title.substring(0, 30) + '...', price, currency, image: !!image });

        const priceTags = [
            'og:price:amount',
            'product:price:amount',
            'price',
            'product:price',
            'twitter:data1'
        ];

        if (!price) {
            for (const tag of priceTags) {
                const value = metadata[tag];
                if (value) {
                    const val = value.toString().replace(/[^\d.]/g, '');
                    if (val && !isNaN(parseFloat(val))) {
                        price = val;
                        break;
                    }
                }
            }
        }

        // Fallback: Check description for price (e.g. "$19.99")
        // Extended Fallback: Check description/title for price with improved regex
        if (!price) {
            // Regex to match $19.99, $1,234.50, USD 15.00, etc.
            const priceRegexStrict = /[$€£¥]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
            const priceRegexCurrency = /(?:USD|EUR|GBP)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;

            // Try Strict Symbol first ($19.99)
            let descMatch = description.match(priceRegexStrict) || title.match(priceRegexStrict);

            // If not found, try Currency Code (USD 19.99)
            if (!descMatch) {
                descMatch = description.match(priceRegexCurrency) || title.match(priceRegexCurrency);
            }

            if (descMatch) {
                price = descMatch[1].replace(/,/g, '');
            }
        }

        const currencyTag = metadata['og:price:currency'] || metadata['product:price:currency'];
        if (currencyTag) {
            currency = currencyTag.toString().toUpperCase();
        }

        // SUPER FALLBACK: Raw HTML Scan (if price/image missing)
        // url-metadata does not expose raw HTML, so we fetch again if needed
        if (!price || !image) {
            console.log('Metadata incomplete, attempting raw HTML scan...');
            try {
                // Reuse the headers we defined at the top (which includes the FB Bot for Shein)
                const response = await fetch(url, {
                    headers,
                    redirect: 'follow'
                });
                console.log('Raw Fetch Status:', response.status);
                console.log('Raw Fetch URL (post-redirect):', response.url);
                const html = await response.text();

                // 1. Amazon Price: <span class="a-offscreen">$99.99</span>
                if (!price) {
                    const amazonPriceMatch = html.match(/class=["']a-offscreen["']>([^<]+)</);
                    if (amazonPriceMatch) {
                        price = amazonPriceMatch[1].replace(/[^\d.]/g, ''); // Extract 99.99
                        console.log('Found Amazon Price via Raw HTML');
                    }
                }

                // 2. Amazon Price Alternative: <span class="a-price-whole">99<
                if (!price) {
                    const amazonWhole = html.match(/class=["']a-price-whole["']>([^<]+)</);
                    if (amazonWhole) {
                        const amazonFraction = html.match(/class=["']a-price-fraction["']>([^<]+)</);
                        price = amazonWhole[1].trim() + (amazonFraction ? '.' + amazonFraction[1].trim() : ''); // 99 or 99.99
                        price = price.replace(/[^\d.]/g, '');
                        console.log('Found Amazon Price (Whole) via Raw HTML');
                    }
                }

                // 3. Shein/General: "price":12.34 or "price":"12.34" in scripts
                if (!price) {
                    // Shein often uses usage "salePrice" or "retailPrice" in their JSON blobs
                    const sheinSale = html.match(/"salePrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const sheinRetail = html.match(/"retailPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const generalPrice = html.match(/"price"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const productPrice = html.match(/"productPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);

                    if (sheinSale) {
                        price = sheinSale[1];
                        console.log('Found Shein Sale Price via Raw HTML');
                    } else if (sheinRetail) {
                        price = sheinRetail[1];
                        console.log('Found Shein Retail Price via Raw HTML');
                    } else if (productPrice) {
                        price = productPrice[1];
                        console.log('Found Shein Product Price via Raw HTML');
                    } else if (generalPrice) {
                        price = generalPrice[1];
                        console.log('Found Script Price via Raw HTML');
                    }
                }

                // 4. Shein Image Fallback (often hidden in productIntroData)
                if (!image && url.includes('shein.com')) {
                    const sheinImg = html.match(/"original_image_url"\s*:\s*["'](https:\/\/[^"']+)["']/);
                    const sheinMain = html.match(/"mainImage"\s*:\s*["'](https:\/\/[^"']+)["']/);

                    if (sheinImg) {
                        image = sheinImg[1];
                        console.log('Found Shein Image (original) via Raw HTML');
                    } else if (sheinMain) {
                        image = sheinMain[1];
                        console.log('Found Shein Image (main) via Raw HTML');
                    }
                }

                // 4. Amazon Image: "large":"https://..."
                if (!image) {
                    // Look for JSON object with main image
                    const amzImgMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
                    if (amzImgMatch) {
                        image = amzImgMatch[1];
                        console.log('Found Amazon Image via Raw HTML');
                    }
                }

                // 5. General Image Fallback: Look for first larger image
                if (!image) {
                    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(?:jpg|png|webp))["'][^>]*>/i);
                    if (imgMatch) {
                        image = imgMatch[1];
                    }
                }

            } catch (err) {
                console.log('Raw fetch failed:', err.message);
            }
        }

        console.log('Final Scraped Data:', { title: title.substring(0, 30) + '...', price, currency, image: !!image });

        if (image && image.startsWith('http:')) {
            image = image.replace('http:', 'https:');
        }

        res.json({
            title: title.toString().trim(),
            description: description.toString().trim(),
            image: image.toString().trim(),
            price: price,
            currency: currency,
            url: url
        });
    } catch (error) {
        console.error('Scraping error:', error);

        let errorMessage = 'Failed to scrape metadata';
        const errorText = String(error);

        if (errorText.includes('403') || errorText.includes('Forbidden')) {
            errorMessage = 'This site blocks automated access. Please enter details manually.';
        } else if (errorText.includes('timeout')) {
            errorMessage = 'Request timed out. Site took too long to respond.';
        }

        res.status(500).json({ error: errorMessage });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Local API server running at http://localhost:${PORT}`);
});
