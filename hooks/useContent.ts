
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
    // Generic Medical Facility / Reception
    hero_image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000&h=800',
    // Generic Doctor / Staff images
    about_team_1: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400', 
    about_team_2: 'https://images.unsplash.com/photo-1516574187841-69301976e495?auto=format&fit=crop&q=80&w=400&h=400', 
    about_team_3: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=400', 
    about_team_4: 'https://images.unsplash.com/photo-1584982751601-97dcc096657c?auto=format&fit=crop&q=80&w=400&h=400', 
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
