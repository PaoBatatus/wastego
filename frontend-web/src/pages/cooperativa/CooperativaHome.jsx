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

export default function CooperativaHome() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [disponiveis, setDisponiveis] = useState(0);
  const [coletasRealizadas, setColetasRealizadas] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const nomeExibicao = usuario?.nome_empresa || usuario?.name || "Cooperativa";

  useEffect(() => {
    setCarregando(true);
    api
      .get("/residuos")
      .then((res) => {
        const lista = extrairLista(res.data?.data ?? res.data);
        const disponiveis = lista.filter((r) => r.status === "disponivel").length;
        const coletados = lista.filter((r) => r.status === "coletado").length;
        setDisponiveis(disponiveis);
        setColetasRealizadas(coletados);
      })
      .catch(() => {
        setDisponiveis(0);
        setColetasRealizadas(0);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
          Olá, {nomeExibicao}! 👋
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Painel da cooperativa — WasteGo
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-sm text-green-700 font-medium">
              Resíduos disponíveis
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-green-800 mt-1">
              {carregando ? "…" : disponiveis}
            </p>
            <p className="text-xs text-green-600 mt-1">prontos para coleta</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-sm text-emerald-700 font-medium">
              Coletas realizadas
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-emerald-800 mt-1">
              {carregando ? "…" : coletasRealizadas}
            </p>
            <p className="text-xs text-emerald-600 mt-1">concluídas por você</p>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
          Ação rápida
        </h2>
        <button
          type="button"
          onClick={() => navigate("/cooperativa/mural")}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 sm:px-6 sm:py-5 text-left transition active:scale-[0.98] shadow-sm"
        >
          <span className="text-2xl block mb-2">📋</span>
          <span className="text-sm sm:text-base font-medium">
            Ver Mural de Ofertas
          </span>
        </button>
      </div>
    </Layout>
  );
}
