import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import urlMetadata from 'url-metadata';

// Initialize Supabase Client
// Note: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel Environment Variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Helper: Validate URL (SSRF Protection)
function isSafeUrl(urlS: string): boolean {
    try {
        const u = new URL(urlS);
        // 1. Allowed protocols
        if (!['http:', 'https:'].includes(u.protocol)) return false;

        // 2. Block bad hostnames
        const hostname = u.hostname.toLowerCase();
        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.16.') || // Simplistic private range check
            hostname.includes('internal')
        ) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS - Allow any origin for now, but Auth is required
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    // 1. Input Validation
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    if (!isSafeUrl(url)) {
        return res.status(403).json({ error: 'Invalid or restricted URL' });
    }

    // 2. Authentication Check
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // If Auth is missing, return 401
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    if (supabase) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } else {
        console.warn('Supabase env vars missing. Skipping strict auth check (Not Recommended for Prod).');
    }

    try {
        let headers: Record<string, string> = {
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
            requestHeaders: headers as any,
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

        // Extended Fallback
        if (!price) {
            const priceRegexStrict = /[$€£¥]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
            const priceRegexCurrency = /(?:USD|EUR|GBP)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
            let descMatch = description.match(priceRegexStrict) || title.match(priceRegexStrict);
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
        if (!price || !image) {
            try {
                const response = await fetch(url, {
                    headers,
                    redirect: 'follow'
                });
                const html = await response.text();

                // 1. Amazon Price
                if (!price) {
                    const amazonPriceMatch = html.match(/class=["']a-offscreen["']>([^<]+)</);
                    if (amazonPriceMatch) {
                        price = amazonPriceMatch[1].replace(/[^\d.]/g, '');
                    }
                }

                // 2. Amazon Price Alternative
                if (!price) {
                    const amazonWhole = html.match(/class=["']a-price-whole["']>([^<]+)</);
                    if (amazonWhole) {
                        const amazonFraction = html.match(/class=["']a-price-fraction["']>([^<]+)</);
                        price = amazonWhole[1].trim() + (amazonFraction ? '.' + amazonFraction[1].trim() : '');
                        price = price.replace(/[^\d.]/g, '');
                    }
                }

                // 3. Shein/General
                if (!price) {
                    const sheinSale = html.match(/"salePrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const sheinRetail = html.match(/"retailPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const generalPrice = html.match(/"price"\s*:\s*["']?(\d+\.?\d*)["']?/);
                    const productPrice = html.match(/"productPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);

                    if (sheinSale) price = sheinSale[1];
                    else if (sheinRetail) price = sheinRetail[1];
                    else if (productPrice) price = productPrice[1];
                    else if (generalPrice) price = generalPrice[1];
                }

                // 4. Shein Image
                if (!image && url.includes('shein.com')) {
                    const sheinImg = html.match(/"original_image_url"\s*:\s*["'](https:\/\/[^"']+)["']/);
                    const sheinMain = html.match(/"mainImage"\s*:\s*["'](https:\/\/[^"']+)["']/);
                    if (sheinImg) image = sheinImg[1];
                    else if (sheinMain) image = sheinMain[1];
                }

                // 5. Amazon Image
                if (!image) {
                    const amzImgMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
                    if (amzImgMatch) image = amzImgMatch[1];
                }

                // 6. General Image
                if (!image) {
                    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(?:jpg|png|webp))["'][^>]*>/i);
                    if (imgMatch) image = imgMatch[1];
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
