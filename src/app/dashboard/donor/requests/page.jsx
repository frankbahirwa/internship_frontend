'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Activity, Clock, Droplets, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function DonorRequestsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, MATCHING
    const [acceptingId, setAcceptingId] = useState(null);
    const [donorProfile, setDonorProfile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [requestsRes, profileRes] = await Promise.all([
                    api.get('/requests?status=OPEN'),
                    api.get('/donors/me')
                ]);
                setRequests(requestsRes.data);
                setDonorProfile(profileRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchData();
    }, [user]);

    const handleAccept = async (requestId) => {
        if (!donorProfile?.isMedicallyEligible) {
            alert("You must certify your medical eligibility first!");
            router.push('/dashboard/donor/profile');
            return;
        }

        setAcceptingId(requestId);
        try {
            await api.post(`/responses/${requestId}/accept`);
            // Remove from list or show success
            setRequests(prev => prev.filter(r => r.id !== requestId));
            // Show toast/success message (can be added later)
            alert("Request accepted successfully! Thank you for being a hero.");
            router.push('/dashboard/donor/responses');
        } catch (err) {
            console.error('Error accepting request:', err);
            const msg = err.response?.data?.message || 'Failed to accept request';
            alert(msg);
        } finally {
            setAcceptingId(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'MATCHING' && donorProfile?.bloodType) {
            return req.bloodTypeNeeded === donorProfile.bloodType;
        }
        return true;
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground">
                        Blood <span className="text-ruby">Requests</span>
                    </h1>
                    <p className="text-foreground/50 font-medium mt-1">
                        Respond to urgent calls and save lives today.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-foreground text-obsidian shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}
                    >
                        All Requests
                    </button>
                    <button
                        onClick={() => setFilter('MATCHING')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'MATCHING' ? 'bg-ruby text-white shadow-lg shadow-ruby/20' : 'text-foreground/60 hover:text-ruby'}`}
                    >
                        Matching Me
                    </button>
                </div>
            </div>

            {/* Request Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req, idx) => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                index={idx}
                                onAccept={() => handleAccept(req.id)}
                                isAccepting={acceptingId === req.id}
                                isMatch={donorProfile?.bloodType === req.bloodTypeNeeded}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-foreground/10">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 text-foreground/20">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground/40">No requests found</h3>
                            <p className="text-foreground/30 mt-2 max-w-md mx-auto">
                                There are currently no blood requests matching your criteria. Check back later!
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function RequestCard({ request, index, onAccept, isAccepting, isMatch }) {
    const urgencyColors = {
        CRITICAL: 'text-ruby border-ruby/30 bg-ruby/5 ring-ruby/10',
        URGENT: 'text-orange-500 border-orange-500/30 bg-orange-500/5 ring-orange-500/10',
        NORMAL: 'text-blue-500 border-blue-500/30 bg-blue-500/5 ring-blue-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className={`glass p-6 rounded-3xl border transition-all hover:border-ruby/30 group relative overflow-hidden ${isMatch ? 'ring-2 ring-ruby/20 border-ruby/20' : 'border-transparent'}`}
        >
            {/* Background Gradient for Match */}
            {isMatch && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-ruby/5 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            )}

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-obsidian-light rounded-2xl flex items-center justify-center border border-foreground/10 shadow-inner">
                            <span className="text-3xl font-black text-ruby">{request.bloodTypeNeeded}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{request.hospital?.username || 'Hospital'}</h3>
                                {isMatch && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        MATCH
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border bg-white/5 ${urgencyColors[request.urgencyLevel]}`}>
                                {request.urgencyLevel}
                            </span>
                        </div>
                    </div>
                    {/* Expiry / Time */}
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-foreground/40 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Expires in</span>
                        </div>
                        <span className="text-sm font-mono text-foreground/70">
                            {new Date(request.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/60 p-3 rounded-xl bg-white/5 border border-white/5">
                        <MapPin className="w-4 h-4 text-ruby" />
                        <span className="truncate">{request.hospital?.city || request.city || 'Kigali, Rwanda'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/60 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span>{request.unitsNeeded} Units Required</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                    <button
                        onClick={onAccept}
                        disabled={isAccepting}
                        className="flex-1 py-3 bg-ruby text-white font-bold rounded-xl hover:bg-ruby-dark transition-all shadow-lg shadow-ruby/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAccepting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Accept Request
                                <CheckCircle2 className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    <button className="px-4 py-3 rounded-xl border border-foreground/10 hover:bg-foreground/5 transition-colors text-foreground/40 hover:text-foreground">
                        Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
