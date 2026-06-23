import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const TOKEN_KEY = 'wastego_token';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Erro ao buscar token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Ignora o redirecionamento se o 401 vier da própria tentativa de login
      if (!error.config.url?.includes('/auth/login')) {
        try {
          await AsyncStorage.removeItem(TOKEN_KEY);
          // Redireciona para o login
          router.replace('/');
        } catch (e) {
          console.error('Erro ao remover token', e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
