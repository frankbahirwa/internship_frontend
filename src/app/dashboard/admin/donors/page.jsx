'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Phone, Mail, Loader2, MapPin } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function AdminDonorsPage() {
    const { user } = useAuthStore();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchDonors = async () => {
            try {
                const res = await api.get('/admin/donors');
                setDonors(res.data);
            } catch (err) {
                console.error('Error fetching donors:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchDonors();
    }, [user]);

    const filteredDonors = donors.filter(d => {
        const matchesFilter = filter === 'ALL' || d.bloodType === filter;
        const matchesSearch = d.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
            d.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            d.user?.phone?.includes(search);
        return matchesFilter && matchesSearch;
    });

    const toggleStatus = async (donor) => {
        try {
            const newStatus = !donor.user.isActive;
            await api.patch(`/admin/users/${donor.user.id}/status`, { isActive: newStatus });
            setDonors(prev => prev.map(d =>
                d.id === donor.id
                    ? { ...d, user: { ...d.user, isActive: newStatus } }
                    : d
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update user status');
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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        Manage <span className="text-ruby">Donors</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        View registered donors and their activity.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 bg-obsidian-light rounded-xl px-4 py-2 border border-foreground/5">
                        <Search className="w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search donors..."
                            className="bg-transparent border-none outline-none text-sm w-48"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Blood Type Filter Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === 'ALL' ? 'bg-foreground text-obsidian border-foreground' : 'bg-white/5 border-white/10 text-foreground/60 hover:text-foreground'}`}
                >
                    View All
                </button>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === type ? 'bg-ruby text-white border-ruby' : 'bg-white/5 border-white/10 text-foreground/60 hover:text-ruby hover:border-ruby/30'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {filteredDonors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredDonors.map((donor, idx) => (
                                <motion.div
                                    key={donor.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="glass p-6 rounded-3xl border border-foreground/5 hover:border-ruby/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-obsidian-light rounded-full flex items-center justify-center border border-foreground/10 shrink-0">
                                                <span className="font-black text-ruby">{donor.bloodType}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg truncate max-w-[150px]">{donor.user?.username || 'Unknown'}</h3>
                                                <span className="text-xs text-foreground/40 flex items-center gap-1">
                                                    <Activity className="w-3 h-3" /> {donor.totalDonations} Donations
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(donor)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${donor.user?.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                                }`}
                                        >
                                            {donor.user?.isActive ? 'Active' : 'Banned'}
                                        </button>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-foreground/5">
                                        <div className="flex items-center gap-3 text-xs text-foreground/60">
                                            <Mail className="w-3.5 h-3.5 text-foreground/40" />
                                            <span className="truncate">{donor.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-foreground/60">
                                            <Phone className="w-3.5 h-3.5 text-foreground/40" />
                                            <span className="truncate">{donor.user?.phone || 'No phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-foreground/60">
                                            <MapPin className="w-3.5 h-3.5 text-foreground/40" />
                                            <span className="truncate">{donor.city || 'Location N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 flex items-center justify-between">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${donor.isMedicallyEligible ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20'}`}>
                                            {donor.isMedicallyEligible ? 'Eligible' : 'Not Certified'}
                                        </span>
                                        <span className="text-[10px] text-foreground/30 font-mono">
                                            ID: {donor.id.slice(0, 6)}...
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-foreground/10">
                            <p className="text-foreground/40 font-medium">No donors found matching criteria.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
