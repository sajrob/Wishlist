/**
 * Utility functions for formatting numbers and currencies.
 */

/**
 * Formats a number as a currency string.
 * Supports special case for Sierra Leonean Leone (SLE/SLL).
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(value)) return 'N/A';

    // Handle Sierra Leonean Leone (Special Branding)
    if (currencyCode === 'SLE' || currencyCode === 'SLL') {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
        return `Le ${formatted}`;
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(value);
    } catch (e) {
        // Fallback for unsupported currency codes
        const formatted = value.toFixed(2);
        return `${currencyCode} ${formatted}`;
    }
}

/**
 * Formats a large number with commas.
 */
export function formatNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}
