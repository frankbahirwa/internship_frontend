'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, TrendingUp, Users, Heart, Loader2, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { useTranslation } from 'react-i18next';

export default function HospitalReportsPage() {
    const { t } = useTranslation();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/hospital');
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
                        {t('dashboard.performance_reports').split(' ')[0]} <span className="text-ruby">{t('dashboard.reports')}</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        {t('dashboard.performance_reports_desc')}
                    </p>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    icon={Activity}
                    label={t('dashboard.total_requests_stat')}
                    value={stats?.requestStats?.totalRequests || 0}
                    color="blue"
                />
                <ReportCard
                    icon={CheckCircle}
                    label={t('dashboard.fulfilled_stat')}
                    value={stats?.requestStats?.fulfilledRequests || 0}
                    color="emerald"
                />
                <ReportCard
                    icon={Clock}
                    label={t('dashboard.avg_fulfillment_time')}
                    value={`${stats?.performance?.avgFulfillmentTimeHours || 0}h`}
                    color="amber"
                />
                <ReportCard
                    icon={Users}
                    label={t('dashboard.donors_engaged')}
                    value={stats?.performance?.totalDonorsEngaged || 0}
                    color="ruby"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fulfillment Trend */}
                <div className="glass p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            {t('dashboard.efficiency_trends')}
                        </h3>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-2 border-b border-foreground/5 pb-4">
                        {/* Mock Trend Data - In real app, map from historical data */}
                        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full bg-emerald-500/10 rounded-t-lg relative transition-all group-hover:bg-emerald-500/20" style={{ height: `${h}%` }}>
                                    <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/50" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-foreground/30">{t('dashboard.day')} {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blood Type Demand */}
                <div className="glass p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-ruby" />
                            {t('dashboard.blood_type_demand')}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {['O+', 'A+', 'B+', 'AB+'].map((type, i) => (
                            <div key={type} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/50">
                                    <span>{type}</span>
                                    <span>{85 - (i * 15)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-ruby rounded-full"
                                        style={{ width: `${85 - (i * 15)}%`, opacity: 1 - (i * 0.15) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
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
