/**
 * Utility functions for handling user names and formatting
 */

/**
 * Converts a name to its possessive form following English grammar rules.
 * Names ending in 's' get an apostrophe ('), others get apostrophe-s ('s).
 * 
 * @param {string} name - The name to convert
 * @returns {string} The possessive form of the name
 * 
 * @example
 * getPossessiveName("Chris") // "Chris'"
 * getPossessiveName("Bob") // "Bob's"
 * getPossessiveName("James") // "James'"
 */
export function getPossessiveName(name) {
    if (!name || typeof name !== 'string') {
        return '';
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        return '';
    }

    const suffix = trimmedName.slice(-1).toLowerCase() === 's' ? "'" : "'s";
    return `${trimmedName}${suffix}`;
}

/**
 * Extracts initials from a full name.
 * Takes the first letter of each word, up to 2 letters max.
 * 
 * @param {string} name - The full name to get initials from
 * @returns {string} The initials in uppercase (max 2 letters)
 * 
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Mary") // "M"
 * getInitials("Jean-Paul Smith") // "JP"
 */
export function getInitials(name) {
    if (!name || typeof name !== 'string') {
        return 'U'; // Unknown user
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        return 'U';
    }

    return trimmedName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Safely extracts the first name from a profile object.
 * Tries multiple sources: first_name, full_name, or returns a default.
 * 
 * @param {Object} profile - The user profile object
 * @param {string} [profile.first_name] - The user's first name
 * @param {string} [profile.full_name] - The user's full name
 * @param {Object} [profile.user_metadata] - Alternative metadata object
 * @param {string} [defaultName='User'] - Default name if none found
 * @returns {string} The first name or default
 * 
 * @example
 * getFirstName({ first_name: "John" }) // "John"
 * getFirstName({ full_name: "John Doe" }) // "John"
 * getFirstName({ user_metadata: { first_name: "John" } }) // "John"
 * getFirstName(null, "Guest") // "Guest"
 */
export function getFirstName(profile, defaultName = 'User') {
    if (!profile) {
        return defaultName;
    }

    // Try direct first_name property
    if (profile.first_name && typeof profile.first_name === 'string') {
        const firstName = profile.first_name.trim();
        if (firstName.length > 0) {
            return firstName;
        }
    }

    // Try user_metadata.first_name (for Supabase auth user objects)
    if (profile.user_metadata?.first_name && typeof profile.user_metadata.first_name === 'string') {
        const firstName = profile.user_metadata.first_name.trim();
        if (firstName.length > 0) {
            return firstName;
        }
    }

    // Try extracting from full_name
    if (profile.full_name && typeof profile.full_name === 'string') {
        const fullName = profile.full_name.trim();
        if (fullName.length > 0) {
            const firstName = fullName.split(' ')[0];
            if (firstName) {
                return firstName;
            }
        }
    }

    // Try extracting from user_metadata.full_name
    if (profile.user_metadata?.full_name && typeof profile.user_metadata.full_name === 'string') {
        const fullName = profile.user_metadata.full_name.trim();
        if (fullName.length > 0) {
            const firstName = fullName.split(' ')[0];
            if (firstName) {
                return firstName;
            }
        }
    }

    return defaultName;
}

/**
 * Generates a possessive title for a user (e.g., "Chris' Wishlist")
 * Combines getFirstName and getPossessiveName for convenience.
 * 
 * @param {Object} profile - The user profile object
 * @param {string} [suffix='Wishlist'] - The suffix to add after the possessive name
 * @param {string} [defaultTitle='My Wishlist'] - Default title if no name found
 * @returns {string} The possessive title
 * 
 * @example
 * getUserPossessiveTitle({ first_name: "Chris" }) // "Chris' Wishlist"
 * getUserPossessiveTitle({ full_name: "Bob Smith" }) // "Bob's Wishlist"
 * getUserPossessiveTitle(null) // "My Wishlist"
 */
export function getUserPossessiveTitle(profile, suffix = 'Wishlist', defaultTitle = 'My Wishlist') {
    const firstName = getFirstName(profile, null);

    if (!firstName) {
        return defaultTitle;
    }

    const possessive = getPossessiveName(firstName);
    return `${possessive} ${suffix}`;
}
