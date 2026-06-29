const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'https://dental-ai-backend-55pq.onrender.com/api';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('dentalai_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
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
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
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
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve profile');
    return res.json();
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
      const err = await res.json();
      throw new Error(err.detail || 'Upload and diagnosis failed');
    }
    return res.json();
  },

  // 3. Patient History & Trends
  async getHistory(): Promise<Scan[]> {
    const res = await fetch(`${API_BASE_URL}/patient/history`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load patient history');
    return res.json();
  },

  async getHealthTrend(): Promise<HealthScore[]> {
    const res = await fetch(`${API_BASE_URL}/patient/health-trend`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load health trends');
    return res.json();
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
    return res.json();
  },

  // 5. Admin Dashboard
  async getAdminAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async listAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list system users');
    return res.json();
  },

  async listAllScans(): Promise<Scan[]> {
    const res = await fetch(`${API_BASE_URL}/admin/scans`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list system scans');
    return res.json();
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
    return res.json();
  },
};
