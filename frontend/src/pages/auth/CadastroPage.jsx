import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function CadastroPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    senha_confirmation: "",
    perfil: "cidadao",
    nome_empresa: "",
    telefone: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (form.senha !== form.senha_confirmation) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      const usuario = await login(form.email, form.senha);
      const rotas = {
        cidadao: "/cidadao",
        empresa: "/empresa",
        cooperativa: "/cooperativa",
        gestor: "/gestor",
      };
      navigate(rotas[usuario.perfil] || "/");
    } catch (err) {
      const erros = err.response?.data?.errors;
      if (erros) {
        setErro(Object.values(erros).flat().join(" "));
      } else {
        setErro("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">♻</span>
          <h1 className="text-2xl font-bold text-green-700 mt-2">WasteGo</h1>
          <p className="text-gray-500 text-sm">Criar nova conta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select name="perfil" value={form.perfil} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="cidadao">Cidadão</option>
              <option value="empresa">Empresa</option>
              <option value="cooperativa">Cooperativa</option>
              <option value="gestor">Gestor Municipal</option>
            </select>
          </div>
          {(form.perfil === "empresa" || form.perfil === "cooperativa") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.perfil === "empresa" ? "Nome da Empresa" : "Nome da Cooperativa"}
              </label>
              <input name="nome_empresa" value={form.nome_empresa} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
            <input name="telefone" value={form.telefone} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input name="senha" type="password" value={form.senha} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <input name="senha_confirmation" type="password" value={form.senha_confirmation} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{" "}
          <Link to="/" className="text-green-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}