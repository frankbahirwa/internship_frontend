'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, MapPin, Droplets, CheckCircle2, XCircle, AlertTriangle, Loader2, Phone, User } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function RequestDetailsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const fetchRequestDetails = async () => {
            try {
                const res = await api.get(`/requests/${params.id}`);
                setRequest(res.data);
            } catch (err) {
                console.error('Error fetching request details:', err);
                // router.push('/dashboard/hospital/requests'); // Redirect on error?
            } finally {
                setLoading(false);
            }
        };

        if (user?.id && params?.id) fetchRequestDetails();
    }, [user, params?.id]);

    const handleConfirmDonation = async (responseId, donorName) => {
        if (!confirm(`Confirm donation from ${donorName}? This will mark the request as fulfilled.`)) return;

        setProcessingId(responseId);
        try {
            await api.patch(`/responses/${responseId}/confirm`);
            // Update local state
            setRequest(prev => ({
                ...prev,
                status: 'FULFILLED',
                responses: prev.responses.map(r => r.id === responseId ? { ...r, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : r)
            }));
            alert('Donation confirmed successfully!');
        } catch (err) {
            console.error('Error confirming donation:', err);
            alert('Failed to confirm donation');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-ruby" />
            </div>
        );
    }

    if (!request) return <div className="text-center py-20">Request not found</div>;

    const statusColors = {
        OPEN: 'bg-ruby text-white',
        MATCHED: 'bg-amber-500 text-white',
        FULFILLED: 'bg-emerald-500 text-white',
        CANCELLED: 'bg-foreground/20 text-foreground/40',
    };

    return (
        <div className="space-y-8 pb-12 w-full">
            <Link href="/dashboard/hospital/requests" className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-ruby transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Requests
            </Link>

            {/* Header / Summary */}
            <div className="glass p-8 rounded-3xl border border-foreground/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Droplets className="w-40 h-40 text-ruby" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-obsidian-light rounded-3xl flex items-center justify-center border border-foreground/10 shadow-inner">
                            <span className="text-4xl font-black text-ruby">{request.bloodTypeNeeded}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black">{request.unitsNeeded} Units Required</h1>
                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${statusColors[request.status]}`}>
                                    {request.status}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 text-sm text-foreground/60">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {request.hospital?.city || 'Location'}</span>
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Expires: {new Date(request.expiresAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass bg-black/20 p-6 rounded-2xl min-w-[200px]">
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Responses</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black">{request.responses?.length || 0}</span>
                            <span className="text-sm font-medium text-foreground/50 mb-1">donors</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responses List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Users className="w-6 h-6 text-ruby" />
                    Donor Responses
                </h2>

                <div className="space-y-4">
                    {request.responses && request.responses.length > 0 ? (
                        request.responses.map((response) => (
                            <ResponseItem
                                key={response.id}
                                response={response}
                                onConfirm={() => handleConfirmDonation(response.id, response.donor?.username)}
                                isProcessing={processingId === response.id}
                                requestStatus={request.status}
                            />
                        ))
                    ) : (
                        <div className="py-12 text-center glass rounded-3xl border-dashed border-2 border-foreground/10">
                            <p className="text-foreground/40 font-medium">No responses yet. We'll notify you when a donor accepts.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResponseItem({ response, onConfirm, isProcessing, requestStatus }) {
    const isConfirmed = response.status === 'CONFIRMED';
    const canConfirm = !isConfirmed && requestStatus !== 'FULFILLED' && response.status === 'ACCEPTED';

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border ${isConfirmed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-foreground/5'}`}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-foreground/40" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{response.donor?.username || 'Donor'}</h3>
                    <div className="flex items-center gap-4 text-sm text-foreground/50">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {response.donor?.phone || 'No phone'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(response.respondedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {isConfirmed ? (
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-bold border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Donation Confirmed
                </div>
            ) : response.status === 'DECLINED' ? (
                <div className="px-4 py-2 bg-foreground/5 text-foreground/40 rounded-xl font-bold border border-foreground/10 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Declined
                </div>
            ) : (
                canConfirm && (
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 flex items-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Donation
                    </button>
                )
            )}
        </motion.div>
    );
}
