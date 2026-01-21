/**
 * Specialized fallback scrapers for sites that block standard metadata extraction
 */

export function extractAmazonPrice(html) {
    // 1. Amazon Price: <span class="a-offscreen">$99.99</span>
    const amazonPriceMatch = html.match(/class=["']a-offscreen["']>([^<]+)</);
    if (amazonPriceMatch) {
        return amazonPriceMatch[1].replace(/[^\d.]/g, ''); // Extract 99.99
    }

    // 2. Amazon Price Alternative: <span class="a-price-whole">99<
    const amazonWhole = html.match(/class=["']a-price-whole["']>([^<]+)</);
    if (amazonWhole) {
        const amazonFraction = html.match(/class=["']a-price-fraction["']>([^<]+)</);
        const price = amazonWhole[1].trim() + (amazonFraction ? '.' + amazonFraction[1].trim() : ''); // 99 or 99.99
        return price.replace(/[^\d.]/g, '');
    }

    return null;
}

export function extractAmazonImage(html) {
    const amzImgMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    return amzImgMatch ? amzImgMatch[1] : null;
}

export function extractSheinPrice(html) {
    const sheinSale = html.match(/"salePrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
    const sheinRetail = html.match(/"retailPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);
    const productPrice = html.match(/"productPrice"\s*:\s*["']?(\d+\.?\d*)["']?/);

    if (sheinSale) return sheinSale[1];
    if (sheinRetail) return sheinRetail[1];
    if (productPrice) return productPrice[1];

    return null;
}

export function extractSheinImage(html) {
    const sheinImg = html.match(/"original_image_url"\s*:\s*["'](https:\/\/[^"']+)["']/);
    const sheinMain = html.match(/"mainImage"\s*:\s*["'](https:\/\/[^"']+)["']/);

    if (sheinImg) return sheinImg[1];
    if (sheinMain) return sheinMain[1];

    return null;
}

export function extractGenericPrice(html) {
    const generalPrice = html.match(/"price"\s*:\s*["']?(\d+\.?\d*)["']?/);
    return generalPrice ? generalPrice[1] : null;
}

export function extractGenericImage(html) {
    const imgMatch = html.match(/<img[^>]+src=["'](https:\/\/[^"']+\.(?:jpg|png|webp))["'][^>]*>/i);
    return imgMatch ? imgMatch[1] : null;
}
