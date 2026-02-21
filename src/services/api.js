import axios from 'axios';

const API_URL =
    import.meta.env.VITE_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export const studentAPI = {
    getStudent: (id) => api.get(`/api/student/${id}`)
};

export const adminAPI = {
    login: (credentials) => api.post('/api/admin/login', credentials),

    getStudents: (params) => api.get('/api/admin/students', { params }),

    getStudent: (id) => api.get(`/api/admin/students/${id}`),

    addStudent: (data) => api.post('/api/admin/students', data),

    updateStudent: (id, data) => api.put(`/api/admin/students/${id}`, data),

    deleteStudent: (id) => api.delete(`/api/admin/students/${id}`),

    toggleStudentStatus: (id) => api.post(`/api/admin/students/${id}/toggle-status`),

    getStats: () => api.get('/api/admin/stats'),

    getArtists: (params) => api.get('/api/admin/artists', { params }),
    getArtist: (id) => api.get(`/api/admin/artists/${id}`),
    updateArtist: (id, data) => api.put(`/api/admin/artists/${id}`, data),

    uploadStudents: (file, schoolId, schoolCode) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('schoolId', schoolId);
        formData.append('schoolCode', schoolCode);

        return api.post('/api/upload/students', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    uploadPhoto: (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return api.post('/api/upload/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    downloadTemplate: (format = 'csv') => {
        return api.get(`/api/upload/template?format=${format}`, {
            responseType: 'blob'
        });
    }
};

export const schoolAPI = {
    getSchools: (params) => api.get('/api/school', { params }),

    getSchool: (id) => api.get(`/api/school/${id}`),

    createSchool: (data) => api.post('/api/school', data),

    updateSchool: (id, data) => api.put(`/api/school/${id}`, data),

    deleteSchool: (id) => api.delete(`/api/school/${id}`),

    toggleSchoolStatus: (id) => api.put(`/api/school/${id}/toggle-status`),

    getSchoolStudents: (id) => api.get(`/api/school/${id}/students`)
};

export const artistAPI = {
    getArtists: () => api.get('/api/artist'),
    getArtist: (id) => api.get(`/api/artist/${id}`),
    getArtistByToken: (token) => api.get(`/api/artist/token/${token}`),
    createArtist: (data) => api.post('/api/artist', data),
    updateArtist: (id, data) => api.put(`/api/artist/${id}`, data),
    deleteArtist: (id) => api.delete(`/api/artist/${id}`),
    getStats: () => api.get('/api/artist/stats/overview'),
    quickCreateArtist: () => api.post('/api/artist/quick-create'),
    setupProfile: (token, data) => api.put(`/api/artist/setup/${token}`, data),
    getArtistById: (id) => api.get(`/api/artist/profile?id=${id}`),
    uploadPhoto: (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return api.post('/api/artist/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default api;
