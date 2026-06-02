import { create } from "zustand";

type UserState = {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  credits: number;
  isPremium: boolean;
  isLoading: boolean;
  setProfile: (payload: {
    userId: string | null;
    email?: string | null;
    displayName?: string | null;
  }) => void;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => boolean;
  setPremium: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  userId: null,
  email: null,
  displayName: null,
  credits: 0,
  isPremium: false,
  isLoading: true,
  setProfile: (payload) =>
    set({
      userId: payload.userId,
      email: payload.email ?? null,
      displayName: payload.displayName ?? null,
    }),
  setCredits: (credits) => set({ credits: Math.max(0, credits) }),
  deductCredits: (amount) => {
    const { credits } = get();
    if (amount <= 0 || credits < amount) return false;
    set({ credits: credits - amount });
    return true;
  },
  setPremium: (value) => set({ isPremium: value }),
  setLoading: (value) => set({ isLoading: value }),
  reset: () =>
    set({
      userId: null,
      email: null,
      displayName: null,
      credits: 0,
      isPremium: false,
      isLoading: false,
    }),
}));
