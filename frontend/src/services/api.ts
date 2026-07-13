const API_BASE_URL = '/api';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('dentalai_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Safe JSON error parser — prevents crash when backend returns empty body
// (e.g. 502/503 from Render free-tier cold starts)
const safeJsonError = async (res: Response): Promise<any> => {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
};

// Safe JSON success parser — prevents crash when backend returns truncated JSON body
const safeJsonResponse = async <T>(res: Response, context: string): Promise<T> => {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      throw new Error(
        `${context}: Server returned an empty response. The backend may still be waking up — please try again in a moment.`
      );
    }
    return JSON.parse(text) as T;
  } catch (e: any) {
    if (e.message.startsWith(context)) throw e;
    throw new Error(`${context}: The server response was incomplete. Please try again.`);
  }
};

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

export const api = {
  // 1. Auth Endpoints
  async register(data: any): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await safeJsonError(res);
      throw new Error(err.detail || `Registration failed (${res.status})`);
    }
    return safeJsonResponse<User>(res, 'Registration failed');
  },

  async login(data: any): Promise<{ access_token: string; role: string; name: string }> {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!res.ok) {
      const err = await safeJsonError(res);
      throw new Error(err.detail || `Login failed (${res.status})`);
    }
    return safeJsonResponse<{ access_token: string; role: string; name: string }>(res, 'Login failed');
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve profile');
    return safeJsonResponse<User>(res, 'Failed to retrieve profile');
  },

  // 2. Scan Upload & Prediction
  async uploadScan(type: 'caries' | 'orthodontic' | 'oral_cancer', file: File): Promise<Scan> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/predict/${type}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await safeJsonError(res);
      throw new Error(err.detail || `Upload and diagnosis failed (${res.status})`);
    }
    return safeJsonResponse<Scan>(res, 'Diagnosis response failed');
  },

  // 3. Patient History & Trends
  async getHistory(): Promise<Scan[]> {
    const res = await fetch(`${API_BASE_URL}/patient/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load patient history');
    return safeJsonResponse<Scan[]>(res, 'Failed to load patient history');
  },

  async getHealthTrend(): Promise<HealthScore[]> {
    const res = await fetch(`${API_BASE_URL}/patient/health-trend`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load health trends');
    return safeJsonResponse<HealthScore[]>(res, 'Failed to load health trends');
  },

  async downloadReport(scanId: string, notes?: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/patient/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ scan_id: scanId, dentist_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to generate PDF report');
    return res.blob();
  },

  // 4. Chat Assistant
  async sendChatMessage(message: string): Promise<{ response: string; timestamp: string }> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat assistant error');
    return safeJsonResponse<{ response: string; timestamp: string }>(res, 'Chat assistant error');
  },

  // 5. Admin Dashboard
  async getAdminAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return safeJsonResponse<any>(res, 'Failed to fetch admin stats');
  },

  async listAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list system users');
    return safeJsonResponse<User[]>(res, 'Failed to list system users');
  },

  async listAllScans(): Promise<Scan[]> {
    const res = await fetch(`${API_BASE_URL}/admin/scans`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list system scans');
    return safeJsonResponse<Scan[]>(res, 'Failed to list system scans');
  },

  async submitDentistReview(scanId: string, notes: string): Promise<Scan> {
    const res = await fetch(`${API_BASE_URL}/admin/scans/${scanId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ dentist_notes: notes }),
    });
    if (!res.ok) throw new Error('Failed to submit clinical remarks');
    return safeJsonResponse<Scan>(res, 'Failed to submit clinical remarks');
  },
};
