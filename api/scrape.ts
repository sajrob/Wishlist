import type { VercelRequest, VercelResponse } from '@vercel/node';
import urlMetadata from 'url-metadata';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const metadata = await urlMetadata(url, {
            requestHeaders: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000,
            // @ts-ignore
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
            let items = metadata.jsonld;
            if (!Array.isArray(items)) items = [items];

            // Flatten @graph if present
            let flattenedItems: any[] = [];
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

                // Check for Product
                if (item['@type'] === 'Product' || item['@type'] === 'http://schema.org/Product') {
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
        }

        // Check common price tags
        // urlMetadata converts tags into a flat object
        const priceTags = [
            'og:price:amount',
            'product:price:amount',
            'price',
            'product:price',
            'twitter:data1'
        ];

        if (!price) {
            for (const tag of priceTags) {
                const value = (metadata as any)[tag];
                if (value) {
                    // Try to extract only numbers and decimal point
                    const val = value.toString().replace(/[^\d.]/g, '');
                    if (val && !isNaN(parseFloat(val))) {
                        price = val;
                        break;
                    }
                }
            }
        }

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

        // Check currency
        const currencyTag = (metadata as any)['og:price:currency'] || (metadata as any)['product:price:currency'];
        if (currencyTag) {
            currency = currencyTag.toString().toUpperCase();
        }

        // SUPER FALLBACK: Raw HTML Scan (if price/image missing)
        // url-metadata does not expose raw HTML, so we fetch again if needed
        if (!price || !image) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                });
                const html = await response.text();

                // 1. Amazon Price: <span class="a-offscreen">$99.99</span>
                if (!price) {
                    const amazonPriceMatch = html.match(/class=["']a-offscreen["']>([^<]+)</);
                    if (amazonPriceMatch) {
                        price = amazonPriceMatch[1].replace(/[^\d.]/g, ''); // Extract 99.99
                    }
                }

                // 2. Amazon Price Alternative: <span class="a-price-whole">99<
                if (!price) {
                    const amazonWhole = html.match(/class=["']a-price-whole["']>([^<]+)</);
                    if (amazonWhole) {
                        const amazonFraction = html.match(/class=["']a-price-fraction["']>([^<]+)</);
                        price = amazonWhole[1].trim() + (amazonFraction ? '.' + amazonFraction[1].trim() : ''); // 99 or 99.99
                        price = price.replace(/[^\d.]/g, '');
                    }
                }

                // 3. Shein/General: "price":12.34 or "price":"12.34" in scripts
                if (!price) {
                    const scriptPrice = html.match(/"price"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    if (scriptPrice) {
                        price = scriptPrice[1];
                    }
                }

                // 4. Amazon Image: "large":"https://..."
                if (!image) {
                    // Look for JSON object with main image
                    const amzImgMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
                    if (amzImgMatch) {
                        image = amzImgMatch[1];
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
                console.error('Raw fetch failed:', err);
            }
        }

        if (image && image.startsWith('http:')) {
            image = image.replace('http:', 'https:');
        }

        return res.status(200).json({
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

        return res.status(500).json({ error: errorMessage });
    }
}
