'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Activity, Users, CheckCircle, Clock, ChevronRight, Loader2, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-obsidian-light/50 backdrop-blur-md rounded-3xl animate-pulse flex items-center justify-center border border-white/5">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-ruby" />
                <span className="text-[10px] font-black text-ruby uppercase tracking-[0.2em]">Synchronizing Grid</span>
            </div>
        </div>
    )
});

export default function HospitalDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hospitalProfile, setHospitalProfile] = useState(null);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState('DASHBOARD'); // DASHBOARD or MAP
    const [mapData, setMapData] = useState({ donors: [], hospitals: [] });

    useEffect(() => {
        const fetchHospitalData = async () => {
            try {
                const [profileRes, reportsRes, requestsRes, donorsRes, hospitalsRes] = await Promise.all([
                    api.get('/hospitals/me'),
                    api.get('/reports/hospital'),
                    api.get('/requests/my-requests'),
                    api.get('/donors'),
                    api.get('/hospitals'),
                ]);

                setHospitalProfile(profileRes.data);
                setStats(reportsRes.data);
                setRequests(requestsRes.data);
                setMapData({
                    donors: donorsRes.data.map(d => ({ donor: d })), // Map to match component expectations if needed
                    hospitals: hospitalsRes.data
                });
            } catch (err) {
                console.error('Error fetching hospital data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchHospitalData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-ruby" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        Hospital <span className="text-ruby">Command Center</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        Overview for {hospitalProfile?.hospitalName || user?.username}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                        <button
                            onClick={() => setViewMode('DASHBOARD')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'DASHBOARD' ? 'bg-white text-obsidian' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MAP' ? 'bg-white text-obsidian' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            Map View
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-primary flex items-center gap-2 group shadow-ruby/30"
                    >
                        <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
                            <Plus className="w-4 h-4" />
                        </div>
                        Post Emergency Request
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'DASHBOARD' ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <MiniStat
                                cardColor="ruby"
                                icon={Activity}
                                label="Active Requests"
                                value={stats?.requestStats?.totalRequests || 0}
                            />
                            <MiniStat
                                cardColor="amber"
                                icon={Clock}
                                label="Avg Fulfillment"
                                value={`${stats?.performance?.avgFulfillmentTimeHours || 0}h`}
                            />
                            <MiniStat
                                cardColor="emerald"
                                icon={CheckCircle}
                                label="Fulfilled"
                                value={stats?.requestStats?.fulfilledRequests || 0}
                            />
                            <MiniStat
                                cardColor="blue"
                                icon={Users}
                                label="Donors Engaged"
                                value={stats?.performance?.totalDonorsEngaged || 0}
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Main Content: Requests List */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-xl font-bold">Recent Requests</h2>
                                    <Link href="/dashboard/hospital/requests" className="text-xs font-bold text-ruby hover:text-ruby-light flex items-center gap-1 transition-colors">
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {requests.length > 0 ? (
                                        requests.slice(0, 5).map((req, idx) => (
                                            <RequestItem key={req.id} request={req} index={idx} />
                                        ))
                                    ) : (
                                        <EmptyState message="No blood requests found. Create your first emergency post to start receiving responses." />
                                    )}
                                </div>
                            </div>

                            {/* Sidebar: Real-time Activity Feed */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Live Response Feed</h2>
                                <div className="glass rounded-3xl p-6 min-h-[400px] border-foreground/5">
                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-2 h-full">
                                            <Activity className="w-6 h-6" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-center">Real-time updates coming soon</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="map"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="h-[calc(100vh-280px)] min-h-[600px] glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative"
                    >
                        <Map donors={mapData.donors} hospitals={mapData.hospitals} />

                        {/* Map Overlay Info */}
                        <div className="absolute top-6 left-6 z-10 flex gap-3">
                            <div className="glass px-4 py-2 rounded-2xl border-white/5 flex items-center gap-3 bg-obsidian/40 backdrop-blur-xl">
                                <div className="w-2 h-2 rounded-full bg-ruby animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider leading-none mb-0.5">Network Scale</span>
                                    <span className="text-sm font-black text-white leading-none">{mapData.hospitals.length} Active Nodes</span>
                                </div>
                            </div>
                            <div className="glass px-4 py-2 rounded-2xl border-white/5 flex items-center gap-3 bg-obsidian/40 backdrop-blur-xl">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider leading-none mb-0.5">Response Ready</span>
                                    <span className="text-sm font-black text-white leading-none">{mapData.donors.length} Hero Donors</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Request Modal */}
            <AnimatePresence>
                {isCreating && (
                    <CreateRequestModal
                        onClose={() => setIsCreating(false)}
                        hospitalProfile={hospitalProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function MiniStat({ icon: Icon, label, value, cardColor }) {
    const colors = {
        ruby: 'text-ruby bg-ruby/10 border-ruby/20',
        amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
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
                </div>
            </div>

            <div className={`p-4 rounded-xl border ${colors[cardColor]} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
            </div>
        </motion.div>
    );
}

function RequestItem({ request, index }) {
    const statusColors = {
        OPEN: 'bg-ruby text-white',
        MATCHED: 'bg-amber-500 text-white',
        FULFILLED: 'bg-emerald-500 text-white',
        CANCELLED: 'bg-foreground/20 text-foreground/40',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.005 }}
            className="glass p-5 rounded-3xl border border-foreground/5 hover:border-ruby/30 transition-all group flex flex-col md:flex-row md:items-center gap-6"
        >
            <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-obsidian-light/80 rounded-2xl flex flex-col items-center justify-center border border-foreground/10 shrink-0 shadow-inner group-hover:bg-ruby/10 group-hover:border-ruby/20 transition-colors">
                    <span className="text-[10px] font-black uppercase opacity-40">T-Type</span>
                    <span className="text-xl font-black text-ruby leading-none">{request.bloodTypeNeeded}</span>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{request.unitsNeeded} Units Needed</h3>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${statusColors[request.status]}`}>
                            {request.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-foreground/40">
                        <span className="flex items-center gap-1 font-medium bg-foreground/5 px-2 py-0.5 rounded-lg border border-foreground/5">
                            <Clock className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-medium bg-foreground/5 px-2 py-0.5 rounded-lg border border-foreground/5">
                            <Users className="w-3 h-3" /> {request.responses?.length || 0} Responses
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link href={`/dashboard/hospital/requests/${request.id}`}>
                    <button className="flex-1 md:flex-none py-2 px-5 rounded-xl border border-foreground/10 text-xs font-bold hover:bg-foreground/5 transition-colors">
                        Manage Details
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}

function CreateRequestModal({ onClose, hospitalProfile }) {
    const [formData, setFormData] = useState({
        bloodTypeNeeded: 'O+',
        unitsNeeded: 1,
        urgencyLevel: 'NORMAL',
        expiresInHours: 24,
        description: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/requests', {
                ...formData,
                city: hospitalProfile?.city || 'Kigali'
            });
            onClose();
            window.location.reload(); // Quick refresh to show new request
        } catch (err) {
            console.error('Error creating request:', err);
            alert(err.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass w-full max-w-lg p-8 rounded-3xl relative"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Post New Emergency</h2>
                    <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors"><Plus className="w-6 h-6 rotate-45" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Blood Type</label>
                            <select
                                className="w-full bg-obsidian-light border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-ruby"
                                value={formData.bloodTypeNeeded}
                                onChange={(e) => setFormData({ ...formData, bloodTypeNeeded: e.target.value })}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Units Needed</label>
                            <input
                                type="number" min="1"
                                className="w-full bg-obsidian-light border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-ruby"
                                value={formData.unitsNeeded}
                                onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Urgency</label>
                            <select
                                className="w-full bg-obsidian-light border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-ruby"
                                value={formData.urgencyLevel}
                                onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                            >
                                {['NORMAL', 'URGENT', 'CRITICAL'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Expiration (Hrs)</label>
                            <input
                                type="number" min="1" max="168"
                                className="w-full bg-obsidian-light border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-ruby"
                                value={formData.expiresInHours}
                                onChange={(e) => setFormData({ ...formData, expiresInHours: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">Additional Description</label>
                        <textarea
                            className="w-full bg-obsidian-light border border-foreground/10 rounded-xl py-3 px-4 outline-none focus:border-ruby min-h-[100px] resize-none"
                            placeholder="Add any specific details about the patient or urgency..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Broadcast Request</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-foreground/5 opacity-50">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
            </div>
            <p className="max-w-xs mx-auto text-sm font-medium">{message}</p>
        </div>
    );
}
