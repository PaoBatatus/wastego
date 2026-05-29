import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const usuario = await login(email, senha);
      const rotas = {
        cidadao: "/cidadao",
        empresa: "/empresa",
        cooperativa: "/cooperativa",
        gestor: "/gestor",
      };
      navigate(rotas[usuario.perfil] || "/");
    } catch (err) {
      setErro("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">♻</span>
          <h1 className="text-2xl font-bold text-green-700 mt-2">WasteGo</h1>
          <p className="text-gray-500 text-sm">Gestão Inteligente de Resíduos</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-green-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}