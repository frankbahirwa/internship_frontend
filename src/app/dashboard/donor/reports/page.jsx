'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, TrendingUp, Users, Heart, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function DonorReportsPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/donor');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchReports();
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
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        Impact <span className="text-ruby">Reports</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        See how your donations are changing lives.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Total Donations</p>
                    <p className="text-4xl font-black text-ruby">{stats?.donorProfile?.totalDonations || 0}</p>
                </div>
            </div>

            {/* Impact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    icon={Heart}
                    label="Lives Saved"
                    value={stats?.impact?.livesSaved || (stats?.donorProfile?.totalDonations * 3) || 0}
                    color="ruby"
                />
                <ReportCard
                    icon={Users}
                    label="Community Reach"
                    value={stats?.impact?.communityReach || (stats?.donorProfile?.totalDonations * 5) || 0}
                    color="blue"
                />
                <ReportCard
                    icon={Activity}
                    label="Health Check"
                    value="Excellent"
                    color="emerald"
                    isText
                />
                <ReportCard
                    icon={TrendingUp}
                    label="Next Milestone"
                    value="Bronze"
                    color="orange"
                    isText
                />
            </div>

            {/* Detailed Chart Area (Placeholder for now) */}
            <div className="glass p-8 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-foreground/50" />
                        Donation History
                    </h3>
                    <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-ruby/50 transition-colors">
                        <option>Last 12 Months</option>
                        <option>All Time</option>
                    </select>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {/* Mock Bars */}
                    {[30, 45, 20, 60, 40, 75, 50, 65, 30, 80, 55, 90].map((height, i) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-lg relative group transition-all hover:bg-ruby/20" style={{ height: `${height}%` }}>
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-ruby/30 group-hover:bg-ruby transition-colors" />
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-obsidian text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
                                {height} Units
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-foreground/30 font-bold uppercase tracking-widest px-2">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ icon: Icon, label, value, color, isText }) {
    const colorMap = {
        ruby: 'text-ruby bg-ruby/10 border-ruby/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl border-b border-l ${colorMap[color]}`}>
                <Icon className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest relative z-10">{label}</span>

            <div className="relative z-10">
                <span className={`font-black ${isText ? 'text-2xl' : 'text-4xl'} text-foreground/90 group-hover:text-white transition-colors`}>
                    {value}
                </span>
            </div>

            <div className={`absolute inset-0 bg-linear-to-br from-transparent to-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
}
