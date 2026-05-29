import { useState, useEffect } from "react";
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

const tiposResiduos = [
  { value: "", label: "Todos os tipos" },
  { value: "plastico", label: "Plástico" },
  { value: "papel", label: "Papel" },
  { value: "vidro", label: "Vidro" },
  { value: "metal", label: "Metal" },
  { value: "eletronico", label: "Eletrônico" },
  { value: "organico", label: "Orgânico" },
];

export default function MapaEcopontosPage() {
  const [ecopontos, setEcopontos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [posicao, setPosicao] = useState([-24.7, -54.0]);

  useEffect(() => {
    api.get("/ecopontos").then((res) => {
      setEcopontos(res.data.data || []);
    }).catch(() => {});

    navigator.geolocation?.getCurrentPosition((pos) => {
      setPosicao([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const ecopontosFiltrados = filtro
    ? ecopontos.filter((e) => e.tipos_residuo?.includes(filtro))
    : ecopontos;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mapa de Ecopontos</h1>

        <div className="mb-4">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {tiposResiduos.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 mb-6" style={{ height: 400 }}>
          <MapContainer center={posicao} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {ecopontosFiltrados.map((ep) => (
              <Marker key={ep.id} position={[ep.latitude, ep.longitude]}>
                <Popup>
                  <strong>{ep.nome}</strong><br />
                  {ep.endereco}<br />
                  {ep.horario_funcionamento && <span>Horário: {ep.horario_funcionamento}</span>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Ecopontos disponíveis</h2>
        <div className="space-y-3">
          {ecopontosFiltrados.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhum ecoponto encontrado.</p>
          )}
          {ecopontosFiltrados.map((ep) => (
            <div key={ep.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-800">{ep.nome}</p>
              <p className="text-sm text-gray-500">{ep.endereco}</p>
              {ep.horario_funcionamento && (
                <p className="text-xs text-green-600 mt-1">⏰ {ep.horario_funcionamento}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}