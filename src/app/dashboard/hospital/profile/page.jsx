'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { useTranslation } from 'react-i18next';

export default function HospitalProfilePage() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/hospitals/me');
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-ruby" />
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full pb-12">
            <div>
                <h1 className="text-3xl font-black text-foreground">
                    {t('dashboard.hospital').split(' ')[0]} <span className="text-ruby">{t('dashboard.profile')}</span>
                </h1>
                <p className="text-foreground/50 font-medium mt-1">
                    {t('dashboard.hospital_profile_desc')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-24 bg-linear-to-b from-ruby/20 to-transparent" />

                        <div className="w-32 h-32 rounded-3xl border-4 border-obsidian bg-obsidian-light flex items-center justify-center relative z-10 mb-4 shadow-xl">
                            <Building2 className="w-16 h-16 text-ruby" />
                        </div>

                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/60">
                            {profile?.hospitalName || user?.username}
                        </h2>
                        <p className="text-sm text-foreground/40 font-medium mb-6">{t('dashboard.medical_institution')}</p>

                        <div className="w-full space-y-4">
                            <InfoItem icon={Mail} text={user?.email} />
                            <InfoItem icon={Phone} text={user?.phone || t('dashboard.no_phone')} />
                            <InfoItem icon={MapPin} text={profile?.city || t('dashboard.location_not_set')} />
                        </div>
                    </div>
                </div>

                {/* Verification Status */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-3xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                {t('dashboard.account_status')}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                {t('dashboard.verified_partner')}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-sm font-bold opacity-80">{t('dashboard.license_id')}</p>
                                    <p className="text-xs opacity-40">{t('dashboard.moh_registration')}</p>
                                </div>
                                <span className="font-mono text-sm bg-black/20 px-3 py-1 rounded">
                                    {profile?.licenseNumber || t('dashboard.not_provided')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-sm font-bold opacity-80">{t('dashboard.director_name')}</p>
                                    <p className="text-xs opacity-40">{t('dashboard.responsible_party')}</p>
                                </div>
                                <span className="font-medium text-sm">
                                    {profile?.directorName || t('dashboard.not_provided')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h4 className="font-bold mb-4">{t('dashboard.verification_documents')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                                    <Building2 className="w-8 h-8 opacity-20" />
                                    <span className="text-xs opacity-40">{t('dashboard.operating_license')}</span>
                                </div>
                                <div className="p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                                    <ShieldCheck className="w-8 h-8 opacity-20" />
                                    <span className="text-xs opacity-40">{t('dashboard.moh_certificate')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-foreground/70">
            <Icon className="w-4 h-4 text-ruby opacity-80" />
            <span className="truncate">{text}</span>
        </div>
    );
}
