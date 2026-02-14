'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector({ variant = 'dropdown' }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'RW', name: 'Kinyarwanda' },
        { code: 'EN', name: 'English' },
        { code: 'SW', name: 'Kiswahili' },
        { code: 'FR', name: 'French' }
    ];

    // Resources in config.js use uppercase keys (EN, FR, SW, RW)
    const currentLang = i18n.language.toUpperCase();
    const selectedLang = languages.find(l => l.code === currentLang) || languages[1];

    const handleLanguageChange = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    if (variant === 'list') {
        return (
            <div className="space-y-1">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all text-left ${selectedLang.code === lang.code ? 'bg-ruby/10 border-l-2 border-ruby' : 'hover:bg-white/5'}`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLang.code === lang.code ? 'text-ruby' : 'text-foreground/40'}`}>
                            {lang.name}
                        </span>
                        {selectedLang.code === lang.code && (
                            <div className="w-1.5 h-1.5 rounded-full bg-ruby animate-pulse" />
                        )}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            <motion.button
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl transition-all"
            >
                <Globe className="w-4 h-4 text-ruby" />
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">{selectedLang.code}</span>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-obsidian-light rounded-2xl border border-ruby/20 shadow-2xl z-2000 overflow-hidden p-1"
                    >
                        {languages.map((lang) => (
                            <motion.button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', x: 4 }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${selectedLang.code === lang.code ? 'bg-ruby/10 border-l-2 border-ruby' : ''}`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLang.code === lang.code ? 'text-ruby' : 'text-white/60'}`}>
                                    {lang.name}
                                </span>
                                {selectedLang.code === lang.code && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-ruby animate-pulse" />
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
