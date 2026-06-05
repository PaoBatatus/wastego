import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("wastego_usuario");
    const tokenSalvo = localStorage.getItem("wastego_token");
    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      setToken(tokenSalvo);
    }
  }, []);

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    console.log("Resposta da API:", response.data);
    const { data } = response.data;
    localStorage.setItem("wastego_token", data.token);
    localStorage.setItem("wastego_usuario", JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }

  async function register(dados) {
    const response = await api.post("/auth/register", dados);
    return response.data;
  }

  function logout() {
    localStorage.removeItem("wastego_token");
    localStorage.removeItem("wastego_usuario");
    setToken(null);
    setUsuario(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;