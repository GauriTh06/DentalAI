// ─────────────────────────────────────────────────────────────────────────────
// api.ts — Self-contained localStorage auth (no backend required)
//  Set USE_MOCK = false and BACKEND_URL to your API to use a real backend.
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_URL = (import.meta.env.VITE_API_URL as string) || 'https://dental-ai-backend-55pq.onrender.com/api';
const USE_MOCK = true; // always use localStorage mock — change to false for real backend


// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'patient' | 'dentist' | 'admin';
  created_at: string;
}

export interface PredictionResult {
  label: string;
  confidence: number;
  severity?: string;
  severity_val?: number;
  heatmap_url?: string;
  recommendations: string[];
}

export interface Scan {
  _id: string;
  patient_id: string;
  scan_type: 'caries' | 'orthodontic' | 'oral_cancer';
  image_url: string;
  prediction_result: PredictionResult;
  dentist_notes?: string;
  dentist_reviewed: boolean;
  created_at: string;
}

export interface HealthScore {
  _id: string;
  patient_id: string;
  caries_score: number;
  orthodontic_score: number;
  cancer_score: number;
  total_score: number;
  status: 'Excellent' | 'Good' | 'Moderate' | 'Critical';
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('dentalai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const makeId = () => Math.random().toString(36).slice(2, 14).padEnd(24, '0');

// ─────────────────────────────────────────────────────────────────────────────
// MOCK implementation (localStorage-based, no backend needed)
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  users: 'dentalai_mock_users',
  scans: 'dentalai_mock_scans',
  health: 'dentalai_mock_health',
  token: 'dentalai_token',
  currentUser: 'dentalai_current_user',
};

const ls = {
  get: <T>(key: string): T[] => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },
  set: (key: string, val: unknown) =>
    localStorage.setItem(key, JSON.stringify(val)),
};

// Simple hash — NOT cryptographic, just for demo parity
const simpleHash = (str: string): string => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return 'hashed_' + Math.abs(h).toString(36);
};

// Create a fake JWT-like token (base64 JSON — readable but not signed)
const makeToken = (user: User): string => {
  const payload = { sub: user.email, role: user.role, _id: user._id, name: user.name };
  return btoa(JSON.stringify(payload));
};

const decodeToken = (token: string): { sub: string; role: string; _id: string; name: string } | null => {
  try { return JSON.parse(atob(token)); }
  catch { return null; }
};

// Seed a default admin/dentist account on first load
const seedDefaults = () => {
  const users = ls.get<User & { hashed_password: string }>(STORAGE_KEYS.users);
  if (users.length === 0) {
    const defaults = [
      { email: 'admin@dental.ai', password: 'admin123', name: 'Admin User', role: 'admin' as const },
      { email: 'dentist@dental.ai', password: 'dentist123', name: 'Dr. Smith', role: 'dentist' as const },
      { email: 'patient@dental.ai', password: 'patient123', name: 'Jane Doe', role: 'patient' as const },
    ];
    const seeded = defaults.map(u => ({
      _id: makeId(),
      email: u.email,
      name: u.name,
      role: u.role,
      created_at: new Date().toISOString(),
      hashed_password: simpleHash(u.password),
    }));
    ls.set(STORAGE_KEYS.users, seeded);
  }
};

seedDefaults();

