'use client';

import { create } from 'zustand';
import api from '@/lib/api';

interface SettingsState {
  settings: Record<string, string>;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
  get: (key: string, fallback?: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, getState) => ({
  settings: {},
  loaded: false,

  fetchSettings: async () => {
    if (getState().loaded) return;
    try {
      const { data } = await api.get('/settings');
      set({ settings: data, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  get: (key: string, fallback = '') => {
    return getState().settings[key] || fallback;
  },
}));
