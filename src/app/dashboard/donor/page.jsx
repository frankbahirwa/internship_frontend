'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Calendar, Award, Droplets, MapPin, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function DonorDashboard() {
    const { user } = useAuthStore();
    const [donorProfile, setDonorProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch donor profile, report stats, and relevant requests
                const [profileRes, statsRes, matchesRes] = await Promise.all([
                    api.get('/donors/me'),
                    api.get('/reports/donor'),
                    api.get('/requests?status=OPEN'),
                ]);

                setDonorProfile(profileRes.data);
                setStats(statsRes.data);

                // Filter matches based on blood type if available
                let relevantMatches = matchesRes.data;
                if (profileRes.data?.bloodType) {
                    // Simple matching logic: exact match or compatible (can be expanded)
                    // For now, let's show all open requests but highlight matches
                }
                setMatches(relevantMatches.slice(0, 3)); // Show top 3
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-ruby" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        Hello, <span className="text-ruby">{user?.username}</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        Here's your impact overview for today.
                    </p>
                </div>
                <Link href="/dashboard/donor/requests">
                    <button className="flex items-center gap-2 px-6 py-3 bg-foreground text-obsidian font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-lg shadow-white/5">
                        <Heart className="w-4 h-4 fill-ruby text-ruby" />
                        Donate Now
                    </button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={Droplets}
                    label="Total Impact"
                    value={donorProfile?.totalDonations || 0}
                    unit="Donations"
                    subText={stats?.impact || 'Start your journey'}
                    color="ruby"
                />
                <StatCard
                    icon={Activity}
                    label="Eligibility"
                    value={donorProfile?.isMedicallyEligible ? "Eligible" : "Pending"}
                    unit=""
                    subText={donorProfile?.isMedicallyEligible ? "Certified & Ready" : "Action Required"}
                    color={donorProfile?.isMedicallyEligible ? "emerald" : "orange"}
                    status={donorProfile?.isMedicallyEligible ? "online" : "offline"}
                />
                <StatCard
                    icon={Calendar}
                    label="Last Donation"
                    value={donorProfile?.lastDonationDate ? new Date(donorProfile.lastDonationDate).toLocaleDateString() : 'None'}
                    unit=""
                    subText={donorProfile?.lastDonationDate ? "90 days cooldown active" : "Ready for first donation"}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Matches */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between pb-2 border-b border-foreground/5">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Heart className="w-5 h-5 text-ruby fill-ruby" />
                            Urgent Matches
                        </h2>
                        <Link href="/dashboard/donor/requests" className="text-xs font-bold text-ruby hover:text-ruby-light flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {matches.length > 0 ? (
                            matches.map((match, idx) => (
                                <MatchCard key={match.id} match={match} index={idx} currentUserBloodType={donorProfile?.bloodType} />
                            ))
                        ) : (
                            <div className="glass rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/20">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <p className="text-foreground/40 font-medium">No urgent requests at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel: Tips & Health */}
                <div className="space-y-8">
                    <div className="pb-2 border-b border-foreground/5">
                        <h2 className="text-xl font-bold">Preparation</h2>
                    </div>

                    <div className="space-y-4">
                        <TipCard
                            icon={Droplets}
                            title="Hydrate well"
                            text="Drink 500ml of water 30 mins before donation."
                        />
                        <TipCard
                            icon={CheckCircle2}
                            title="Iron-rich Diet"
                            text="Eat spinach or lean meat the day before."
                        />
                        <TipCard
                            icon={AlertCircle}
                            title="Rest Up"
                            text="Avoid intense exercise for 24 hours after."
                        />
                    </div>

                    {/* Eligibility CTA */}
                    {!donorProfile?.isMedicallyEligible && (
                        <div className="glass rounded-2xl p-6 border-ruby/20 bg-ruby/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold">Eligibility Check</h3>
                                    <p className="text-xs text-foreground/60 mt-1">Required to donate</p>
                                </div>
                                <div className="px-2 py-1 rounded bg-ruby/10 text-ruby text-[10px] font-bold uppercase">
                                    Action Needed
                                </div>
                            </div>
                            <Link href="/dashboard/donor/profile">
                                <button className="w-full py-3 bg-ruby text-white text-xs font-bold rounded-xl hover:bg-ruby-dark transition-colors shadow-lg shadow-ruby/20">
                                    Complete Certification
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, subText, color, status }) {
    const colorMap = {
        ruby: 'text-ruby bg-ruby/10 border-ruby/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="glass p-5 rounded-2xl flex items-center justify-between group relative overflow-hidden"
        >
            <div className="flex flex-col gap-1 z-10">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{value}</span>
                    {unit && <span className="text-xs font-medium text-foreground/60">{unit}</span>}
                </div>
                <p className="text-xs text-foreground/40 mt-1 flex items-center gap-1">
                    {subText}
                </p>
            </div>

            <div className={`p-4 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
            </div>

            {status === "online" && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
        </motion.div>
    );
}

function MatchCard({ match, index, currentUserBloodType }) {
    const urgencyColors = {
        CRITICAL: 'text-ruby border-ruby/30 bg-ruby/5',
        URGENT: 'text-orange-500 border-orange-500/30 bg-orange-500/5',
        NORMAL: 'text-blue-500 border-blue-500/30 bg-blue-500/5',
    };

    const isMatch = currentUserBloodType === match.bloodTypeNeeded; // Simplify for now

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="glass p-6 rounded-3xl border-l-[6px] border-l-ruby group relative overflow-hidden"
        >
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-ruby/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-ruby/10 transition-colors" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-obsidian-light/80 rounded-2xl flex items-center justify-center border border-foreground/10 shrink-0 shadow-inner">
                        <span className="text-2xl font-black text-ruby">{match.bloodTypeNeeded}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{match.hospital?.username || 'A Hospital'}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyColors[match.urgencyLevel]}`}>
                                {match.urgencyLevel}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-foreground/50">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {match.hospital?.city || match.city || 'Kigali'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {match.unitsNeeded} Units Required
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/donor/requests" className="w-full md:w-auto">
                        <button className="w-full md:w-auto px-6 py-2.5 bg-ruby text-white text-sm font-bold rounded-xl hover:bg-ruby-dark transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-ruby/20">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function TipCard({ icon: Icon, title, text }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl hover:bg-foreground/5 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-obsidian-light border border-foreground/10 flex items-center justify-center text-foreground/40 group-hover:text-ruby group-hover:border-ruby/30 transition-all">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-foreground/90">{title}</h4>
                <p className="text-xs text-foreground/50 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}
