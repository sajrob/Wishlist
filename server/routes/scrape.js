import express from 'express';
import urlMetadata from 'url-metadata';

const router = express.Router();

// Helper: Validate URL (SSRF Protection)
function isSafeUrl(urlS) {
    try {
        const u = new URL(urlS);
        if (!['http:', 'https:'].includes(u.protocol)) return false;
        const hostname = u.hostname.toLowerCase();
        // Block loopback and private ranges
        return !(
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.16.') ||
            hostname.includes('internal')
        );
    } catch {
        return false;
    }
}

router.get('/scrape', async (req, res) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    if (!isSafeUrl(url)) {
        return res.status(403).json({ error: 'Invalid or restricted URL' });
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

        if (metadata.jsonld) {
            let items = metadata.jsonld;
            if (!Array.isArray(items)) items = [items];
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
                if (item['@type'] === 'Product' || item['@type'] === 'http://schema.org/Product') {
                    if (!title && item.name) title = item.name;
                    if (!description && item.description) description = item.description;
                    if (!image && item.image) {
                        image = Array.isArray(item.image) ? item.image[0] : (item.image.url || item.image);
                    }
                    const offers = item.offers;
                    if (offers) {
                        const offer = Array.isArray(offers) ? offers[0] : offers;
                        if (offer) {
                            if (offer.price) price = offer.price;
                            if (offer.priceCurrency) currency = offer.priceCurrency;
                            if (!price && offer.lowPrice) price = offer.lowPrice;
                            if (!price && offer.highPrice) price = offer.highPrice;
                        }
                    }
                }
            }
        }

        const priceTags = ['og:price:amount', 'product:price:amount', 'price', 'product:price', 'twitter:data1'];
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

        if (!price) {
            const priceRegexStrict = /[$€£¥]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
            const priceRegexCurrency = /(?:USD|EUR|GBP)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;
            let descMatch = description.match(priceRegexStrict) || title.match(priceRegexStrict);
            if (!descMatch) descMatch = description.match(priceRegexCurrency) || title.match(priceRegexCurrency);
            if (descMatch) price = descMatch[1].replace(/,/g, '');
        }

        const currencyTag = metadata['og:price:currency'] || metadata['product:price:currency'];
        if (currencyTag) currency = currencyTag.toString().toUpperCase();

        if (!price || !image) {
            try {
                const response = await fetch(url, { headers, redirect: 'follow' });
                const html = await response.text();
                if (!price) {
                    const amazonPriceMatch = html.match(/class=["']a-offscreen["']>([^<]+)</);
                    if (amazonPriceMatch) price = amazonPriceMatch[1].replace(/[^\d.]/g, '');
                }
                if (!price) {
                    const amazonWhole = html.match(/class=["']a-price-whole["']>([^<]+)</);
                    if (amazonWhole) {
                        const amazonFraction = html.match(/class=["']a-price-fraction["']>([^<]+)</);
                        price = amazonWhole[1].trim() + (amazonFraction ? '.' + amazonFraction[1].trim() : '');
                        price = price.replace(/[^\d.]/g, '');
                    }
                }
                if (!image && url.includes('shein.com')) {
                    const sheinImg = html.match(/"original_image_url"\s*:\s*["'](https:\/\/[^"']+)["']/);
                    const sheinMain = html.match(/"mainImage"\s*:\s*["'](https:\/\/[^"']+)["']/);
                    if (sheinImg) image = sheinImg[1];
                    else if (sheinMain) image = sheinMain[1];
                }
            } catch (err) {
                console.error('Raw fetch failed:', err.message);
            }
        }

        if (image && image.startsWith('http:')) image = image.replace('http:', 'https:');

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
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
