"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Heart,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Activity,
  Clock,
  Zap,
  Loader2,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Dynamic import for Map to prevent SSR issues
const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-obsidian-light animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-ruby/30 border-t-ruby animate-spin" />
        <span className="text-[10px] font-bold text-ruby uppercase tracking-widest">Initialising Grid</span>
      </div>
    </div>
  )
});

export default function Home() {
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: 'EN', name: 'English' });

  const languages = [
    { code: 'RW', name: 'Kinyarwanda' },
    { code: 'EN', name: 'English' },
    { code: 'SW', name: 'Kiswahili' },
    { code: 'FR', name: 'French' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donorsRes, hospitalsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/donors`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/hospitals`)
        ]);
        setDonors(donorsRes.data || []);
        setHospitals(hospitalsRes.data || []);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Slight delay for smooth transition
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-foreground font-poppins p-2 md:p-3 selection:bg-ruby selection:text-white">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[2000] bg-obsidian flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-b-2 border-ruby shadow-[0_0_20px_rgba(230,57,70,0.2)]"
              />
              <Heart className="absolute inset-0 m-auto w-6 h-6 text-ruby fill-ruby animate-pulse" />
            </div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-[10px] font-black text-white uppercase tracking-[0.4em]"
            >
              LifeLine Match Protocol
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto space-y-3"
          >

            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between border-ruby/20 relative group/header shadow-[0_0_20px_rgba(230,57,70,0.05)] z-50"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-ruby/60 to-transparent opacity-100 transition-opacity duration-1000" />

              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-10 h-10 bg-ruby/10 rounded-xl flex items-center justify-center border border-ruby/30 shadow-[0_0_15px_rgba(230,57,70,0.1)]"
                >
                  <Heart className="w-5 h-5 text-ruby fill-ruby" />
                </motion.div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black tracking-tighter text-white">LifeLine <span className="text-ruby/80">Hub</span></h1>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 md:mt-0 flex-1 justify-end max-w-4xl">
                <div className="hidden lg:flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-2xl border border-ruby/30 transition-all shadow-inner w-full max-w-xl group/search">
                  <Search className="w-4 h-4 text-foreground/20 group-focus-within/search:text-ruby transition-colors" />
                  <input
                    type="text"
                    placeholder="Search Active Lifeline Resources..."
                    className="bg-transparent border-none outline-none text-xs font-semibold w-full placeholder:text-foreground/20 text-white"
                  />
                </div>

                {/* Language Picker */}
                <div className="relative">
                  <motion.button
                    onClick={() => setLangOpen(!langOpen)}
                    whileHover={{ backgroundColor: 'rgba(230, 57, 70, 0.1)' }}
                    className="flex items-center gap-2 bg-white/5 border border-ruby/30 px-4 py-2.5 rounded-2xl transition-all group/lang h-[42px]"
                  >
                    <Globe className="w-4 h-4 text-ruby group-hover/lang:rotate-12 transition-transform" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">{selectedLang.code}</span>
                    <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {langOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-black rounded-2xl border border-ruby/20 shadow-2xl z-[2000] overflow-hidden p-1"
                      >
                        {languages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLang(lang);
                              setLangOpen(false);
                            }}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', x: 4 }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${selectedLang.code === lang.code ? 'bg-ruby/10 border-l-2 border-ruby' : ''
                              }`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLang.code === lang.code ? 'text-ruby' : 'text-white/60'
                              }`}>
                              {lang.name}
                            </span>
                            {selectedLang.code === lang.code && (
                              <div className="w-1.5 h-1.5 rounded-full bg-ruby animate-pulse" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#c1121f' }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-ruby text-white text-[10px] font-black px-8 py-2.5 rounded-xl uppercase tracking-[0.2em] transition-all shadow-lg shadow-ruby/20 flex items-center gap-2 group shrink-0"
                  >
                    Register
                    <Zap className="w-3 h-3 group-hover:fill-white transition-all text-white/50" />
                  </motion.button>
                </Link>
              </div>
            </motion.header>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pb-2 relative">

              {/* Map Column - Static Layout */}
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="lg:col-span-9 h-[calc(100vh-100px)] min-h-[600px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl group/map"
              >
                <Map donors={donors} hospitals={hospitals} />

                {/* Floating Map Stats Overlay */}
                <div className="absolute top-4 left-4 z-1000 flex gap-2">
                  {[
                    { label: 'Donors', value: donors.length, color: 'bg-foreground' },
                    { label: 'Hospitals', value: hospitals.length, color: 'bg-ruby' }
                  ].map((stat, i) => (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      key={i}
                      className="glass px-4 py-2 rounded-2xl border-white/5 flex items-center gap-3 backdrop-blur-xl hover:border-white/10 transition-colors cursor-default"
                    >
                      <div className={`w-2 h-2 rounded-full ${stat.color} shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider leading-none mb-0.5">{stat.label}</span>
                        <span className="text-sm font-black text-white leading-none">{stat.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="absolute bottom-4 right-4 z-1000 glass px-4 py-2 rounded-xl border-white/5 opacity-0 group-hover/map:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Live Coordination Layer</span>
                </div>
              </motion.div>

              {/* Side Column - Static Layout */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                classes="lg:col-span-3 space-y-3 h-[calc(100vh-100px)] flex flex-col"
                className="lg:col-span-3 space-y-3 h-[calc(100vh-100px)] flex flex-col"
              >

                {/* Portal Access Widget */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-3xl p-8 border-white/5 bg-linear-to-b from-ruby/[0.03] to-transparent relative overflow-hidden flex flex-col justify-between h-[45%] group/portal hover:border-ruby/20 transition-all duration-500"
                >
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-ruby/5 rounded-full blur-3xl group-hover/portal:bg-ruby/10 transition-colors" />

                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-ruby/10 flex items-center justify-center border border-ruby/20">
                        <ShieldCheck className="w-4 h-4 text-ruby" />
                      </div>
                      <span className="text-[10px] font-black text-ruby/80 uppercase tracking-[0.3em]">Verified Access</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight mb-2">Elite Matching <br />Network</h2>
                      <p className="text-xs text-foreground/40 font-medium leading-relaxed">
                        Encrypted protocol for immediate life-saving coordination.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 relative z-10">
                    <Link href="/login">
                      <motion.button
                        whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/[0.03] text-white border border-white/10 px-6 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 group/btn shadow-lg"
                      >
                        Access Portal
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-ruby" />
                      </motion.button>
                    </Link>
                    <br />
                    <Link href="/register">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01, backgroundColor: 'rgba(230, 57, 70, 0.1)', borderColor: '#e63946' }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black/40 text-white border border-ruby/30 px-6 py-4 rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl hover:shadow-ruby/10 active:shadow-inner"
                      >
                        Register Institution
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>

                {/* Performance Widget */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-3xl p-8 border-white/5 flex flex-col gap-6 h-[55%] flex-1 relative overflow-hidden group/impact"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-ruby" />
                        Live Impact
                      </h3>
                      <p className="text-[10px] text-foreground/30 font-bold uppercase">Real-time Metrics</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-ruby animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-8 flex-1 flex flex-col justify-center relative z-10">
                    {[
                      { label: 'O- Negative Demand', value: 85, color: 'bg-ruby', icon: AlertCircle },
                      { label: 'Hospital Response', value: 92, color: 'bg-white', icon: Clock },
                      { label: 'Active Matching', value: 50, color: 'bg-ruby', icon: Zap }
                    ].map((item, i) => (
                      <div key={i} className="group/stat">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-foreground/40 mb-3 group-hover/stat:text-white transition-colors">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-3 h-3 text-ruby/40 group-hover/stat:text-ruby transition-colors" />
                            <span>{item.label}</span>
                          </div>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 1 + (i * 0.1) }}
                            className={`h-full ${item.color} shadow-[0_0_10px_rgba(230,57,70,0.3)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 bg-ruby/5 blur-3xl rounded-full" />
                </motion.div>

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
