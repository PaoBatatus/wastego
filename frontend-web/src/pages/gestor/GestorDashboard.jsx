import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrigir ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const labelsCategoria = {
  plastico: "Plástico",
  papel: "Papel",
  vidro: "Vidro",
  metal: "Metal",
  eletronico: "Eletrônico",
  organico: "Orgânico",
  entulho: "Entulho",
};

const labelsStatus = {
  recebida: "Recebida",
  em_analise: "Em análise",
  resolvida: "Resolvida",
  cancelada: "Cancelada",
};

const coresStatus = {
  recebida: "#ef4444",
  em_analise: "#eab308",
  resolvida: "#22c55e",
};

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function extrairObjeto(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data.data ?? data;
  }
  return data ?? {};
}

function labelCategoria(value) {
  return labelsCategoria[value] ?? value ?? "—";
}

function criarIconeStatus(status) {
  const cor = coresStatus[status] ?? "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="background:${cor};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function normalizarResumo(data) {
  const obj = extrairObjeto(data);
  const totalDenuncias = Object.values(obj.denuncias_por_status ?? {}).reduce((a, b) => a + b, 0);
  const totalUsuarios = Object.values(obj.usuarios_por_perfil ?? {}).reduce((a, b) => a + b, 0);
  return {
    totalResiduos: obj.total_residuos_anunciados ?? 0,
    totalDenuncias,
    totalUsuarios,
    totalCertificados: obj.total_certificados_emitidos ?? 0,
  };
}

function normalizarCategorias(data) {
  return extrairLista(data).map((item) => ({
    categoria: labelCategoria(item.categoria ?? item.name),
    total: item.total ?? item.quantidade ?? item.value ?? 0,
  }));
}

function normalizarVolume(data) {
  return extrairLista(data).map((item) => ({
    mes: item.mes ?? item.mes_label ?? item.month ?? item.periodo ?? "—",
    volume: item.volume ?? item.total ?? item.quantidade ?? 0,
  }));
}

const cardsResumo = [
  {
    key: "totalResiduos",
    label: "Resíduos",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
  },
  {
    key: "totalDenuncias",
    label: "Denúncias",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  {
    key: "totalUsuarios",
    label: "Usuários",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  {
    key: "totalCertificados",
    label: "Certificados",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
];

export default function GestorDashboard() {
  const [carregando, setCarregando] = useState(true);
  const [resumo, setResumo] = useState({
    totalResiduos: 0,
    totalDenuncias: 0,
    totalUsuarios: 0,
    totalCertificados: 0,
  });
  const [residuosCategoria, setResiduosCategoria] = useState([]);
  const [volumeMensal, setVolumeMensal] = useState([]);
  const [denunciasMapa, setDenunciasMapa] = useState([]);
  const [posicao, setPosicao] = useState([-24.7, -54.0]);

  useEffect(() => {
    setCarregando(true);
    Promise.all([
      api.get("/dashboard/resumo").then((res) => setResumo(normalizarResumo(res.data))),
      api
        .get("/dashboard/residuos-categoria")
        .then((res) => setResiduosCategoria(normalizarCategorias(res.data))),
      api
        .get("/dashboard/volume-mensal")
        .then((res) => setVolumeMensal(normalizarVolume(res.data))),
      api
        .get("/dashboard/denuncias-localizacao")
        .then((res) => setDenunciasMapa(extrairLista(res.data))),
    ])
      .catch(() => {})
      .finally(() => setCarregando(false));

    navigator.geolocation?.getCurrentPosition((pos) => {
      setPosicao([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const denunciasComCoordenadas = useMemo(
    () =>
      denunciasMapa.filter(
        (d) =>
          d.latitude != null &&
          d.longitude != null &&
          !Number.isNaN(Number(d.latitude)) &&
          !Number.isNaN(Number(d.longitude))
      ),
    [denunciasMapa]
  );

  const centroMapa = useMemo(() => {
    if (denunciasComCoordenadas.length === 0) return posicao;
    const lat =
      denunciasComCoordenadas.reduce((s, d) => s + Number(d.latitude), 0) /
      denunciasComCoordenadas.length;
    const lng =
      denunciasComCoordenadas.reduce((s, d) => s + Number(d.longitude), 0) /
      denunciasComCoordenadas.length;
    return [lat, lng];
  }, [denunciasComCoordenadas, posicao]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          Dashboard Municipal
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {cardsResumo.map((card) => (
            <div
              key={card.key}
              className={`rounded-xl border p-3 sm:p-4 shadow-sm ${card.bg} ${card.border}`}
            >
              <p className={`text-xs sm:text-sm font-medium ${card.text}`}>
                {card.label}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 ${card.text}`}>
                {carregando ? "…" : resumo[card.key]}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
              Resíduos por categoria
            </h2>
            {carregando ? (
              <p className="text-sm text-gray-500 h-64 flex items-center justify-center">
                Carregando...
              </p>
            ) : residuosCategoria.length === 0 ? (
              <p className="text-sm text-gray-500 h-64 flex items-center justify-center">
                Sem dados disponíveis.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={residuosCategoria} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="categoria"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, "Quantidade"]}
                    labelFormatter={(label) => `Categoria: ${label}`}
                  />
                  <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
              Volume mensal (12 meses)
            </h2>
            {carregando ? (
              <p className="text-sm text-gray-500 h-64 flex items-center justify-center">
                Carregando...
              </p>
            ) : volumeMensal.length === 0 ? (
              <p className="text-sm text-gray-500 h-64 flex items-center justify-center">
                Sem dados disponíveis.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={volumeMensal} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [value, "Volume"]}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
            Denúncias no mapa
          </h2>
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Recebida
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500" /> Em análise
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Resolvida
            </span>
          </div>
          <div
            className="rounded-lg overflow-hidden border border-gray-200"
            style={{ height: 360 }}
          >
            <MapContainer
              center={centroMapa}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {denunciasComCoordenadas.map((denuncia) => (
                <Marker
                  key={denuncia.id}
                  position={[Number(denuncia.latitude), Number(denuncia.longitude)]}
                  icon={criarIconeStatus(denuncia.status)}
                >
                  <Popup>
                    <strong>
                      {labelsStatus[denuncia.status] ?? denuncia.status ?? "Denúncia"}
                    </strong>
                    <br />
                    {denuncia.categoria && (
                      <>
                        Categoria: {denuncia.categoria}
                        <br />
                      </>
                    )}
                    {denuncia.descricao && (
                      <span className="text-xs">{denuncia.descricao}</span>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {!carregando && denunciasComCoordenadas.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Nenhuma denúncia com localização para exibir.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
