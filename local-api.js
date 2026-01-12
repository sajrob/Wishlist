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
        });

        // Extract title
        const title = metadata['og:title'] || metadata['twitter:title'] || metadata['title'] || '';

        // Extract description
        const description = metadata['og:description'] || metadata['twitter:description'] || metadata['description'] || '';

        // Extract image
        const image = metadata['og:image'] || metadata['twitter:image'] || metadata['image'] || '';

        // Extract price
        let price = '';
        let currency = 'USD';

        const priceTags = [
            'og:price:amount',
            'product:price:amount',
            'price',
            'product:price',
            'twitter:data1'
        ];

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

        const currencyTag = metadata['og:price:currency'] || metadata['product:price:currency'];
        if (currencyTag) {
            currency = currencyTag.toString().toUpperCase();
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
