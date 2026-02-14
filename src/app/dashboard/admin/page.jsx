'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Droplets, Activity, Check, X, Search, Loader2, Award, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalDonors: 0, totalHospitals: 0, totalRequests: 0, activeUsers: 0 });
    const [pendingHospitals, setPendingHospitals] = useState([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/hospitals/pending'),
                ]);
                setStats(statsRes.data);
                setPendingHospitals(pendingRes.data);
            } catch (err) {
                console.error('Error fetching admin data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleVerify = async (id, status) => {
        try {
            await api.patch(`/admin/hospitals/${id}/verify`, { status });
            setPendingHospitals(prev => prev.filter(h => h.id !== id));
            // Update stats
            if (status === 'VERIFIED') setStats(s => ({ ...s, totalHospitals: s.totalHospitals + 1 }));
        } catch (err) {
            alert('Verification action failed');
        }
    };

    return (
        <div className="space-y-8 pb-12">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AdminStat icon={Users} label="Total Donors" value={stats.totalDonors} trend="+12% this month" />
                <AdminStat icon={ShieldCheck} label="Verified Hospitals" value={stats.totalHospitals} trend="+3 new" />
                <AdminStat icon={Droplets} label="Blood Requests" value={stats.totalRequests} trend="98% Match Rate" />
                <AdminStat icon={Activity} label="Active Sessions" value={stats.activeUsers} trend="Live" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-white">
                {/* Verification Queue */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Award className="w-5 h-5 text-ruby" />
                            Verification Queue
                        </h2>
                        <div className="flex items-center gap-2 bg-obsidian-light rounded-xl px-4 py-2 border border-foreground/5">
                            <Search className="w-4 h-4 text-foreground/40" />
                            <input type="text" placeholder="Search facilities..." className="bg-transparent border-none outline-none text-xs w-48" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-ruby" /></div>
                        ) : pendingHospitals.length > 0 ? (
                            pendingHospitals.map((hospital, idx) => (
                                <VerificationCard
                                    key={hospital.id}
                                    hospital={hospital}
                                    index={idx}
                                    onAction={handleVerify}
                                />
                            ))
                        ) : (
                            <div className="glass rounded-3xl p-16 text-center border-dashed border-2 border-foreground/5 bg-emerald-500/5">
                                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold mb-1">Queue Empty</h3>
                                <p className="text-sm text-foreground/40">All medical facilities are currently verified. No pending actions.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Global Trends */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">System Health</h2>
                    <div className="glass rounded-3xl p-6 border-foreground/5 space-y-6">
                        <TrendItem label="Matching Efficiency" value="94%" color="ruby" />
                        <TrendItem label="Fulfillment Velocity" value="2.4 Hrs" color="blue" />
                        <TrendItem label="Network Expansion" value="Good" color="emerald" />
                        <div className="pt-6 border-t border-foreground/5">
                            <div className="flex items-center gap-2 text-foreground/40 text-xs mb-4">
                                <Clock className="w-4 h-4" /> Last system audit: 15 mins ago
                            </div>
                            <button className="w-full py-3 bg-obsidian-light border border-foreground/10 rounded-2xl text-xs font-bold hover:bg-ruby hover:border-ruby transition-all">
                                Run Full Diagnostics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminStat({ icon: Icon, label, value, trend }) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="glass p-5 rounded-2xl flex items-center justify-between group relative overflow-hidden"
        >
            <div className="flex flex-col gap-1 z-10">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{value}</span>
                </div>
                <span className="text-[10px] font-bold text-ruby uppercase">{trend}</span>
            </div>

            <div className="p-4 rounded-xl border border-ruby/20 bg-ruby/5 text-ruby group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-8 h-8" />
            </div>
        </motion.div>
    );
}

function VerificationCard({ hospital, index, onAction }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-ruby/30 transition-all border border-foreground/5 group"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-obsidian-light border border-foreground/10 rounded-2xl flex items-center justify-center group-hover:bg-ruby/10 transition-colors">
                    <Users className="w-6 h-6 text-foreground/30 group-hover:text-ruby" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{hospital.hospitalName || 'New Hospital'}</h3>
                    <p className="text-xs text-foreground/40 flex items-center gap-2">
                        License: <span className="text-ruby font-medium">{hospital.licenseNumber}</span>
                        <span className="w-1 h-1 rounded-full bg-foreground/20" />
                        Contact: {hospital.emergencyContactNumber}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onAction(hospital.id, 'REJECTED')}
                    className="p-3 rounded-xl border border-ruby/20 text-ruby hover:bg-ruby hover:text-white transition-all"
                    title="Reject"
                >
                    <X className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onAction(hospital.id, 'VERIFIED')}
                    className="flex-1 md:flex-none px-8 py-3 bg-ruby text-white font-bold rounded-xl shadow-lg shadow-ruby/20 hover:bg-ruby-dark transition-all flex items-center gap-2"
                >
                    <Check className="w-5 h-5" />
                    Verify Facility
                </button>
            </div>
        </motion.div>
    );
}

function TrendItem({ label, value, color }) {
    const colorMap = {
        ruby: 'bg-ruby',
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
    };
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-foreground/40 uppercase tracking-tighter">{label}</span>
                <span className="text-foreground/90">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-obsidian-light rounded-full overflow-hidden border border-foreground/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className={`h-full ${colorMap[color]}`}
                />
            </div>
        </div>
    );
}
