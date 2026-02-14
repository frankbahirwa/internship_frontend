'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertCircle, CheckCircle, Clock, User, Download } from 'lucide-react';
import api from '@/lib/api';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/audit');
                setLogs(res.data);
            } catch (err) {
                console.error('Error fetching audit logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'ALL') return matchesSearch;
        return matchesSearch && log.action === filter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">Audit Logs</h1>
                    <p className="text-foreground/40 text-sm">Monitor system activity and security events.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-obsidian-light/50 p-4 rounded-2xl border border-foreground/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                    <input
                        type="text"
                        placeholder="Search by action, user, or details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-obsidian border border-foreground/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-ruby/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'LOGIN', 'LOGOUT', 'CREATE_REQUEST', 'VERIFY_HOSPITAL'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filter === f
                                ? 'bg-ruby text-white shadow-lg shadow-ruby/20'
                                : 'bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="border border-foreground/5 rounded-2xl overflow-hidden bg-obsidian-light/30 backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 text-foreground/40 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-foreground/40">
                                        Loading audit logs...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-foreground/40">
                                        No audit logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground/60">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground/60">
                                                    {log.user?.username?.[0] || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{log.user?.username || 'Unknown'}</div>
                                                    <div className="text-xs text-foreground/40">{log.user?.role || 'System'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                log.action.includes('create') || log.action.includes('VERIFY') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground/60 max-w-xs truncate" title={log.details}>
                                            {log.details || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-foreground/40 font-mono text-xs">
                                            {log.ipAddress || '127.0.0.1'}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