// ─────────────────────────────────────────────────────────────────────────────
// Unified API object
// ─────────────────────────────────────────────────────────────────────────────
export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  async register(data: any): Promise<User> {
    if (USE_MOCK) {
      const users = ls.get<User & { hashed_password: string }>(STORAGE_KEYS.users);
      if (users.find(u => u.email === data.email)) {
        throw new Error('A user with this email already exists.');
      }
      const newUser: User & { hashed_password: string } = {
        _id: makeId(),
        email: data.email,
        name: data.name,
        role: data.role || 'patient',
        created_at: new Date().toISOString(),
        hashed_password: simpleHash(data.password),
      };
      ls.set(STORAGE_KEYS.users, [...users, newUser]);
      const { hashed_password: _, ...safeUser } = newUser;
      return safeUser as User;
    }

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Registration failed'); }
    return res.json();
  },

  async login(data: any): Promise<{ access_token: string; role: string; name: string }> {
    if (USE_MOCK) {
      const users = ls.get<User & { hashed_password: string }>(STORAGE_KEYS.users);
      const user = users.find(u => u.email === data.email);
      if (!user || user.hashed_password !== simpleHash(data.password)) {
        throw new Error('Incorrect email or password');
      }
      const { hashed_password: _, ...safeUser } = user;
      const token = makeToken(safeUser as User);
      return { access_token: token, role: user.role, name: user.name };
    }

    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Login failed'); }
    return res.json();
  },

  async getMe(): Promise<User> {
    if (USE_MOCK) {
      const token = localStorage.getItem(STORAGE_KEYS.token);
      if (!token) throw new Error('Not authenticated');
      const payload = decodeToken(token);
      if (!payload) throw new Error('Invalid token');
      const users = ls.get<User & { hashed_password: string }>(STORAGE_KEYS.users);
      const user = users.find(u => u.email === payload.sub);
      if (!user) throw new Error('User not found');
      const { hashed_password: _, ...safeUser } = user;
      return safeUser as User;
    }

    const res = await fetch(`${BACKEND_URL}/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to retrieve profile');
    return res.json();
  },

  // ── Scans ───────────────────────────────────────────────────────────────────
  async uploadScan(type: 'caries' | 'orthodontic' | 'oral_cancer', file: File): Promise<Scan> {
    if (USE_MOCK) {
      const token = localStorage.getItem(STORAGE_KEYS.token);
      const payload = token ? decodeToken(token) : null;
      const mockResults: Record<string, PredictionResult> = {
        caries: {
          label: 'Moderate Caries Detected',
          confidence: 0.87,
          severity: 'Moderate',
          severity_val: 2,
          recommendations: ['Schedule a filling appointment', 'Improve brushing technique', 'Reduce sugar intake'],
        },
        orthodontic: {
          label: 'Class II Malocclusion',
          confidence: 0.79,
          recommendations: ['Orthodontic consultation recommended', 'Consider braces or aligners'],
        },
        oral_cancer: {
          label: 'No Malignancy Detected',
          confidence: 0.94,
          recommendations: ['Routine check-up in 6 months', 'Avoid tobacco products'],
        },
      };
      const scan: Scan = {
        _id: makeId(),
        patient_id: payload?._id || makeId(),
        scan_type: type,
        image_url: URL.createObjectURL(file),
        prediction_result: mockResults[type],
        dentist_reviewed: false,
        created_at: new Date().toISOString(),
      };
      const scans = ls.get<Scan>(STORAGE_KEYS.scans);
      ls.set(STORAGE_KEYS.scans, [scan, ...scans]);
      return scan;
    }

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BACKEND_URL}/predict/${type}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Upload and diagnosis failed'); }
    return res.json();
  },

  // ── Patient ─────────────────────────────────────────────────────────────────
  async getHistory(): Promise<Scan[]> {
    if (USE_MOCK) {
      const token = localStorage.getItem(STORAGE_KEYS.token);
      const payload = token ? decodeToken(token) : null;
      const scans = ls.get<Scan>(STORAGE_KEYS.scans);
      return scans.filter(s => s.patient_id === payload?._id);
    }

    const res = await fetch(`${BACKEND_URL}/patient/history`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load patient history');
    return res.json();
  },

  async getHealthTrend(): Promise<HealthScore[]> {
    if (USE_MOCK) {
      const token = localStorage.getItem(STORAGE_KEYS.token);
      const payload = token ? decodeToken(token) : null;
      const stored = ls.get<HealthScore>(STORAGE_KEYS.health).filter(h => h.patient_id === payload?._id);
      if (stored.length > 0) return stored;
      // Return demo trend data
      return [
        { _id: makeId(), patient_id: payload?._id || '', caries_score: 70, orthodontic_score: 65, cancer_score: 95, total_score: 77, status: 'Good', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
        { _id: makeId(), patient_id: payload?._id || '', caries_score: 75, orthodontic_score: 70, cancer_score: 96, total_score: 80, status: 'Good', created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
        { _id: makeId(), patient_id: payload?._id || '', caries_score: 80, orthodontic_score: 72, cancer_score: 97, total_score: 83, status: 'Excellent', created_at: new Date().toISOString() },
      ];
    }

    const res = await fetch(`${BACKEND_URL}/patient/health-trend`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load health trends');
    return res.json();
  },

  async downloadReport(scanId: string, notes?: string): Promise<Blob> {
    if (USE_MOCK) {
      const text = `DentalAI Pro — Diagnostic Report\nScan ID: ${scanId}\nNotes: ${notes || 'N/A'}\nGenerated: ${new Date().toLocaleString()}`;
      return new Blob([text], { type: 'text/plain' });
    }

    const res = await fetch(`${BACKEND_URL}/patient/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ scan_id: scanId, dentist_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to generate PDF report');
    return res.blob();
  },

  // ── Chat ─────────────────────────────────────────────────────────────────────
  async sendChatMessage(message: string): Promise<{ response: string; timestamp: string }> {
    if (USE_MOCK) {
      const responses = [
        'Based on general dental guidelines, it is recommended to brush twice daily with fluoride toothpaste.',
        'Regular dental check-ups every 6 months are important for maintaining oral health.',
        'If you are experiencing tooth sensitivity, it could be due to enamel erosion or exposed dentine.',
        'Flossing daily helps remove plaque and food particles between teeth that brushing misses.',
        'A balanced diet low in sugar and acidic foods greatly reduces the risk of dental caries.',
      ];
      await new Promise(r => setTimeout(r, 800)); // simulate network delay
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
      };
    }

    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat assistant error');
    return res.json();
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  async getAdminAnalytics(): Promise<any> {
    if (USE_MOCK) {
      const users = ls.get<User>(STORAGE_KEYS.users);
      const scans = ls.get<Scan>(STORAGE_KEYS.scans);
      return {
        total_users: users.length,
        total_scans: scans.length,
        scans_by_type: { caries: 12, orthodontic: 8, oral_cancer: 5 },
        recent_activity: scans.slice(0, 5),
      };
    }

    const res = await fetch(`${BACKEND_URL}/admin/analytics`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async listAllUsers(): Promise<User[]> {
    if (USE_MOCK) {
      return ls.get<User & { hashed_password: string }>(STORAGE_KEYS.users).map(
        ({ hashed_password: _, ...u }) => u as User
      );
    }

    const res = await fetch(`${BACKEND_URL}/admin/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to list system users');
    return res.json();
  },

  async listAllScans(): Promise<Scan[]> {
    if (USE_MOCK) return ls.get<Scan>(STORAGE_KEYS.scans);

    const res = await fetch(`${BACKEND_URL}/admin/scans`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to list system scans');
    return res.json();
  },

  async submitDentistReview(scanId: string, notes: string): Promise<Scan> {
    if (USE_MOCK) {
      const scans = ls.get<Scan>(STORAGE_KEYS.scans);
      const idx = scans.findIndex(s => s._id === scanId);
      if (idx === -1) throw new Error('Scan not found');
      scans[idx] = { ...scans[idx], dentist_notes: notes, dentist_reviewed: true };
      ls.set(STORAGE_KEYS.scans, scans);
      return scans[idx];
    }

    const res = await fetch(`${BACKEND_URL}/admin/scans/${scanId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ dentist_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to submit clinical remarks');
    return res.json();
  },
};
