/**
 * FitoGramme API client
 *
 * All fetch calls go through these helpers so the base URL is always read from
 * the NEXT_PUBLIC_API_URL environment variable. Set it in .env.local:
 *
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 *
 * If the backend is unavailable or not configured, this client provides a seamless,
 * persistent mock layer so all roles (client, coach, nutritionist), meal logs (with
 * Derja analysis), workouts, and plans work without dead ends.
 */

import {
  DEMO_USERS,
  INITIAL_MEALS,
  INITIAL_PROGRAMS,
  INITIAL_CLIENTS,
  INITIAL_MEAL_PLANS,
  INITIAL_NOTIFICATIONS,
  estimateTunisianMeal,
} from './mock-data';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

// ── Types ──────────────────────────────────────────────────────────────────────

export type Role = 'client' | 'coach' | 'nutritionist';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  language?: 'fr' | 'ar' | 'derja';
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MealLog {
  id: string;
  user_id: string;
  text_original: string; // user's input (Tunisian Derja / French / Arabic)
  text_normalized?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string; // ISO datetime
  ai_estimate?: NutritionEstimate;
}

export interface NutritionEstimate {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  confidence: 'low' | 'medium' | 'high';
  disclaimer: string;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description?: string;
  coach_id: string;
  client_id?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  sessions_per_week: number;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  program_id: string;
  title: string;
  week: number;
  day: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: string;
  duration_sec?: number;
  rest_sec: number;
  notes?: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  goal?: string;
  joined_at: string;
}

export interface Notification {
  id: string;
  type: 'meal' | 'workout' | 'message' | 'system';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface MealPlan {
  id: string;
  nutritionist_id: string;
  client_id: string;
  week_start: string;
  days: MealPlanDay[];
}

export interface MealPlanDay {
  day: number;
  meals: { meal_type: string; description: string; calories_target?: number }[];
}

// ── Error class ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = 'ApiError';
  }
}

