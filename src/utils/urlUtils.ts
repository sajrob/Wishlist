/**
 * Utility functions for link handling and formatting.
 */

export function ensureAbsoluteUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) return '';

    // If it already has a protocol, return as is
    if (/^(?:[a-z+.-]+):/i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    // Otherwise, prepend https://
    return `https://${trimmedUrl}`;
}
