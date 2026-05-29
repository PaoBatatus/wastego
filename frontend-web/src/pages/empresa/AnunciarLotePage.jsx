import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

const categorias = [
  { value: "plastico", label: "Plástico" },
  { value: "papel", label: "Papel" },
  { value: "vidro", label: "Vidro" },
  { value: "metal", label: "Metal" },
  { value: "eletronico", label: "Eletrônico" },
  { value: "organico", label: "Orgânico" },
  { value: "entulho", label: "Entulho" },
];

const statusConfig = {
  disponivel: { label: "Disponível", className: "bg-green-100 text-green-800" },
  reservado: { label: "Reservado", className: "bg-blue-100 text-blue-800" },
  coletado: { label: "Coletado", className: "bg-gray-100 text-gray-700" },
};

const formInicial = {
  categoria: "plastico",
  descricao: "",
  peso_estimado: "",
  latitude: "",
  longitude: "",
  janela_inicio: "",
  janela_fim: "",
};

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};


function labelCategoria(value) {
  return categorias.find((c) => c.value === value)?.label ?? value;
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

export default function AnunciarLotePage() {
  const [form, setForm] = useState(formInicial);
  const [localizacao, setLocalizacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [lotes, setLotes] = useState([]);
  const [carregandoLotes, setCarregandoLotes] = useState(true);

  const carregarLotes = useCallback(async () => {
    setCarregandoLotes(true);
    try {
      const { data } = await api.get("/residuos/meus");
      console.log("Lotes recebidos:", data);
      setLotes(extrairLista(data));
    } catch {
      setLotes([]);
    } finally {
      setCarregandoLotes(false);
    }
  }, []);

  useEffect(() => {
    carregarLotes();
  }, [carregarLotes]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function capturarLocalizacao() {
    if (!navigator.geolocation) {
      setErro("Geolocalização não suportada neste dispositivo.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setLocalizacao(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setErro("");
      },
      () => setErro("Não foi possível capturar a localização.")
    );
  }

  function limparFormulario() {
    setForm(formInicial);
    setLocalizacao(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.descricao.trim()) {
      setErro("Informe uma descrição do lote.");
      return;
    }
    if (!form.peso_estimado || Number(form.peso_estimado) <= 0) {
      setErro("Informe o peso estimado do lote.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setErro("Capture a localização antes de anunciar.");
      return;
    }
    setLoading(true);
    setErro("");
    setSucesso("");
    try {
      const payload = {
        categoria: form.categoria,
        descricao: form.descricao.trim(),
        peso_estimado: Number(form.peso_estimado),
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (form.janela_inicio) payload.janela_inicio = form.janela_inicio;
      if (form.janela_fim) payload.janela_fim = form.janela_fim;

      await api.post("/residuos", payload);
      setSucesso("Lote anunciado! Cooperativas serão notificadas.");
      limparFormulario();
      await carregarLotes();
    } catch {
      setErro("Erro ao anunciar lote. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Anunciar Lote
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white rounded-xl p-4 sm:p-0 sm:bg-transparent shadow-sm sm:shadow-none"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva o lote de resíduos..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso estimado (kg) <span className="text-red-500">*</span>
            </label>
            <input
              name="peso_estimado"
              type="number"
              min="0.01"
              step="0.01"
              value={form.peso_estimado}
              onChange={handleChange}
              placeholder="Ex: 500"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Janela de retirada (início){" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="janela_inicio"
              type="datetime-local"
              value={form.janela_inicio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Janela de retirada (fim){" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="janela_fim"
              type="datetime-local"
              value={form.janela_fim}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={capturarLocalizacao}
              className="w-full border border-blue-500 text-blue-600 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 active:bg-blue-100 transition-colors"
            >
              📍 Capturar Localização
            </button>
            {localizacao && (
              <p className="text-xs text-blue-600 mt-2">
                ✓ Localização capturada: {localizacao}
              </p>
            )}
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          {sucesso && (
            <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Anunciando..." : "Anunciar Lote"}
          </button>
        </form>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            Últimos lotes anunciados
          </h2>

          {carregandoLotes ? (
            <p className="text-sm text-gray-500">Carregando lotes...</p>
          ) : lotes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum lote anunciado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {lotes.map((lote) => {
                const status = statusConfig[lote.status] ?? {
                  label: lote.status,
                  className: "bg-gray-100 text-gray-700",
                };
                return (
                  <li
                    key={lote.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">
                        {labelCategoria(lote.categoria)}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {lote.peso_estimado != null
                        ? `${Number(lote.peso_estimado)} kg`
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatarData(lote.created_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
