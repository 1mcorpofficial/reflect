import { create } from "zustand";
import { loginUser, getMe } from "../api/auth";

// Mock vartotojai prisijungimui (fallback)
const mockUsers = [
  {
    id: "stu-1",
    email: "mokinys@pastas.lt",
    password: "test123",
    role: "student",
    name: "Jonas Jonaitis",
    classId: "class-8a"
  },
  {
    id: "stu-2", 
    email: "mokinys2@pastas.lt",
    password: "test123",
    role: "student",
    name: "Ona Onaitė",
    classId: "class-8a"
  },
  {
    id: "teach-1",
    email: "mokytojas@pastas.lt",
    password: "test123",
    role: "teacher",
    name: "Mokytoja Rasa",
    classId: null
  }
];

// Feature flag
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

// Mock prisijungimo funkcija
async function mockLogin(email, password) {
  await new Promise(res => setTimeout(res, 300)); // Simuliuojame tinklo vėlavimą
  
  const user = mockUsers.find(
    u => u.email.toLowerCase() === String(email || "").toLowerCase().trim() && u.password === password
  );
  
  if (!user) {
    const err = new Error("Neteisingi prisijungimo duomenys");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  
  const token = `mock-token-${user.id}-${Date.now()}`;
  const { password: _, ...publicUser } = user;
  return { token, user: publicUser };
}

// Real API login
async function realLogin(email, password) {
  try {
    const response = await loginUser(email, password);
    const { token, user } = response.data;
    
    // Store token in localStorage for API client
    localStorage.setItem('token', token);
    
    return { token, user };
  } catch (error) {
    const err = new Error(error.response?.data?.error || "Neteisingi prisijungimo duomenys");
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
}

// Saugojimas į localStorage
function saveAuth(data) {
  localStorage.setItem("auth", JSON.stringify(data));
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
}

function loadAuth() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  ready: false,

  hydrateFromStorage() {
    const saved = loadAuth();
    const token = localStorage.getItem("token");
    
    if (saved?.user && (saved?.token || token)) {
      const authToken = token || saved.token;
      set({ user: saved.user, token: authToken, role: saved.user.role, ready: true });
      
      // If using real API, verify token is still valid
      if (USE_REAL_API && authToken) {
        getMe().then(response => {
          set({ user: response.data });
        }).catch(() => {
          // Token invalid, clear auth
          clearAuth();
          set({ user: null, token: null, role: null, ready: true });
        });
      }
      
      return true;
    } else {
      set({ ready: true });
      return false;
    }
  },

  async login(email, password) {
    const loginFn = USE_REAL_API ? realLogin : mockLogin;
    const { token, user } = await loginFn(email, password);
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
