'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, XCircle, CheckCircle2, MoreHorizontal, Filter, Loader2, Building2, MapPin } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function AdminHospitalsPage() {
    const { user } = useAuthStore();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const res = await api.get('/admin/hospitals');
                setHospitals(res.data);
            } catch (err) {
                console.error('Error fetching hospitals:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchHospitals();
    }, [user]);

    const handleVerify = async (id, status) => {
        try {
            await api.patch(`/admin/hospitals/${id}/verify`, { status });
            setHospitals(prev => prev.map(h => h.id === id ? { ...h, verificationStatus: status } : h));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const toggleStatus = async (hospital) => {
        try {
            const newStatus = !hospital.user.isActive;
            await api.patch(`/admin/users/${hospital.user.id}/status`, { isActive: newStatus });
            setHospitals(prev => prev.map(h =>
                h.id === hospital.id
                    ? { ...h, user: { ...h.user, isActive: newStatus } }
                    : h
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update user status');
        }
    };

    const filteredHospitals = hospitals.filter(h => {
        const matchesFilter = filter === 'ALL' || h.verificationStatus === filter;
        const matchesSearch = h.hospitalName?.toLowerCase().includes(search.toLowerCase()) ||
            h.user?.username?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
                        Manage <span className="text-ruby">Hospitals</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        Oversee hospital registrations and verifications.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 bg-obsidian-light rounded-xl px-4 py-2 border border-foreground/5">
                        <Search className="w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search hospitals..."
                            className="bg-transparent border-none outline-none text-sm w-48"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                        {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === status ? 'bg-foreground text-obsidian shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {filteredHospitals.length > 0 ? (
                        filteredHospitals.map((hospital, idx) => (
                            <motion.div
                                key={hospital.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass p-6 rounded-3xl border border-foreground/5 hover:border-ruby/30 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center group"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-obsidian-light rounded-xl flex items-center justify-center border border-foreground/10 shrink-0">
                                        <Building2 className="w-6 h-6 text-foreground/30" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">{hospital.hospitalName || hospital.user?.username}</h3>
                                            <StatusBadge status={hospital.verificationStatus} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/40">
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> License: {hospital.licenseNumber}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {hospital.city}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {hospital.verificationStatus === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleVerify(hospital.id, 'VERIFIED')}
                                                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 text-xs"
                                            >
                                                <CheckCircle2 className="w-3 h-3" /> Verify
                                            </button>
                                            <button
                                                onClick={() => handleVerify(hospital.id, 'REJECTED')}
                                                className="px-4 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-xs"
                                            >
                                                <XCircle className="w-3 h-3" /> Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => toggleStatus(hospital)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${hospital.user?.isActive
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                            }`}
                                    >
                                        {hospital.user?.isActive ? 'Active' : 'Banned'}
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-foreground/10">
                            <p className="text-foreground/40 font-medium">No hospitals found matching criteria.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        VERIFIED: 'bg-emerald-500 text-white ring-emerald-500/20',
        PENDING: 'bg-amber-500 text-white ring-amber-500/20',
        REJECTED: 'bg-red-500 text-white ring-red-500/20',
        UNVERIFIED: 'bg-foreground/20 text-foreground/40 ring-foreground/5',
    };
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ${styles[status]}`}>
            {status}
        </span>
    );
}
