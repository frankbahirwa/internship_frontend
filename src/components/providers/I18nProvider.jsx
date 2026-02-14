'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

export function I18nProvider({ children }) {
    useEffect(() => {
        // Force lang attribute on html tag
        const updateLangAttribute = (lng) => {
            document.documentElement.lang = lng.toLowerCase();
        };

        updateLangAttribute(i18n.language);

        i18n.on('languageChanged', updateLangAttribute);

        return () => {
            i18n.off('languageChanged', updateLangAttribute);
        };
    }, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
