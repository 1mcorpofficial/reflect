import { create } from "zustand";
import { api } from "../lib/api.js";
import { clearAuth, loadAuth, saveAuth } from "../lib/storage.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  ready: false,

  async hydrateFromStorage() {
    const saved = loadAuth();
    if (saved?.user && saved?.token) {
      set({ user: saved.user, token: saved.token, role: saved.user.role, ready: true });
    } else {
      set({ ready: true });
    }
  },

  async login(email, password) {
    const { token, user } = await api.authLogin(email, password);
    saveAuth({ token, user });
    set({ user, token, role: user.role });
    return { user, token };
  },

  logout() {
    clearAuth();
    set({ user: null, token: null, role: null });
  }
}));

export function useAuth() {
  return useAuthStore();
}
