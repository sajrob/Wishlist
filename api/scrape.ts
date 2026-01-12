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
            const jsonLd = metadata.jsonld;
            // Support both single object and array of objects
            const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

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

        // Check currency
        const currencyTag = (metadata as any)['og:price:currency'] || (metadata as any)['product:price:currency'];
        if (currencyTag) {
            currency = currencyTag.toString().toUpperCase();
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
