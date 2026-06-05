import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function EmpresaHome() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [totalResiduos, setTotalResiduos] = useState(0);
  const [totalCertificados, setTotalCertificados] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const nomeExibicao = usuario?.nome_empresa || usuario?.name || "Empresa";

  useEffect(() => {
    setCarregando(true);
    Promise.all([
      api
        .get("/residuos/meus")
        .then((res) => setTotalResiduos(extrairLista(res.data).length))
        .catch(() => setTotalResiduos(0)),
      api
        .get("/certificados")
        .then((res) => setTotalCertificados(extrairLista(res.data).length))
        .catch(() => setTotalCertificados(0)),
    ]).finally(() => setCarregando(false));
  }, []);

  const acoes = [
    {
      label: "Anunciar Lote",
      icon: "📦",
      path: "/empresa/anunciar",
      cor: "bg-green-600 hover:bg-green-700",
    },
    {
      label: "Ver Certificados",
      icon: "📜",
      path: "/empresa/certificados",
      cor: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
          Olá, {nomeExibicao}! 👋
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Painel da empresa — WasteGo
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-sm text-green-700 font-medium">Resíduos anunciados</p>
            <p className="text-3xl sm:text-4xl font-bold text-green-800 mt-1">
              {carregando ? "…" : totalResiduos}
            </p>
            <p className="text-xs text-green-600 mt-1">lotes cadastrados</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-sm text-blue-700 font-medium">Certificados emitidos</p>
            <p className="text-3xl sm:text-4xl font-bold text-blue-800 mt-1">
              {carregando ? "…" : totalCertificados}
            </p>
            <p className="text-xs text-blue-600 mt-1">CDF disponíveis</p>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {acoes.map((acao) => (
            <button
              key={acao.path}
              type="button"
              onClick={() => navigate(acao.path)}
              className={`${acao.cor} text-white rounded-xl p-4 sm:p-5 text-left transition active:scale-[0.98] shadow-sm`}
            >
              <span className="text-2xl block mb-2">{acao.icon}</span>
              <span className="text-sm sm:text-base font-medium">{acao.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
