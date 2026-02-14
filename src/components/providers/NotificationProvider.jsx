'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, CheckCircle, AlertCircle, Droplets } from 'lucide-react';
import socketService from '@/lib/socket';
import useAuthStore from '@/store/authStore';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            socketService.connect();

            const handleNewNotification = (notification) => {
                addNotification(notification.title, notification.message, 'info');
            };

            socketService.on('notification', handleNewNotification);

            // Special listeners for donation events
            socketService.on('bloodMatch', (data) => {
                addNotification('Match Found! 🩸', `Urgent request for ${data.bloodType} near you!`, 'ruby');
            });

            return () => {
                socketService.off('notification', handleNewNotification);
                socketService.off('bloodMatch');
            };
        } else {
            socketService.disconnect();
        }
    }, [isAuthenticated]);

    const addNotification = (title, message, type = 'info') => {
        const id = Date.now();
        setNotifications((prev) => [{ id, title, message, type }, ...prev]);
        setTimeout(() => removeNotification(id), 6000);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] space-y-4 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-auto glass p-4 rounded-2xl border-l-[4px] border-l-ruby flex gap-4 shadow-2xl relative pointer-events-auto"
                        >
                            <div className="w-10 h-10 rounded-xl bg-ruby/10 flex items-center justify-center text-ruby shrink-0">
                                {n.type === 'ruby' ? <Droplets className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-foreground mb-0.5 pr-6">{n.title}</h4>
                                <p className="text-xs text-foreground/50 line-clamp-2">{n.message}</p>
                            </div>
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="absolute top-2 right-2 p-1 hover:bg-foreground/5 rounded-lg text-foreground/30 hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
