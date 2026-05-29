import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const categorias = [
  { value: "descarte_irregular", label: "Descarte irregular" },
  { value: "lixo_via_publica", label: "Lixo em via pública" },
  { value: "entulho", label: "Entulho" },
  { value: "poda_fora_calendario", label: "Poda fora do calendário" },
  { value: "outro", label: "Outro" },
];

const statusConfig = {
  recebida: { label: "Recebida", className: "bg-gray-100 text-gray-700" },
  em_analise: { label: "Em análise", className: "bg-yellow-100 text-yellow-800" },
  resolvida: { label: "Resolvida", className: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", className: "bg-red-100 text-red-800" },
};

const formInicial = {
  categoria: "descarte_irregular",
  descricao: "",
  foto_url: "",
  latitude: "",
  longitude: "",
};

function labelCategoria(value) {
  return categorias.find((c) => c.value === value)?.label ?? value;
}

export default function DenunciarPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState(formInicial);
  const [localizacao, setLocalizacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

  const carregarHistorico = useCallback(async () => {
    if (!usuario) return;
    setCarregandoHistorico(true);
    try {
      const { data } = await api.get("/denuncias");
      const lista = data?.data?.data ?? data?.data ?? [];
      setHistorico(Array.isArray(lista) ? lista : []);
    } catch {
      setHistorico([]);
    } finally {
      setCarregandoHistorico(false);
    }
  }, [usuario]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

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
      setErro("Informe uma descrição da denúncia.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setErro("Capture sua localização antes de enviar.");
      return;
    }
    setLoading(true);
    setErro("");
    setSucesso("");
    try {
      const payload = {
        categoria: form.categoria,
        descricao: form.descricao.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (form.foto_url.trim()) {
        payload.foto_url = form.foto_url.trim();
      }
      await api.post("/denuncias", payload);
      setSucesso("Denúncia enviada! A prefeitura foi notificada.");
      limparFormulario();
      await carregarHistorico();
    } catch {
      setErro("Erro ao enviar denúncia. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
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

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Denunciar Problema
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-4 sm:p-0 sm:bg-transparent shadow-sm sm:shadow-none">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              placeholder="Descreva o problema observado..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da foto <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="foto_url"
              type="url"
              value={form.foto_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={capturarLocalizacao}
              className="w-full border border-green-500 text-green-600 py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 active:bg-green-100 transition-colors"
            >
              📍 Capturar Minha Localização
            </button>
            {localizacao && (
              <p className="text-xs text-green-600 mt-2">
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
            {loading ? "Enviando..." : "Enviar Denúncia"}
          </button>
        </form>

        <section className="mt-8 sm:mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Minhas Denúncias
          </h2>

          {carregandoHistorico ? (
            <p className="text-sm text-gray-500">Carregando histórico...</p>
          ) : historico.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma denúncia enviada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {historico.map((item) => {
                const status = statusConfig[item.status] ?? {
                  label: item.status,
                  className: "bg-gray-100 text-gray-700",
                };
                return (
                  <li
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">
                        {labelCategoria(item.categoria)}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatarData(item.created_at)}
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