// ── Local Storage Helper for Mock Fallback ────────────────────────────────────

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`fg_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`fg_${key}`, JSON.stringify(value));
  } catch {
    // quota exceeded or private mode
  }
}

// ── Core fetch with graceful Mock Fallback ─────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallbackFn?: () => T | Promise<T>,
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fg_token') : null;

  // If no base URL is defined or we're on client-side demo, try fallback directly if provided
  if (!BASE && fallbackFn) {
    return fallbackFn();
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (!res.ok) {
      if (fallbackFn && (res.status === 404 || res.status === 502 || res.status === 500)) {
        return fallbackFn();
      }
      let detail = `Erreur ${res.status}`;
      try {
        const json = await res.json();
        detail = json?.detail ?? json?.message ?? detail;
      } catch {
        /* ignore */
      }
      throw new ApiError(res.status, detail);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (fallbackFn && !(err instanceof ApiError && (err.status === 401 || err.status === 403))) {
      return fallbackFn();
    }
    throw err;
  }
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export const auth = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        // Mock fallback login
        const emailLower = payload.email.toLowerCase();
        let matchedUser: User | undefined;

        if (emailLower.includes('coach')) {
          matchedUser = DEMO_USERS.coach;
        } else if (emailLower.includes('nutri')) {
          matchedUser = DEMO_USERS.nutritionist;
        } else if (emailLower.includes('client') || emailLower.includes('youssef')) {
          matchedUser = DEMO_USERS.client;
        } else {
          // Check registered users in storage
          const registeredUsers = getStorage<User[]>('registered_users', []);
          matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === emailLower);
          if (!matchedUser) {
            // Default demo user based on email prefix or client
            matchedUser = {
              id: 'user-' + Date.now(),
              email: payload.email,
              full_name: payload.email.split('@')[0],
              role: 'client',
              language: 'derja',
              created_at: new Date().toISOString(),
            };
          }
        }

        return {
          access_token: 'demo-jwt-token-' + Date.now(),
          token_type: 'bearer',
          user: matchedUser,
        };
      },
    ),

  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        const newUser: User = {
          id: 'user-' + Date.now(),
          email: payload.email,
          full_name: payload.full_name,
          role: payload.role,
          language: 'derja',
          created_at: new Date().toISOString(),
        };

        const existing = getStorage<User[]>('registered_users', []);
        setStorage('registered_users', [...existing, newUser]);

        return {
          access_token: 'demo-jwt-token-' + Date.now(),
          token_type: 'bearer',
          user: newUser,
        };
      },
    ),

  me: () =>
    apiFetch<User>('/api/auth/me', {}, () => {
      const u = getStorage<User | null>('user', null);
      if (!u) throw new ApiError(401, 'Non authentifié');
      return u;
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fg_token');
      localStorage.removeItem('fg_user');
    }
  },
};

// ── Meals ──────────────────────────────────────────────────────────────────────

export const meals = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<MealLog[]>(
      `/api/meals${qs ? '?' + qs : ''}`,
      {},
      () => getStorage<MealLog[]>('meals', INITIAL_MEALS),
    );
  },

  create: (payload: Omit<MealLog, 'id' | 'user_id' | 'logged_at' | 'ai_estimate'> & { ai_estimate?: NutritionEstimate }) =>
    apiFetch<MealLog>(
      '/api/meals',
      { method: 'POST', body: JSON.stringify(payload) },
      () => {
        const currentMeals = getStorage<MealLog[]>('meals', INITIAL_MEALS);
        const estimate = payload.ai_estimate ?? estimateTunisianMeal(payload.text_original);
        const newMeal: MealLog = {
          id: 'meal-' + Date.now(),
          user_id: 'user-client-1',
          text_original: payload.text_original,
          text_normalized: payload.text_normalized || payload.text_original,
          meal_type: payload.meal_type,
          logged_at: new Date().toISOString(),
          ai_estimate: estimate,
        };
        const updated = [newMeal, ...currentMeals];
        setStorage('meals', updated);
        return newMeal;
      },
    ),

  estimate: (text: string) =>
    apiFetch<NutritionEstimate>(
      '/api/meals/estimate',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
      () => estimateTunisianMeal(text),
    ),

  update: (id: string, payload: Partial<MealLog>) =>
    apiFetch<MealLog>(
      `/api/meals/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      () => {
        const currentMeals = getStorage<MealLog[]>('meals', INITIAL_MEALS);
        const index = currentMeals.findIndex((m) => m.id === id);
        if (index === -1) throw new ApiError(404, 'Repas non trouvé');
        const updatedMeal = { ...currentMeals[index], ...payload };
        currentMeals[index] = updatedMeal;
        setStorage('meals', currentMeals);
        return updatedMeal;
      },
    ),

  delete: (id: string) =>
    apiFetch<void>(
      `/api/meals/${id}`,
      { method: 'DELETE' },
      () => {
        const currentMeals = getStorage<MealLog[]>('meals', INITIAL_MEALS);
        const filtered = currentMeals.filter((m) => m.id !== id);
        setStorage('meals', filtered);
      },
    ),
};

// ── Workouts ───────────────────────────────────────────────────────────────────

