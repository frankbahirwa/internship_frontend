'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Globe, User, Shield, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/common/LanguageSelector';

export default function ProfileSidebar({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        onClose(); // Close sidebar first
        router.push('/login');
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90"
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-obsidian border-l border-foreground/10 shadow-2xl z-100 flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-foreground/5">
                    <h2 className="text-xl font-bold">Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-foreground/5 rounded-xl transition-colors text-foreground/60 hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* User Card */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-linear-to-br from-ruby to-ruby-dark flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-ruby/20 mb-4 ring-4 ring-obsidian-light">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-obsidian" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">{user?.username}</h3>
                        <p className="text-sm text-foreground/40 mb-3">{user?.email || 'user@example.com'}</p>

                        <div className="flex items-center gap-2 bg-ruby/10 border border-ruby/20 px-3 py-1 rounded-full">
                            <Shield className="w-3 h-3 text-ruby" />
                            <span className="text-[10px] font-bold text-ruby uppercase tracking-widest">{user?.role}</span>
                        </div>
                    </div>

                    {/* Quick Settings */}
                    <div className="space-y-4">
                        <div className="bg-obsidian-light/50 rounded-2xl p-4 border border-foreground/5 space-y-4">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                <Globe className="w-4 h-4 text-ruby" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{t('common.language')}</span>
                            </div>
                            <LanguageSelector variant="list" />
                            <div className="h-px bg-foreground/5 mx-2" />
                            <MenuItem icon={User} title={t('common.edit_profile')} subtitle={t('common.update_details')} hasArrow />
                            <div className="h-px bg-foreground/5 mx-2" />
                            <MenuItem icon={Shield} title={t('common.security')} subtitle={t('common.security_desc')} hasArrow />
                        </div>
                    </div>

                    {/* Stats or Info */}
                    <div className="p-4 rounded-2xl bg-linear-to-br from-ruby/5 to-transparent border border-ruby/10">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-ruby shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Impact Level 1</h4>
                                <p className="text-xs text-foreground/50 leading-relaxed">
                                    Your account is verified and active. Complete 3 more donations to reach Level 2 LifeSaver status.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-foreground/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-ruby/20 text-ruby font-bold hover:bg-ruby hover:text-white transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Log Out
                    </button>
                    <p className="text-center text-[10px] text-foreground/20 mt-4 uppercase tracking-widest">
                        LifeLine v1.0.2 • Connected
                    </p>
                </div>
            </motion.div>
        </>
    );
}

function MenuItem({ icon: Icon, title, subtitle, value, hasArrow }) {
    return (
        <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/5 transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-obsidian flex items-center justify-center border border-foreground/5 text-foreground/40 group-hover:text-ruby group-hover:border-ruby/20 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm group-hover:text-white transition-colors">{title}</p>
                <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">{subtitle}</p>
            </div>
            {value && (
                <span className="text-xs font-bold bg-foreground/10 px-2 py-1 rounded-lg text-foreground/60">{value}</span>
            )}
            {hasArrow && (
                <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/60 group-hover:translate-x-1 transition-all" />
            )}
        </button>
    );
}
