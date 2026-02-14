import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                Cookies.set('token', token, { expires: 7 });
                Cookies.set('user', JSON.stringify(user), { expires: 7 });
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                Cookies.remove('token');
                Cookies.remove('user');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) => {
                set((state) => ({
                    user: { ...state.user, ...userData },
                }));
            },
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage,
        }
    )
);

export default useAuthStore;