export const workouts = {
  programs: {
    list: () =>
      apiFetch<WorkoutProgram[]>(
        '/api/workouts/programs',
        {},
        () => getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS),
      ),

    get: (id: string) =>
      apiFetch<WorkoutProgram>(
        `/api/workouts/programs/${id}`,
        {},
        () => {
          const progs = getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS);
          const found = progs.find((p) => p.id === id);
          if (!found) throw new ApiError(404, 'Programme non trouvé');
          return found;
        },
      ),

    create: (payload: Omit<WorkoutProgram, 'id' | 'created_at'>) =>
      apiFetch<WorkoutProgram>(
        '/api/workouts/programs',
        { method: 'POST', body: JSON.stringify(payload) },
        () => {
          const progs = getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS);
          const newProg: WorkoutProgram = {
            ...payload,
            id: 'prog-' + Date.now(),
            created_at: new Date().toISOString(),
          };
          setStorage('programs', [newProg, ...progs]);
          return newProg;
        },
      ),

    update: (id: string, payload: Partial<WorkoutProgram>) =>
      apiFetch<WorkoutProgram>(
        `/api/workouts/programs/${id}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
        () => {
          const progs = getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS);
          const idx = progs.findIndex((p) => p.id === id);
          if (idx === -1) throw new ApiError(404, 'Programme introuvable');
          progs[idx] = { ...progs[idx], ...payload };
          setStorage('programs', progs);
          return progs[idx];
        },
      ),

    delete: (id: string) =>
      apiFetch<void>(
        `/api/workouts/programs/${id}`,
        { method: 'DELETE' },
        () => {
          const progs = getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS);
          setStorage('programs', progs.filter((p) => p.id !== id));
        },
      ),

    assign: (programId: string, clientId: string) =>
      apiFetch<void>(
        `/api/workouts/programs/${programId}/assign`,
        { method: 'POST', body: JSON.stringify({ client_id: clientId }) },
        () => {
          const progs = getStorage<WorkoutProgram[]>('programs', INITIAL_PROGRAMS);
          const idx = progs.findIndex((p) => p.id === programId);
          if (idx !== -1) {
            progs[idx] = { ...progs[idx], client_id: clientId, status: 'active' };
            setStorage('programs', progs);
          }
        },
      ),
  },

  sessions: {
    list: (programId: string) =>
      apiFetch<WorkoutSession[]>(
        `/api/workouts/programs/${programId}/sessions`,
        {},
        () => [
          {
            id: 'sess-1',
            program_id: programId,
            title: 'Haut du Corps — Force & Pectoraux',
            week: 1,
            day: 1,
            exercises: [
              { id: 'ex-1', name: 'Développé Couché (Barre)', sets: 4, reps: '6-8', rest_sec: 120, notes: 'Temps sous tension 3-0-1-0' },
              { id: 'ex-2', name: 'Tractions Prise Pronation', sets: 4, reps: '8-10', rest_sec: 90 },
              { id: 'ex-3', name: 'Développé Militaire Haltères', sets: 3, reps: '10', rest_sec: 90 },
              { id: 'ex-4', name: 'Dips aux barres parallèles', sets: 3, reps: '12', rest_sec: 60 },
            ],
          },
          {
            id: 'sess-2',
            program_id: programId,
            title: 'Bas du Corps — Squat & Chaîne Postérieure',
            week: 1,
            day: 2,
            exercises: [
              { id: 'ex-5', name: 'Back Squat profond', sets: 4, reps: '6', rest_sec: 150 },
              { id: 'ex-6', name: 'Soulevé de terre roumain', sets: 4, reps: '8-10', rest_sec: 90 },
              { id: 'ex-7', name: 'Fentes marchées avec haltères', sets: 3, reps: '12/jambe', rest_sec: 60 },
              { id: 'ex-8', name: 'Mollets debout', sets: 4, reps: '15', rest_sec: 45 },
            ],
          },
        ],
      ),
    create: (programId: string, payload: Omit<WorkoutSession, 'id'>) =>
      apiFetch<WorkoutSession>(
        `/api/workouts/programs/${programId}/sessions`,
        { method: 'POST', body: JSON.stringify(payload) },
        () => ({ ...payload, id: 'sess-' + Date.now() }),
      ),
  },
};

// ── Clients (coach & nutritionist view) ────────────────────────────────────────

export const clients = {
  list: () =>
    apiFetch<Client[]>(
      '/api/coach/clients',
      {},
      () => getStorage<Client[]>('clients', INITIAL_CLIENTS),
    ),
  get: (id: string) =>
    apiFetch<Client>(
      `/api/coach/clients/${id}`,
      {},
      () => {
        const cls = getStorage<Client[]>('clients', INITIAL_CLIENTS);
        const c = cls.find((item) => item.id === id);
        if (!c) throw new ApiError(404, 'Client non trouvé');
        return c;
      },
    ),
  meals: (clientId: string) =>
    apiFetch<MealLog[]>(
      `/api/coach/clients/${clientId}/meals`,
      {},
      () => getStorage<MealLog[]>('meals', INITIAL_MEALS),
    ),
};

// ── Meal plans (nutritionist view) ────────────────────────────────────────────

export const mealPlans = {
  list: () =>
    apiFetch<MealPlan[]>(
      '/api/nutrition/plans',
      {},
      () => getStorage<MealPlan[]>('meal_plans', INITIAL_MEAL_PLANS),
    ),
  get: (id: string) =>
    apiFetch<MealPlan>(
      `/api/nutrition/plans/${id}`,
      {},
      () => {
        const plans = getStorage<MealPlan[]>('meal_plans', INITIAL_MEAL_PLANS);
        const found = plans.find((p) => p.id === id);
        if (!found) throw new ApiError(404, 'Plan introuvable');
        return found;
      },
    ),
  create: (payload: Omit<MealPlan, 'id'>) =>
    apiFetch<MealPlan>(
      '/api/nutrition/plans',
      { method: 'POST', body: JSON.stringify(payload) },
      () => {
        const plans = getStorage<MealPlan[]>('meal_plans', INITIAL_MEAL_PLANS);
        const newPlan: MealPlan = { ...payload, id: 'plan-' + Date.now() };
        setStorage('meal_plans', [newPlan, ...plans]);
        return newPlan;
      },
    ),
  update: (id: string, payload: Partial<MealPlan>) =>
    apiFetch<MealPlan>(
      `/api/nutrition/plans/${id}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      () => {
        const plans = getStorage<MealPlan[]>('meal_plans', INITIAL_MEAL_PLANS);
        const idx = plans.findIndex((p) => p.id === id);
        if (idx === -1) throw new ApiError(404, 'Plan introuvable');
        plans[idx] = { ...plans[idx], ...payload };
        setStorage('meal_plans', plans);
        return plans[idx];
      },
    ),
};

