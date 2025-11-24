import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

// API Configuration
// IMPORTANT: Change based on your testing environment
// - Android Emulator: Use 10.0.2.2
// - iOS Simulator: Use localhost
// - Real Device: Use your computer's IP (run: ipconfig)

// For Android Emulator:
// const API_URL = 'http://10.0.2.2:5000/api';
// const SOCKET_URL = 'http://10.0.2.2:5000';

// For Real Android Device (uncomment these and comment above):
const API_URL = 'http://10.207.41.84:3000/api';
const SOCKET_URL = 'http://10.207.41.84:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Socket.io instance
let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    
    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
    });
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
  }
  return socket;
};

export const getSocket = () => socket;

// Auth API
export const authAPI = {
  sendVerificationCode: async (email) => {
    const response = await api.post('/auth/send-verification', { email });
    return response.data;
  },

  verifyCode: async (email, code) => {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  },

  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('studentTag');
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Room API
export const roomAPI = {
  createRoom: async (roomName, questionsVisible = true) => {
    const response = await api.post('/rooms', { roomName, questionsVisible });
    return response.data;
  },

  getMyRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoom: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  joinRoom: async (roomCode) => {
    const response = await api.post('/rooms/join', { roomCode });
    if (response.data.success) {
      // Generate student tag if not exists
      let studentTag = await AsyncStorage.getItem('studentTag');
      if (!studentTag) {
        const timestamp = Date.now().toString().slice(-4);
        studentTag = `Student ${timestamp}`;
        await AsyncStorage.setItem('studentTag', studentTag);
      }
      
      // Join socket room (non-blocking)
      try {
        const socket = getSocket() || initSocket();
        socket.emit('join-room', roomCode);
      } catch (socketError) {
        console.log('Socket connection warning:', socketError.message);
        // Continue anyway - socket is optional for viewing
      }
    }
    return response.data;
  },

  toggleVisibility: async (roomId) => {
    const response = await api.put(`/rooms/${roomId}/toggle-visibility`);
    if (response.data.success) {
      const socket = getSocket();
      if (socket) {
        const room = response.data.data;
        socket.emit('visibility-toggled', {
          roomCode: room.roomCode,
          questionsVisible: room.questionsVisible,
        });
      }
    }
    return response.data;
  },

  closeRoom: async (roomId, roomCode) => {
    const response = await api.put(`/rooms/${roomId}/close`);
    if (response.data.success) {
      const socket = getSocket();
      if (socket) {
        socket.emit('room-closed', { roomCode });
      }
    }
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};

// Question API
export const questionAPI = {
  getQuestions: async (roomId, studentTag = null, includeRejected = false) => {
    const params = studentTag ? { studentTag } : {};
    if (includeRejected) {
      params.includeRejected = 'true';
    }
    const response = await api.get(`/questions/room/${roomId}`, { params });
    return response.data;
  },

  askQuestion: async (questionText, roomId, roomCode) => {
    let studentTag = await AsyncStorage.getItem('studentTag');
    if (!studentTag) {
      const timestamp = Date.now().toString().slice(-4);
      studentTag = `Student ${timestamp}`;
      await AsyncStorage.setItem('studentTag', studentTag);
    }

    const response = await api.post('/questions', {
      questionText,
      roomId,
      studentTag,
    });

    return response.data;
  },

  upvoteQuestion: async (questionId, roomCode) => {
    const studentTag = await AsyncStorage.getItem('studentTag');
    const response = await api.put(`/questions/${questionId}/upvote`, { studentTag });

    return response.data;
  },

  reportQuestion: async (questionId) => {
    const studentTag = await AsyncStorage.getItem('studentTag');
    const response = await api.put(`/questions/${questionId}/report`, { studentTag });
    return response.data;
  },

  answerQuestion: async (questionId, roomCode) => {
    const response = await api.put(`/questions/${questionId}/answer`);
    
    if (response.data.success) {
      const socket = getSocket();
      if (socket) {
        socket.emit('question-answered', { roomCode, questionId });
      }
    }

    return response.data;
  },

  deleteQuestion: async (questionId, roomCode) => {
    const response = await api.delete(`/questions/${questionId}`);
    
    if (response.data.success) {
      const socket = getSocket();
      if (socket) {
        socket.emit('question-deleted', { roomCode, questionId });
      }
    }

    return response.data;
  },

  restoreQuestion: async (questionId) => {
    const response = await api.put(`/questions/${questionId}/restore`);
    return response.data;
  },

  permanentDeleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}/permanent`);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (name, email) => {
    const response = await api.put('/users/profile', { name, email });
    if (response.data.success) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default api;
