import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AnunciarResiduoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    categoria: "plastico",
    descricao: "",
    peso_estimado: "",
    latitude: "",
    longitude: "",
    janela_inicio: "",
    janela_fim: "",
  });
  const [localizacao, setLocalizacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

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
        setForm({
          ...form,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocalizacao(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      () => setErro("Não foi possível capturar a localização.")
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      setErro("Capture sua localização antes de anunciar.");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const dados = { ...form };
      if (!dados.janela_inicio) delete dados.janela_inicio;
      if (!dados.janela_fim) delete dados.janela_fim;
      if (!dados.peso_estimado) delete dados.peso_estimado;
      console.log("Dados enviados:", dados);
      const resposta = await api.post("/residuos", dados);
      console.log("Resíduo criado:", resposta.data);
      navigate("/cidadao");
    }  catch (err) {
      console.log("Status do erro:", err.response?.status);
      console.log("Erro completo:", err);
      setErro("Erro ao criar anúncio. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Anunciar Resíduo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso estimado (kg)</label>
            <input name="peso_estimado" type="number" value={form.peso_estimado} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Janela de retirada (início)</label>
            <input name="janela_inicio" type="datetime-local" value={form.janela_inicio} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Janela de retirada (fim)</label>
            <input name="janela_fim" type="datetime-local" value={form.janela_fim} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <button type="button" onClick={capturarLocalizacao}
              className="w-full border border-green-500 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-50">
              📍 Capturar Minha Localização
            </button>
            {localizacao && (
              <p className="text-xs text-green-600 mt-1">✓ Localização capturada: {localizacao}</p>
            )}
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? "Anunciando..." : "Anunciar Resíduo"}
          </button>
        </form>
      </div>
    </Layout>
  );
}