// ── Notifications ──────────────────────────────────────────────────────────────

export const notifications = {
  list: () =>
    apiFetch<Notification[]>(
      '/api/notifications',
      {},
      () => getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS),
    ),
  markRead: (id: string) =>
    apiFetch<void>(
      `/api/notifications/${id}/read`,
      { method: 'POST' },
      () => {
        const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
        setStorage(
          'notifications',
          notifs.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      },
    ),
  markAllRead: () =>
    apiFetch<void>(
      '/api/notifications/read-all',
      { method: 'POST' },
      () => {
        const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
        setStorage(
          'notifications',
          notifs.map((n) => ({ ...n, read: true })),
        );
      },
    ),
};

// ── Profile ────────────────────────────────────────────────────────────────────

export const profile = {
  update: (payload: Partial<Pick<User, 'full_name' | 'language'>>) =>
    apiFetch<User>(
      '/api/users/me',
      { method: 'PATCH', body: JSON.stringify(payload) },
      () => {
        const cur = getStorage<User | null>('user', DEMO_USERS.client);
        if (!cur) throw new ApiError(401, 'Non connecté');
        const updated = { ...cur, ...payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('fg_user', JSON.stringify(updated));
        }
        return updated;
      },
    ),
  changePassword: (old_password: string, new_password: string) =>
    apiFetch<void>(
      '/api/users/me/password',
      {
        method: 'POST',
        body: JSON.stringify({ old_password, new_password }),
      },
      () => {
        // success in demo mode
      },
    ),
};
