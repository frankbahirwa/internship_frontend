'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, TrendingUp, Users, Heart, Loader2, Clock, CheckCircle, ShieldCheck, Droplets } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function AdminReportsPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/admin');
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
                        System <span className="text-ruby">Analytics</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        Comprehensive overview of the blood donation ecosystem.
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    icon={Users}
                    label="Active Users"
                    value={stats?.systemHealth?.activeUsers || 0}
                    color="blue"
                />
                <ReportCard
                    icon={ShieldCheck}
                    label="Verified Hospitals"
                    value={stats?.systemHealth?.verifiedHospitals || 0}
                    color="emerald"
                />
                <ReportCard
                    icon={Droplets}
                    label="Total Donations"
                    value={stats?.donationTrends?.successfulDonations || 0}
                    color="ruby"
                />
                <ReportCard
                    icon={Activity}
                    label="Efficiency Score"
                    value={`${stats?.systemHealth?.systemEfficiency || 95}%`}
                    color="amber"
                />
            </div>

            {/* Detailed Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic / User Growth */}
                <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            User Growth & Activity
                        </h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-foreground/5 pb-4">
                        {/* Mock Trend Data */}
                        {[20, 35, 40, 30, 55, 65, 50, 70, 60, 85, 90, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-500/10 rounded-t-lg relative transition-all group-hover:bg-blue-500/20" style={{ height: `${h}%` }}>
                                    <div className="absolute top-0 inset-x-0 h-1 bg-blue-500/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-ruby" />
                        System Health
                    </h3>

                    <HealthMetric label="API Latency" value="45ms" status="good" />
                    <HealthMetric label="Database Load" value="12%" status="good" />
                    <HealthMetric label="Failed Requests" value="0.2%" status="good" />
                    <HealthMetric label="Storage Usage" value="45%" status="warning" />
                </div>
            </div>

            {/* Recent Alerts Table (Placeholder) */}
            <div className="glass rounded-3xl overflow-hidden border border-foreground/5">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold text-lg">System Alerts</h3>
                </div>
                <div className="p-8 text-center text-foreground/40 text-sm">
                    No critical system alerts in the last 24 hours.
                </div>
            </div>
        </div>
    );
}

function ReportCard({ icon: Icon, label, value, color }) {
    const colorMap = {
        ruby: 'text-ruby bg-ruby/10 border-ruby/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
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
                <span className="font-black text-4xl text-foreground/90 group-hover:text-white transition-colors">
                    {value}
                </span>
            </div>

            <div className={`absolute inset-0 bg-linear-to-br from-transparent to-${color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
}

function HealthMetric({ label, value, status }) {
    const colors = {
        good: 'bg-emerald-500',
        warning: 'bg-amber-500',
        critical: 'bg-ruby',
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-foreground/60 font-medium">{label}</span>
            <div className="flex items-center gap-3">
                <span className="font-mono font-bold">{value}</span>
                <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
            </div>
        </div>
    );
}
