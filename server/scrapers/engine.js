/**
 * Main scraping engine
 */

import urlMetadata from 'url-metadata';
import { getHeaders } from '../utils/headers.js';
import * as fallbacks from './fallbacks.js';

export async function scrapeUrl(url) {
    const headers = getHeaders(url);

    try {
        const metadata = await urlMetadata(url, {
            requestHeaders: headers,
            timeout: 10000,
            includeJSONLD: true,
        });

        // 1. Core extraction from metadata
        let title = metadata['og:title'] || metadata['twitter:title'] || metadata['title'] || '';
        let description = metadata['og:description'] || metadata['twitter:description'] || metadata['description'] || '';
        let image = metadata['og:image'] || metadata['twitter:image'] || metadata['image'] || '';
        let price = '';
        let currency = 'USD';

        // 2. JSON-LD Extraction
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

            for (const item of flattenedItems) {
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

        // 3. Price Tags Fallback
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

        // 4. Regex Price Fallback from text
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

        const currencyTag = metadata['og:price:currency'] || metadata['product:price:currency'];
        if (currencyTag) {
            currency = currencyTag.toString().toUpperCase();
        }

        // 5. Raw HTML Scan Fallback
        if (!price || !image) {
            try {
                const response = await fetch(url, { headers, redirect: 'follow' });
                const html = await response.text();

                if (!price) {
                    price = fallbacks.extractAmazonPrice(html) ||
                        fallbacks.extractSheinPrice(html) ||
                        fallbacks.extractGenericPrice(html) ||
                        '';
                }

                if (!image) {
                    if (url.includes('shein.com')) {
                        image = fallbacks.extractSheinImage(html) || '';
                    } else if (url.includes('amazon.')) {
                        image = fallbacks.extractAmazonImage(html) || '';
                    } else {
                        image = fallbacks.extractGenericImage(html) || '';
                    }
                }
            } catch (err) {
                console.log('Raw fetch fallback failed:', err.message);
            }
        }

        if (image && image.startsWith('http:')) {
            image = image.replace('http:', 'https:');
        }

        return {
            title: title.toString().trim(),
            description: description.toString().trim(),
            image: image.toString().trim(),
            price: price,
            currency: currency,
            url: url
        };
    } catch (error) {
        throw error;
    }
}
