/**
 * Utility functions for handling user names and formatting.
 */

import { DEFAULTS } from '../constants';
import type { Profile } from '../types';

const UNKNOWN_INITIAL = DEFAULTS.DEFAULT_INITIALS;

export function getPossessiveName(name: string): string {
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

export function getInitials(name: string): string {
    if (!name || typeof name !== 'string') {
        return UNKNOWN_INITIAL;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        return UNKNOWN_INITIAL;
    }

    return trimmedName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

type ProfileLike = Partial<Pick<Profile, 'first_name' | 'full_name'>> & {
    user_metadata?: {
        first_name?: string;
        full_name?: string;
    };
};

export function getFirstName(profile?: ProfileLike | null, defaultName: string = DEFAULTS.DEFAULT_NAME): string {
    if (!profile) {
        return defaultName;
    }

    if (profile.first_name && typeof profile.first_name === 'string') {
        const firstName = profile.first_name.trim();
        if (firstName.length > 0) {
            return firstName;
        }
    }

    if (profile.user_metadata?.first_name && typeof profile.user_metadata.first_name === 'string') {
        const firstName = profile.user_metadata.first_name.trim();
        if (firstName.length > 0) {
            return firstName;
        }
    }

    if (profile.full_name && typeof profile.full_name === 'string') {
        const fullName = profile.full_name.trim();
        if (fullName.length > 0) {
            const firstName = fullName.split(' ')[0];
            if (firstName) {
                return firstName;
            }
        }
    }

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

export function getUserPossessiveTitle(
    profile?: ProfileLike | null,
    suffix = 'Wishlist',
    defaultTitle = 'My Wishlist',
): string {
    const firstName = getFirstName(profile, '');

    if (!firstName) {
        return defaultTitle;
    }

    const possessive = getPossessiveName(firstName);
    return `${possessive} ${suffix}`;
}


