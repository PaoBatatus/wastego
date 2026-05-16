import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

const tiposResiduo = {
  plastico: "Plástico",
  papel: "Papel",
  vidro: "Vidro",
  metal: "Metal",
  eletronico: "Eletrônico",
  organico: "Orgânico",
  entulho: "Entulho",
};

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function labelTipoResiduo(value) {
  if (!value) return "—";
  return tiposResiduo[value] ?? value;
}

function formatarData(dataStr) {
  if (!dataStr) return "—";
  return new Date(dataStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [baixandoId, setBaixandoId] = useState(null);
  const [erroDownload, setErroDownload] = useState("");

  const carregarCertificados = useCallback(async () => {
    setCarregando(true);
    setErroDownload("");
    try {
      const params = {};
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;
      const { data } = await api.get("/certificados", { params });
      setCertificados(extrairLista(data));
    } catch {
      setCertificados([]);
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarCertificados();
  }, [carregarCertificados]);

  async function handleDownload(id) {
    setBaixandoId(id);
    setErroDownload("");
    try {
      const response = await api.get(`/certificados/${id}/download`, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        const url = json?.data?.url ?? json?.url ?? json?.pdf_url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          return;
        }
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErroDownload("Não foi possível baixar o certificado. Tente novamente.");
    } finally {
      setBaixandoId(null);
    }
  }

  function limparFiltro() {
    setDataInicio("");
    setDataFim("");
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Meus Certificados
        </h1>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Filtrar por período</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {(dataInicio || dataFim) && (
            <button
              type="button"
              onClick={limparFiltro}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {erroDownload && (
          <p className="text-red-500 text-sm mb-4">{erroDownload}</p>
        )}

        {carregando ? (
          <p className="text-sm text-gray-500">Carregando certificados...</p>
        ) : certificados.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Nenhum certificado emitido ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {certificados.map((cert) => (
              <li
                key={cert.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold text-blue-800 truncate">
                      {cert.numero_certificado}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-500">Resíduo:</span>{" "}
                      {labelTipoResiduo(cert.tipo_residuo)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-500">Peso coletado:</span>{" "}
                      {cert.peso_coletado != null
                        ? `${Number(cert.peso_coletado)} kg`
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Coleta em {formatarData(cert.data_coleta)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(cert.id)}
                    disabled={baixandoId === cert.id}
                    className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {baixandoId === cert.id ? "Abrindo..." : "Download"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
