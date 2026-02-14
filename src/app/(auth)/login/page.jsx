'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, ArrowRight, Heart, Droplets, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', formData);
            setAuth(data.user, data.access_token);

            // Role-based redirection
            if (data.user.role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else if (data.user.role === 'HOSPITAL') {
                router.push('/dashboard/hospital');
            } else {
                router.push('/dashboard/donor');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-obsidian text-white overflow-hidden font-inter">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 bg-ruby/5">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-ruby/20 via-transparent to-transparent opacity-30 rounded-full blur-[100px]"
                    />
                </div>

                {/* Blood Sharing Illustration Component */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
                    <svg viewBox="0 0 800 600" className="w-full h-full opacity-20">
                        <motion.path
                            d="M 100 300 Q 400 100 700 300"
                            fill="none"
                            stroke="var(--blood-ruby)"
                            strokeWidth="2"
                            strokeDasharray="1000"
                            initial={{ strokeDashoffset: 1000 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.circle
                            animate={{ cx: [100, 400, 700], cy: [300, 100, 300] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            r="6"
                            fill="var(--blood-ruby)"
                            className="blur-[2px]"
                        />
                        {/* More complex path */}
                        <motion.path
                            d="M 150 400 Q 400 600 650 400"
                            fill="none"
                            stroke="var(--blood-ruby)"
                            strokeWidth="1"
                            strokeDasharray="1000"
                            initial={{ strokeDashoffset: -1000 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                <div className="relative z-10 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-ruby rounded-2xl flex items-center justify-center shadow-lg shadow-ruby/40">
                                <Heart className="w-7 h-7 text-white fill-white" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter uppercase italic">LifeLine</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter mb-8">
                            <span className="whitespace-nowrap">Experience <span className="text-ruby">Seamless</span></span> <br />
                            Life Saving.
                        </h1>

                        <p className="text-lg text-foreground/60 leading-relaxed mb-12 font-medium">
                            Join the region's most efficient blood donation network.
                            Connecting heroes with those in need instantly.
                        </p>

                        {/* Feature Tags */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Droplets, label: 'URGENT MATCH', color: 'ruby' },
                                { icon: Lock, label: 'SAFE & SECURE', color: 'foreground' },
                            ].map((tag, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="glass p-4 rounded-2xl border border-foreground/5 flex items-center gap-3"
                                >
                                    <div className={`p-2 rounded-xl bg-${tag.color}/10`}>
                                        <tag.icon className={`w-4 h-4 text-${tag.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase opacity-70">{tag.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Large Background Icon Composition */}
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-10 translate-x-1/4 translate-y-1/4">
                    <Heart className="w-[600px] h-[600px] text-ruby fill-ruby" />
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-obsidian relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[480px] relative z-10"
                >
                    <div className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Sign In</h2>
                        <p className="text-foreground/40 text-xs font-bold tracking-[0.2em] uppercase">Welcome back to LifeLine</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-ruby/10 border-l-4 border-ruby p-4 rounded-r-xl mb-8 flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-ruby shrink-0" />
                            <span className="text-xs font-bold text-ruby">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground/60 ml-1">Email or Phone</label>
                            <div className="relative group/field">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within/field:text-ruby transition-all" />
                                <input
                                    type="text"
                                    required
                                    placeholder="devfullstack751@gmail.com"
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-4 pl-12 pr-5 outline-none focus:border-ruby/50 focus:ring-2 focus:ring-ruby/10 transition-all font-medium text-foreground placeholder:text-foreground/20 text-sm"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-foreground/60">Password</label>
                            </div>
                            <div className="relative group/field">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within/field:text-ruby transition-all" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-4 pl-12 pr-5 outline-none focus:border-ruby/50 focus:ring-2 focus:ring-ruby/10 transition-all font-medium text-foreground placeholder:text-foreground/20 text-sm"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end pr-1">
                                <Link href="/forgot-password" size="sm" className="text-xs text-ruby font-bold hover:underline">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-1">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-5 h-5 rounded-lg border-foreground/10 text-ruby focus:ring-ruby/20 transition-all cursor-pointer accent-ruby"
                            />
                            <label htmlFor="remember" className="text-sm font-bold text-foreground/60 cursor-pointer">Remember me</label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3.5 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 group transition-all hover:shadow-ruby/30 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 flex flex-col items-center gap-8">

                        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
                            New to lifeline?{' '}
                            <Link href="/register" className="text-ruby hover:underline">
                                Create an account
                            </Link>
                        </p>

                        <Link href="/" className="flex items-center gap-2 text-[10px] text-foreground/20 hover:text-foreground/40 transition-colors uppercase font-black tracking-[0.2em]">
                            <ArrowLeft className="w-3 h-3" /> Back to home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
