/**
 * Utility functions for formatting dates and times.
 */

/**
 * Formats a date string into a human-readable format.
 * Returns "Today at HH:MM" if within 24 hours and same day,
 * otherwise returns "MMM DD, HH:MM".
 */
export function formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    // Check if it's the same calendar day and within 24 hours
    const isSameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (diffInHours < 24 && isSameDay) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
