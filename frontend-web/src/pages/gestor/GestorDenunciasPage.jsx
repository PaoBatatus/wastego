import { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

const ITENS_POR_PAGINA = 10;

const categorias = [
  { value: "", label: "Todas as categorias" },
  { value: "descarte_irregular", label: "Descarte irregular" },
  { value: "lixo_via_publica", label: "Lixo em via pública" },
  { value: "entulho", label: "Entulho" },
  { value: "poda_fora_calendario", label: "Poda fora do calendário" },
  { value: "outro", label: "Outro" },
];

const statusFiltro = [
  { value: "", label: "Todos os status" },
  { value: "recebida", label: "Recebida" },
  { value: "em_analise", label: "Em análise" },
  { value: "resolvida", label: "Resolvida" },
  { value: "cancelada", label: "Cancelada" },
];

const statusOpcoes = [
  { value: "recebida", label: "Recebida" },
  { value: "em_analise", label: "Em análise" },
  { value: "resolvida", label: "Resolvida" },
  { value: "cancelada", label: "Cancelada" },
];

const statusConfig = {
  recebida: { label: "Recebida", className: "bg-gray-100 text-gray-700" },
  em_analise: { label: "Em análise", className: "bg-yellow-100 text-yellow-800" },
  resolvida: { label: "Resolvida", className: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800" },
};

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function labelCategoria(value) {
  return categorias.find((c) => c.value === value)?.label ?? value ?? "—";
}

function resumirTexto(texto, max = 60) {
  if (!texto) return "—";
  return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}

function formatarData(dataStr) {
  if (!dataStr) return "—";
  return new Date(dataStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GestorDenunciasPage() {
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [denunciaSelecionada, setDenunciaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState("recebida");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarDenuncias = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const { data } = await api.get("/denuncias");
      setDenuncias(extrairLista(data));
    } catch {
      setDenuncias([]);
      setErro("Não foi possível carregar as denúncias.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDenuncias();
  }, [carregarDenuncias]);

  const denunciasFiltradas = useMemo(() => {
    return denuncias.filter((d) => {
      if (filtroStatus && d.status !== filtroStatus) return false;
      if (filtroCategoria && d.categoria !== filtroCategoria) return false;
      return true;
    });
  }, [denuncias, filtroStatus, filtroCategoria]);

  const totalPaginas = Math.max(1, Math.ceil(denunciasFiltradas.length / ITENS_POR_PAGINA));

  const denunciasPagina = useMemo(() => {
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    return denunciasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [denunciasFiltradas, pagina]);

  useEffect(() => {
    setPagina(1);
  }, [filtroStatus, filtroCategoria]);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  function abrirModal(denuncia) {
    setDenunciaSelecionada(denuncia);
    setNovoStatus(denuncia.status || "recebida");
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setDenunciaSelecionada(null);
  }

  async function confirmarStatus() {
    if (!denunciaSelecionada) return;
    setSalvando(true);
    setErro("");
    try {
      await api.put(`/denuncias/${denunciaSelecionada.id}/status`, {
        status: novoStatus,
      });
      fecharModal();
      await carregarDenuncias();
    } catch {
      setErro("Erro ao atualizar status. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Gestão de Denúncias
        </h1>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusFiltro.map((s) => (
                  <option key={s.value || "todos"} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Categoria</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categorias.map((c) => (
                  <option key={c.value || "todas"} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {erro && !modalAberto && (
          <p className="text-red-500 text-sm mb-4">{erro}</p>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Categoria</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Descrição</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Carregando denúncias...
                    </td>
                  </tr>
                ) : denunciasPagina.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma denúncia encontrada.
                    </td>
                  </tr>
                ) : (
                  denunciasPagina.map((denuncia) => {
                    const status = statusConfig[denuncia.status] ?? {
                      label: denuncia.status,
                      className: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <tr
                        key={denuncia.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gray-800 font-mono text-xs">
                          #{denuncia.id}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {labelCategoria(denuncia.categoria)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          {resumirTexto(denuncia.descricao)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {formatarData(denuncia.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => abrirModal(denuncia)}
                            className="text-xs font-medium text-green-700 hover:text-green-900 whitespace-nowrap"
                          >
                            Atualizar Status
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!carregando && denunciasFiltradas.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">
                {denunciasFiltradas.length} denúncia(s) — página {pagina} de{" "}
                {totalPaginas}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalAberto && denunciaSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={fecharModal}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
          >
            <h2 id="modal-titulo" className="text-lg font-semibold text-gray-800 mb-1">
              Atualizar status
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Denúncia #{denunciaSelecionada.id} —{" "}
              {labelCategoria(denunciaSelecionada.categoria)}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Novo status
            </label>
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            >
              {statusOpcoes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarStatus}
                disabled={salvando}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
