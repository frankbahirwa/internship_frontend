'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Droplets,
    History,
    Settings,
    LogOut,
    ShieldCheck,
    PlusCircle,
    Activity,
    Users,
    Menu,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    Heart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import ProfileSidebar from './ProfileSidebar';

const roleMenus = {
    DONOR: [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/donor' },
        { title: 'Find Matches', icon: Droplets, href: '/dashboard/donor/requests' },
        { title: 'My History', icon: History, href: '/dashboard/donor/responses' },
        { title: 'Profile', icon: Settings, href: '/dashboard/donor/profile' },
        { title: 'My Impact', icon: Activity, href: '/dashboard/donor/reports' },
    ],
    HOSPITAL: [
        { title: 'Overview', icon: LayoutDashboard, href: '/dashboard/hospital' },
        { title: 'Reports', icon: Activity, href: '/dashboard/hospital/reports' },
        { title: 'Requests', icon: Droplets, href: '/dashboard/hospital/requests' },
        { title: 'Profile', icon: Settings, href: '/dashboard/hospital/profile' },
    ],
    ADMIN: [
        { title: 'Global Stats', icon: LayoutDashboard, href: '/dashboard/admin' },
        { title: 'Hospitals', icon: ShieldCheck, href: '/dashboard/admin/hospitals' },
        { title: 'User Management', icon: Users, href: '/dashboard/admin/donors' },
        { title: 'Audit Logs', icon: History, href: '/dashboard/admin/audit' },
    ],
};

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    const menu = roleMenus[user?.role] || [];
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [autoCollapseTimer, setAutoCollapseTimer] = useState(null);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Auto-collapse logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCollapsed(true);
        }, 3000);
        setAutoCollapseTimer(timer);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseEnter = () => {
        if (autoCollapseTimer) clearTimeout(autoCollapseTimer);
        setIsCollapsed(false);
    };

    const handleMouseLeave = () => {
        const timer = setTimeout(() => {
            setIsCollapsed(true);
        }, 3000);
        setAutoCollapseTimer(timer);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-obsidian text-foreground selection:bg-ruby selection:text-white">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="hidden md:flex flex-col h-full border-r border-foreground/5 bg-obsidian-light/50 backdrop-blur-xl relative z-20"
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-center border-b border-foreground/5 relative">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-ruby/10 rounded-xl flex items-center justify-center border border-ruby/20 group-hover:scale-110 transition-transform">
                            <Heart className="w-5 h-5 text-ruby fill-ruby" />
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden"
                                >
                                    Life<span className="text-ruby">Line</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                    ? 'bg-ruby text-white shadow-lg shadow-ruby/20'
                                    : 'text-foreground/60 hover:bg-ruby/10 hover:text-ruby'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="font-medium text-sm whitespace-nowrap"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-foreground/5 space-y-2">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/40 hover:bg-ruby/10 hover:text-ruby transition-all w-full ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`flex items-center justify-center gap-3 px-3 py-3 rounded-xl bg-foreground/5 hover:bg-ruby hover:text-white text-foreground/40 transition-all w-full group ${isCollapsed ? '' : 'justify-between'}`}
                    >
                        {!isCollapsed && <span className="font-medium text-xs uppercase tracking-widest pl-1">Collapse</span>}
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-obsidian relative">
                {/* Top Header */}
                <header className="h-20 border-b border-foreground/5 bg-obsidian/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-foreground/60 hover:text-ruby transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {menu.find(m => m.href === pathname)?.title || 'Dashboard'}
                            </h2>
                            <p className="text-xs text-foreground/40 hidden md:block">Welcome back, Hero.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 bg-obsidian-light px-4 py-2 rounded-xl border border-foreground/5">
                            <Search className="w-4 h-4 text-foreground/20" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-xs w-48 text-foreground"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-foreground/60 hover:text-ruby transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-ruby rounded-full border-2 border-obsidian" />
                            </button>

                            <div className="h-8 w-px bg-foreground/10" />

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-all group"
                            >
                                <div className="text-right hidden md:block">
                                    <div className="text-xs font-bold leading-tight uppercase tracking-tighter group-hover:text-ruby transition-colors">{user?.username}</div>
                                    <div className="text-[10px] text-foreground/40 leading-tight capitalize">{user?.role}</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-ruby to-ruby-dark flex items-center justify-center text-white font-bold shadow-lg shadow-ruby/20 group-hover:scale-105 transition-transform">
                                    {user?.username?.[0] || 'U'}
                                </div>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:py-12 scroll-smooth">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Right Profile Sidebar */}
            <AnimatePresence>
                {isProfileOpen && (
                    <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                )}
            </AnimatePresence>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-64 bg-obsidian border-r border-foreground/5 z-50 md:hidden flex flex-col"
                        >
                            <div className="h-20 flex items-center justify-center border-b border-foreground/5 relative">
                                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="w-10 h-10 bg-ruby/10 rounded-xl flex items-center justify-center border border-ruby/20">
                                        <Heart className="w-5 h-5 text-ruby fill-ruby" />
                                    </div>
                                    <span className="text-xl font-bold tracking-tight">
                                        Life<span className="text-ruby">Line</span>
                                    </span>
                                </Link>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {menu.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                                                ? 'bg-ruby text-white'
                                                : 'text-foreground/60 hover:bg-ruby/10 hover:text-ruby'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-foreground/5">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-foreground/40 hover:bg-ruby/10 hover:text-ruby transition-all w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium text-sm">Sign Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
