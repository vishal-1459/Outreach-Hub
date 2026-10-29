import axios from 'axios';

// Read API base URL from Vite environment variable with reliable fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // accommodate PDF extraction on first load
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor for consistent error unwrapping
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response) {
      // FastAPI typically sends detail field in JSON responses
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors
        message = detail.map((err) => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ');
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `Server responded with status ${error.response.status}`;
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please make sure FastAPI is running on ' + API_BASE_URL;
    } else {
      message = error.message;
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export const healthService = {
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
  getRootInfo: async () => {
    const res = await apiClient.get('/');
    return res.data;
  },
};

export const contactsService = {
  getContacts: async ({ start, end, search } = {}) => {
    const params = {};
    if (start !== undefined && start !== null && start !== '') params.start = start;
    if (end !== undefined && end !== null && end !== '') params.end = end;
    if (search !== undefined && search !== null && search.trim() !== '') params.search = search.trim();

    const res = await apiClient.get('/contacts', { params });
    return res.data;
  },
};

export const outreachService = {
  getPreview: async ({ start, end }) => {
    const res = await apiClient.post('/preview', {
      start: Number(start),
      end: Number(end),
    });
    return res.data;
  },

  sendOutreach: async ({
    start,
    end,
    confirm = false,
    force = false,
    dry_run = false,
    delay_seconds = 5,
  }) => {
    const res = await apiClient.post('/send', {
      start: Number(start),
      end: Number(end),
      confirm: Boolean(confirm),
      force: Boolean(force),
      dry_run: Boolean(dry_run),
      delay_seconds: Number(delay_seconds),
    });
    return res.data;
  },
};

export const logsService = {
  getLogs: async ({ limit = 50, offset = 0 } = {}) => {
    const res = await apiClient.get('/logs', {
      params: { limit, offset },
    });
    return res.data;
  },
};

export default apiClient;

