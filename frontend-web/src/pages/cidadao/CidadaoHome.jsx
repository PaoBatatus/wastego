import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

export default function CidadaoHome() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    api.get("/pontos").then((res) => setSaldo(res.data.data?.saldo || 0)).catch(() => {});
  }, []);

  const acoes = [
    { label: "Anunciar Resíduo", icon: "📦", path: "/cidadao/anunciar", cor: "bg-green-500" },
    { label: "Ver Mapa", icon: "🗺️", path: "/cidadao/mapa", cor: "bg-blue-500" },
    { label: "Fazer Denúncia", icon: "📸", path: "/cidadao/denunciar", cor: "bg-orange-500" },
    { label: "Meus Pontos", icon: "🌿", path: "/cidadao/pontos", cor: "bg-emerald-500" },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Olá, {usuario?.name}! 👋
        </h1>
        <p className="text-gray-500 text-sm mb-6">Bem-vindo ao WasteGo</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600 font-medium">Moeda Verde</p>
            <p className="text-3xl font-bold text-green-700">{saldo}</p>
            <p className="text-xs text-green-500">pontos acumulados</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">Impacto</p>
            <p className="text-3xl font-bold text-blue-700">🌍</p>
            <p className="text-xs text-blue-500">você faz a diferença</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">O que você quer fazer?</h2>
        <div className="grid grid-cols-2 gap-3">
          {acoes.map((acao) => (
            <button
              key={acao.path}
              onClick={() => navigate(acao.path)}
              className={`${acao.cor} text-white rounded-xl p-4 text-left hover:opacity-90 transition`}
            >
              <span className="text-2xl block mb-1">{acao.icon}</span>
              <span className="text-sm font-medium">{acao.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}