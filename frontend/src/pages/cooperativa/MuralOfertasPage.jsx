import { useState, useEffect, useMemo } from "react";
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

const categorias = [
  { value: "", label: "Todas as categorias" },
  { value: "plastico", label: "Plástico" },
  { value: "papel", label: "Papel" },
  { value: "vidro", label: "Vidro" },
  { value: "metal", label: "Metal" },
  { value: "eletronico", label: "Eletrônico" },
  { value: "organico", label: "Orgânico" },
  { value: "entulho", label: "Entulho" },
];

function extrairLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function labelCategoria(value) {
  return categorias.find((c) => c.value === value)?.label ?? value;
}

function formatarDataHora(dataStr) {
  if (!dataStr) return null;
  return new Date(dataStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarJanela(residuo) {
  const inicio = formatarDataHora(residuo.janela_inicio);
  const fim = formatarDataHora(residuo.janela_fim);
  if (inicio && fim) return `${inicio} — ${fim}`;
  if (inicio) return `A partir de ${inicio}`;
  if (fim) return `Até ${fim}`;
  return "Não informada";
}

export default function MuralOfertasPage() {
  const [residuos, setResiduos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [posicao, setPosicao] = useState([-24.7, -54.0]);

  useEffect(() => {
    setCarregando(true);
    api
      .get("/residuos")
      .then((res) => {
        const lista = extrairLista(res.data).filter(
          (r) => !r.status || r.status === "disponivel"
        );
        setResiduos(lista);
      })
      .catch(() => setResiduos([]))
      .finally(() => setCarregando(false));

    navigator.geolocation?.getCurrentPosition((pos) => {
      setPosicao([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const residuosFiltrados = useMemo(() => {
    if (!filtro) return residuos;
    return residuos.filter((r) => r.categoria === filtro);
  }, [residuos, filtro]);

  const residuosComCoordenadas = useMemo(
    () =>
      residuosFiltrados.filter(
        (r) =>
          r.latitude != null &&
          r.longitude != null &&
          !Number.isNaN(Number(r.latitude)) &&
          !Number.isNaN(Number(r.longitude))
      ),
    [residuosFiltrados]
  );

  const centroMapa = useMemo(() => {
    if (residuosComCoordenadas.length === 0) return posicao;
    const lat =
      residuosComCoordenadas.reduce((s, r) => s + Number(r.latitude), 0) /
      residuosComCoordenadas.length;
    const lng =
      residuosComCoordenadas.reduce((s, r) => s + Number(r.longitude), 0) /
      residuosComCoordenadas.length;
    return [lat, lng];
  }, [residuosComCoordenadas, posicao]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Mural de Ofertas
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categorias.map((c) => (
              <option key={c.value || "todas"} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <section className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
            Ofertas disponíveis
          </h2>

          {carregando ? (
            <p className="text-sm text-gray-500">Carregando ofertas...</p>
          ) : residuosFiltrados.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum resíduo disponível no momento.
            </p>
          ) : (
            <ul className="space-y-3">
              {residuosFiltrados.map((residuo) => (
                <li
                  key={residuo.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-green-800">
                    {labelCategoria(residuo.categoria)}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {residuo.descricao}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="text-gray-500">Peso estimado:</span>{" "}
                    {residuo.peso_estimado != null
                      ? `${Number(residuo.peso_estimado)} kg`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-gray-500">Janela de retirada:</span>{" "}
                    {formatarJanela(residuo)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
            Mapa das ofertas
          </h2>
          <div
            className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            style={{ height: 320 }}
          >
            <MapContainer
              center={centroMapa}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {residuosComCoordenadas.map((residuo) => (
                <Marker
                  key={residuo.id}
                  position={[Number(residuo.latitude), Number(residuo.longitude)]}
                >
                  <Popup>
                    <strong>{labelCategoria(residuo.categoria)}</strong>
                    <br />
                    {residuo.descricao}
                    <br />
                    <span>
                      Peso:{" "}
                      {residuo.peso_estimado != null
                        ? `${Number(residuo.peso_estimado)} kg`
                        : "—"}
                    </span>
                    <br />
                    <span className="text-xs">
                      Janela: {formatarJanela(residuo)}
                    </span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {residuosFiltrados.length > 0 && residuosComCoordenadas.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Nenhuma oferta com localização para exibir no mapa.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
