'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, MapPin, CheckCircle2, XCircle, Clock, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function DonorResponsesPage() {
    const { user } = useAuthStore();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const res = await api.get('/responses/my-responses');
                setResponses(res.data);
            } catch (err) {
                console.error('Error fetching responses:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchResponses();
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
            <div>
                <h1 className="text-3xl font-black text-foreground">
                    My <span className="text-ruby">Responses</span>
                </h1>
                <p className="text-foreground/50 font-medium mt-1">
                    Track the status of your donation commitments.
                </p>
            </div>

            <div className="grid gap-6">
                {responses.length > 0 ? (
                    responses.map((response, idx) => (
                        <ResponseCard key={response.id} response={response} index={idx} />
                    ))
                ) : (
                    <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-foreground/10">
                        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6 text-foreground/20">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground/40">No activity yet</h3>
                        <p className="text-foreground/30 mt-2 max-w-md mx-auto">
                            You haven't responded to any requests yet. Start your journey by browsing requests!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResponseCard({ response, index }) {
    const statusConfig = {
        ACCEPTED: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Clock, label: 'Pledged' },
        CONFIRMED: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Completed' },
        DECLINED: { color: 'text-foreground/40 bg-foreground/5 border-foreground/10', icon: XCircle, label: 'Declined' },
    };

    const config = statusConfig[response.status] || statusConfig.ACCEPTED;
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass p-6 rounded-3xl flex flex-col md:flex-row gap-6 md:items-center justify-between border border-transparent hover:border-foreground/10 transition-colors"
        >
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.color} border`}>
                    <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">{response.request?.hospital?.username || 'Hospital Request'}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/50 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(response.respondedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {response.request?.city || 'Kigali'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Units */}
                <div className="hidden md:block text-right">
                    <span className="block text-xs font-bold text-foreground/40 uppercase tracking-wider">Amount</span>
                    <span className="font-mono font-bold">{response.request?.unitsNeeded} Units</span>
                </div>

                <div className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 ${config.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {config.label}
                </div>
            </div>
        </motion.div>
    );
}
