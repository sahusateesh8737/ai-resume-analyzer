import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const analyzeResume = async (formData) => {
  const response = await api.post('/analysis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/analysis/history');
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await api.get(`/analysis/history/${id}`);
  return response.data;
};

export const generateCoverLetter = async (id) => {
  const response = await api.post(`/analysis/${id}/cover-letter`);
  return response.data;
};

export const generateInterviewQuestions = async (id) => {
  const response = await api.post(`/analysis/${id}/interview-prep`);
  return response.data;
};

export const checkGrammarTone = async (id) => {
  const response = await api.post(`/analysis/${id}/grammar-check`);
  return response.data;
};

// LinkedIn Auditor
export const auditLinkedIn = async (aboutText, jobDescription) => {
  const response = await api.post('/analysis/linkedin-audit', { aboutText, jobDescription });
  return response.data;
};

// Job Applications
export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const createApplication = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

export const updateApplication = async (id, applicationData) => {
  const response = await api.put(`/applications/${id}`, applicationData);
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

// Resume Builder & Tailoring
export const getResume = async (id) => {
  const response = await api.get(`/resume/${id}`);
  return response.data;
};

export const tailorResume = async (id, jobDescription) => {
  const response = await api.post(`/resume/${id}/tailor`, { jobDescription });
  return response.data;
};

export const resolveTailorDiffs = async (resumeId, tailorId, resolutions) => {
  const response = await api.post(`/resume/${resumeId}/tailor/${tailorId}/resolve`, { resolutions });
  return response.data;
};

export const downloadExport = async (resumeId, format, template = 'modern') => {
  const response = await api.get(`/resume/${resumeId}/export/${format}?template=${template}`, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  const extension = format === 'latex' ? 'tex' : format;
  link.setAttribute('download', `resume.${extension}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;
