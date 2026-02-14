'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Activity, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function DonorProfilePage() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/donors/me');
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchProfile();
    }, [user]);

    const handleEligibilityUpdate = async (isEligible) => {
        setUpdating(true);
        try {
            const res = await api.patch('/donors/eligibility', { isEligible });
            setProfile(prev => ({ ...prev, isMedicallyEligible: isEligible, lastEligibilityCheck: new Date().toISOString() }));
            // Could add toast here
        } catch (err) {
            console.error('Error updating eligibility:', err);
            alert('Failed to update eligibility status.');
        } finally {
            setUpdating(false);
        }
    };

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
                    My <span className="text-ruby">Profile</span>
                </h1>
                <p className="text-foreground/50 font-medium mt-1">
                    Manage your personal information and health status.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-24 bg-linear-to-b from-ruby/20 to-transparent" />

                        <div className="w-32 h-32 rounded-full border-4 border-obsidian bg-obsidian-light flex items-center justify-center relative z-10 mb-4 shadow-xl">
                            <span className="text-4xl font-black text-ruby">{profile?.bloodType || '?'}</span>
                        </div>

                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/60">
                            {user?.username}
                        </h2>
                        <p className="text-sm text-foreground/40 font-medium mb-6">Blood Donor</p>

                        <div className="w-full space-y-4">
                            <InfoItem icon={Mail} text={user?.email} />
                            <InfoItem icon={Phone} text={user?.phone || 'No phone'} />
                            <InfoItem icon={MapPin} text={profile?.city || 'Location not set'} />
                        </div>
                    </div>
                </div>

                {/* Health & Eligibility */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-3xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Medical Eligibility
                            </h3>
                            {profile?.isMedicallyEligible ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Certified
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Not Certified
                                </span>
                            )}
                        </div>

                        <p className="text-foreground/60 leading-relaxed mb-6">
                            To ensure the safety of blood recipients, donors must self-certify their medical eligibility every 7 days. By certifying, you confirm you have no active infections, recent surgeries, or disqualifying conditions.
                        </p>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                            <h4 className="font-bold text-sm mb-2 text-foreground/80">Self-Check Questions:</h4>
                            <ul className="text-xs text-foreground/50 space-y-2 list-disc pl-4">
                                <li>Are you feeling well and healthy today?</li>
                                <li>Have you taken any antibiotics in the last 7 days?</li>
                                <li>Have you had a tattoo or piercing in the last 6 months?</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleEligibilityUpdate(true)}
                                disabled={updating || profile?.isMedicallyEligible}
                                className={`flex-1 py-3 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
                                    ${profile?.isMedicallyEligible
                                        ? 'bg-emerald-500/20 text-emerald-500 cursor-default ring-1 ring-emerald-500/30'
                                        : 'bg-emerald-500 text-obsidian hover:bg-emerald-400 shadow-emerald-500/20'}`}
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {profile?.isMedicallyEligible ? 'Certified' : 'I Am Eligible'}
                            </button>

                            {!profile?.isMedicallyEligible && (
                                <button className="px-6 py-3 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-colors text-foreground/40 hover:text-foreground">
                                    Learn More
                                </button>
                            )}
                        </div>

                        {profile?.lastEligibilityCheck && (
                            <p className="text-xs text-foreground/30 mt-4 text-center">
                                Last checked: {new Date(profile.lastEligibilityCheck).toLocaleDateString()}
                            </p>
                        )}
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
