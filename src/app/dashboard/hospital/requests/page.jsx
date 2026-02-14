'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Clock, Users, CheckCircle, AlertOctagon, XCircle, Loader2, ChevronRight, Ban } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function HospitalRequestsPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/requests/my-requests');
                setRequests(res.data);
            } catch (err) {
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchRequests();
    }, [user]);

    const handleCancel = async (requestId) => {
        if (!confirm(t('dashboard.confirm_cancel_request'))) return;
        try {
            await api.patch(`/requests/${requestId}/cancel`);
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'CANCELLED' } : r));
        } catch (err) {
            console.error('Error cancelling request:', err);
            alert(t('dashboard.failed_cancel_request'));
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.bloodTypeNeeded.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filter === 'ALL' || req.status === filter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: requests.length,
        open: requests.filter(r => r.status === 'OPEN').length,
        fulfilled: requests.filter(r => r.status === 'FULFILLED').length,
        cancelled: requests.filter(r => r.status === 'CANCELLED').length,
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-ruby" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        {t('dashboard.manage_requests').split(' ')[0]} <span className="text-ruby">{t('dashboard.requests')}</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        {t('dashboard.manage_requests_desc')}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MiniStatCard
                    icon={Clock}
                    label={t('dashboard.active')}
                    value={stats.open}
                    cardColor="ruby"
                    description={t('dashboard.active_requests_desc')}
                />
                <MiniStatCard
                    icon={CheckCircle}
                    label={t('dashboard.fulfilled')}
                    value={stats.fulfilled}
                    cardColor="emerald"
                    description={t('dashboard.fulfilled_requests_desc')}
                />
                <MiniStatCard
                    icon={Ban}
                    label={t('dashboard.cancelled')}
                    value={stats.cancelled}
                    cardColor="amber"
                    description={t('dashboard.cancelled_requests_desc')}
                />
                <MiniStatCard
                    icon={Users}
                    label={t('dashboard.total')}
                    value={stats.total}
                    cardColor="blue"
                    description={t('dashboard.total_requests_desc')}
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                    <input
                        type="text"
                        placeholder={t('dashboard.search_by_id_desc')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-ruby/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto overflow-x-auto">
                    {['ALL', 'OPEN', 'FULFILLED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${filter === status ? 'bg-white text-obsidian shadow-lg' : 'text-foreground/40 hover:text-foreground hover:bg-white/5'}`}
                        >
                            {t(`dashboard.${status.toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests Table */}
            <div className="glass rounded-4xl border border-white/5 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/2 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{t('dashboard.reference_id')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{t('dashboard.type')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{t('dashboard.units')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{t('dashboard.urgency')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{t('dashboard.status')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-right">{t('dashboard.date')}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 text-center">{t('dashboard.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode='popLayout'>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req, idx) => (
                                        <motion.tr
                                            key={req.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/2 transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-xs text-foreground/50 group-hover:text-ruby transition-colors">#{req.id.slice(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${req.status === 'OPEN' ? 'bg-ruby/10 border-ruby/30 text-ruby' : 'bg-white/5 border-white/10 text-foreground/20'
                                                        }`}>
                                                        {req.bloodTypeNeeded}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold">{req.unitsNeeded} {t('dashboard.units')}</td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${req.urgencyLevel === 'CRITICAL' ? 'bg-ruby/5 text-ruby border-ruby/20' :
                                                    req.urgencyLevel === 'URGENT' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' :
                                                        'bg-blue-500/5 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {t(`dashboard.${req.urgencyLevel.toLowerCase()}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={req.status} t={t} />
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-xs text-foreground/40">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/dashboard/hospital/requests/${req.id}`}>
                                                        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-obsidian text-[10px] font-black uppercase tracking-tight rounded-lg hover:bg-ruby hover:text-white transition-all transform active:scale-95">
                                                            {t('dashboard.manage')}
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Link>
                                                    {req.status === 'OPEN' && (
                                                        <button
                                                            onClick={() => handleCancel(req.id)}
                                                            className="p-1.5 rounded-lg border border-white/5 text-foreground/20 hover:text-ruby hover:bg-ruby/10 hover:border-ruby/30 transition-all active:scale-90"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-20 text-center">
                                            <p className="text-foreground/40 font-medium tracking-wide">{t('dashboard.no_requests_matching')}</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, t }) {
    const styles = {
        OPEN: 'bg-ruby/10 text-ruby border-ruby/20',
        MATCHED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        FULFILLED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        CANCELLED: 'bg-white/5 text-foreground/30 border-white/5',
    };
    return (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight border ${styles[status]}`}>
            {t(`dashboard.${status.toLowerCase()}`)}
        </span>
    );
}

function MiniStatCard({ icon: Icon, label, value, cardColor, description }) {
    const colors = {
        ruby: 'text-ruby bg-ruby/10 border-ruby/20 shadow-ruby/5',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass p-5 rounded-3xl flex items-center justify-between group relative overflow-hidden transition-all duration-300 border-white/5"
        >
            <div className="flex flex-col gap-1 z-10">
                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tighter">{value}</span>
                </div>
                <p className="text-[10px] text-foreground/20 font-medium">{description}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${colors[cardColor]} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                <Icon className="w-6 h-6" />
            </div>

            {/* Subtle Gradient Glow */}
            <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity ${cardColor === 'ruby' ? 'bg-ruby' :
                cardColor === 'amber' ? 'bg-amber-500' :
                    cardColor === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
        </motion.div>
    );
}
