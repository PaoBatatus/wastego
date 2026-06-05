import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api, { TOKEN_KEY } from "../services/api";

interface Usuario {
  id: number;
  nome?: string;
  email: string;
  perfil: string;
  [key: string]: any;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<Usuario>;
  register: (dados: any) => Promise<any>;
  logout: () => void;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("wastego_usuario");
        const tokenSalvo = await AsyncStorage.getItem(TOKEN_KEY);
        if (usuarioSalvo && tokenSalvo) {
          setUsuario(JSON.parse(usuarioSalvo));
          setToken(tokenSalvo);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário", e);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  async function login(email: string, senha: string): Promise<Usuario> {
    const response = await api.post("/auth/login", { email, senha });
    
    if (!response?.data?.data) {
      throw new Error("Resposta inválida do servidor. Verifique sua conexão.");
    }

    const { data } = response.data;
    
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem("wastego_usuario", JSON.stringify(data.usuario));
    
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }

  async function register(dados: any) {
    const response = await api.post("/auth/register", dados);
    return response.data;
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem("wastego_usuario");
    setToken(null);
    setUsuario(null);
    router.replace("/");
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, register, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
