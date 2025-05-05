import axios from 'axios';
import { toast } from 'react-toastify';
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication services
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to an expired token
    const expiredTokenErrors = [
      "jwt expired",
      "Token verification failed",
      "Unauthorized - Invalid token"
    ];
    
    if (error.response && 
        (error.response.status === 401 || error.response.status === 403) && 
        error.response.data) {
      
      const errorMessage = 
        error.response.data.error || 
        error.response.data.message || 
        JSON.stringify(error.response.data);
      
      // Check if any token expiration error message is included
      if (expiredTokenErrors.some(msg => errorMessage.includes(msg))) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        
        // Alert user (you could replace this with a more elegant modal)
        toast.info('Session expired. Please log in again.');
        
        // Redirect to login page
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);
export const loginWithQR = async (qr) => {
  try {
    const response = await api.post('/auth/qr', { qr });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const registerUser = async (userData) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      studentClass,  
      coursesTeaching,
      linkedStudentId
    } = userData;

    const requestData = {
      fullName,
      email,
      password,
      role,
      class: studentClass,  
    };

    // Add role-specific fields
    if (role === 'Teacher' && coursesTeaching) {
      requestData.coursesTeaching = coursesTeaching;
    }

    if (role === 'Parent' && linkedStudentId) {
      requestData.linkedStudentId = linkedStudentId;
    }

    const response = await api.post('/auth/register', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};



// Common user services (available to all authenticated users)




// Admin services
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const generateIDCard = async (userId) => {
  try {
    const response = await api.get(`/users/id-card/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};
/// generate new qr code 
export const generateQRCode = async (userId) => {
  try {
    const response = await api.post(`/users/generate-qr/${userId}`);
    return response.status;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const getLogs = async (filters = {}) => {
  try {
    const response = await api.get('/logs', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const verifyLogs = async () => {
  try {
    const response = await api.get('/logs/verify');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};
// Student services - Add these new functions to your existing log.jsx file

// Get available courses that students can register for
export const getAvailableCourses = async () => {
  try {
    const response = await api.get('users/courses/available');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Teacher services
export const getTeachingCourses = async () => {
  try {
    const response = await api.get('/users/courses/teaching');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Get the student's own grades
export const getStudentGrades = async () => {
  try {
    const response = await api.get('/users/result/result');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};
// course students 
export const getCourseStudents = async (courseCode) => {
  try {
    const response = await api.get(`/users/courses/${courseCode}/students`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const updateStudentGrade = async (studentId, courseCode, grade) => {
  try {
    const response = await api.patch(`/users/${studentId}/grades`, {
      courseCode,
      grade
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Student services
export const registerCourses = async (courses) => {
  try {
    const response = await api.patch('/users/register-courses', { courses });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export const requestAccountDeletion = async () => {
  try {
    const response = await api.post('/users/delete');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Parent services
export const getChildData = async () => {
  try {
    const response = await api.get('/users/parent/student');
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

export default api;