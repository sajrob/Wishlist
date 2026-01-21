/**
 * SSRF and URL validation utilities
 */

export function isSafeUrl(urlS) {
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
