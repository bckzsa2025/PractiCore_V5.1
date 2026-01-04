
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { apiClient } from '../libs/api';

// Keys for the CMS
export type ContentKey = 
    | 'hero_image' 
    | 'about_team_1' 
    | 'about_team_2' 
    | 'about_team_3' 
    | 'about_team_4'
    | 'admin_logo';

const DEFAULTS: Record<ContentKey, string> = {
    hero_image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1000&h=800',
    about_team_1: '/about_01.jpg', 
    about_team_2: '/about_02.jpg', 
    about_team_3: '/about_03.jpg', 
    about_team_4: '/about_04.jpg', 
    admin_logo: '' 
};

/**
 * Hook to get a dynamic image URL from IndexedDB (Persistent).
 */
export const useContent = (key: ContentKey) => {
    const [url, setUrl] = useState<string>(DEFAULTS[key]);

    useEffect(() => {
        let isMounted = true;

        const fetchContent = async () => {
            try {
                const storedValue = await apiClient.content.get(key);
                if (isMounted && storedValue) {
                    setUrl(storedValue);
                }
            } catch (e) {
                console.warn("Failed to fetch content for key:", key);
            }
        };

        // Initial fetch
        fetchContent();

        // Listen for updates (Triggered by Admin Upload)
        const handleUpdate = () => {
            fetchContent();
        };

        window.addEventListener('local-cms-update', handleUpdate);

        return () => {
            isMounted = false;
            window.removeEventListener('local-cms-update', handleUpdate);
        };
    }, [key]);

    return url;
};

/**
 * Helper to update content (calls API, which writes to IDB and dispatches event)
 */
export const updateContent = async (key: ContentKey, value: string) => {
    await apiClient.content.upload(key, value);
};
