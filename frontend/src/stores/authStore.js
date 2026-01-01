import { create } from "zustand";

// Mock vartotojai prisijungimui
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

// Saugojimas į localStorage
function saveAuth(data) {
  localStorage.setItem("auth", JSON.stringify(data));
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
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  ready: false,

  hydrateFromStorage() {
    const saved = loadAuth();
    if (saved?.user && saved?.token) {
      set({ user: saved.user, token: saved.token, role: saved.user.role, ready: true });
      return true;
    } else {
      set({ ready: true });
      return false;
    }
  },

  async login(email, password) {
    const { token, user } = await mockLogin(email, password);
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
