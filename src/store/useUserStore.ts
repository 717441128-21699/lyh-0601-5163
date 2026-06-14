import { create } from 'zustand';
import { mockApi } from '../services/mock';
import type { User, LoginRequest, LoginResponse, UserRole } from '../types';

interface CreateUserRequest {
  username: string;
  name: string;
  password?: string;
  role: UserRole;
  email: string;
  phone: string;
  provinceId?: string;
  cityId?: string;
  stationId?: string;
  status: 'active' | 'disabled';
}

interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

interface UserState {
  user: User | null;
  users: User[];
  token: string | null;
  permissions: string[];
  loading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  loadUsers: () => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<User>;
  updateUser: (data: UpdateUserRequest) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  users: [],
  token: localStorage.getItem('token'),
  permissions: [],
  loading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await mockApi.auth.login(data.username, data.password);
      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        token: response.token,
        permissions: response.permissions,
        loading: false,
      });
      return response;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await mockApi.auth.logout();
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        permissions: [],
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    set({ loading: true });
    try {
      const user = await mockApi.auth.getCurrentUser();
      if (user) {
        set({ user, token, permissions: ['view', 'edit', 'approve'], loading: false });
      } else {
        localStorage.removeItem('token');
        set({ user: null, token: null, loading: false });
      }
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  loadUsers: async () => {
    set({ loading: true });
    try {
      const users = await mockApi.user.getUsers();
      set({ users, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createUser: async (data: CreateUserRequest) => {
    set({ loading: true });
    try {
      const user = await mockApi.user.createUser(data);
      set((state) => ({ users: [...state.users, user], loading: false }));
      return user;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (data: UpdateUserRequest) => {
    set({ loading: true });
    try {
      const user = await mockApi.user.updateUser(data.id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === data.id ? user : u)),
        loading: false,
      }));
      return user;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true });
    try {
      await mockApi.user.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
