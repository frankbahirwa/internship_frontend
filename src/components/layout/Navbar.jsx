'use client';

import { motion } from 'framer-motion';
import { Heart, User, LogOut, Menu, X, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        router.push('/login');
    };

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/' || pathname.startsWith('/dashboard');
    if (isAuthPage) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="w-10 h-10 bg-ruby/20 rounded-xl flex items-center justify-center border border-ruby/30"
                    >
                        <Heart className="w-5 h-5 text-ruby fill-ruby" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight">
                        Life<span className="text-ruby">Line</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {isAuthenticated ? (
                        <>
                            <Link href={`/dashboard/${user?.role?.toLowerCase()}`} className={`text-sm font-medium transition-colors hover:text-ruby ${pathname.includes('/dashboard') ? 'text-ruby' : 'text-foreground/60'}`}>
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-4 pl-4 border-l border-foreground/10">
                                <button className="relative p-2 text-foreground/60 hover:text-ruby transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-ruby rounded-full border-2 border-obsidian" />
                                </button>
                                <div className="flex items-center gap-3 bg-obsidian-light/50 pl-2 pr-4 py-1.5 rounded-xl border border-foreground/10">
                                    <div className="w-8 h-8 rounded-lg bg-ruby/10 flex items-center justify-center text-ruby border border-ruby/20">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold leading-tight uppercase tracking-tighter">{user?.username}</div>
                                        <div className="text-[10px] text-foreground/40 leading-tight capitalize">{user?.role}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-2 p-1.5 hover:bg-ruby/10 hover:text-ruby rounded-lg transition-colors group"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-foreground/60 hover:text-ruby transition-colors">
                                Log In
                            </Link>
                            <Link href="/register" className="btn-primary text-sm py-2 px-6">
                                Become a Hero
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground/60"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden mt-2 glass rounded-2xl p-6 flex flex-col gap-4"
                >
                    {isAuthenticated ? (
                        <>
                            <Link href={`/dashboard/${user?.role?.toLowerCase()}`} className="text-lg font-medium">Dashboard</Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-ruby font-medium pt-4 border-t border-foreground/10"
                            >
                                <LogOut className="w-5 h-5" /> Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-lg font-medium">Log In</Link>
                            <Link href="/register" className="btn-primary text-center">Become a Hero</Link>
                        </>
                    )}
                </motion.div>
            )}
        </nav>
    );
}
