import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";

const pontosPorCategoria = [
  { categoria: "Eletrônico", pontos: 50 },
  { categoria: "Metal", pontos: 30 },
  { categoria: "Vidro", pontos: 20 },
  { categoria: "Outros", pontos: 10 },
];

const beneficios = [
  { titulo: "Desconto em evento cultural", custo: 100 },
  { titulo: "Voucher em comércio parceiro", custo: 200 },
  { titulo: "Crédito na taxa de coleta", custo: 500 },
];

function formatarData(dataStr) {
  if (!dataStr) return "—";
  return new Date(dataStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MoedaVerdePage() {
  const [saldo, setSaldo] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    Promise.all([
      api.get("/pontos").then((res) => setSaldo(res.data.data?.saldo ?? 0)),
      api
        .get("/pontos/historico")
        .then((res) => {
          const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
          setHistorico(lista);
        })
        .catch(() => setHistorico([])),
    ])
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-1 sm:px-0 space-y-6 sm:space-y-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Moeda Verde</h1>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <p className="text-sm sm:text-base text-green-100 font-medium">Seu saldo</p>
          <p className="text-5xl sm:text-6xl font-bold mt-1 tracking-tight">
            {carregando ? "…" : saldo}
          </p>
          <p className="text-sm text-green-100 mt-2">pontos disponíveis</p>
        </div>

        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            Pontos por categoria
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                    Categoria
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {pontosPorCategoria.map((item, i) => (
                  <tr
                    key={item.categoria}
                    className={i < pontosPorCategoria.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <td className="px-4 py-3 text-gray-800">{item.categoria}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      {item.pontos} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            Histórico
          </h2>
          {carregando ? (
            <p className="text-sm text-gray-500">Carregando histórico...</p>
          ) : historico.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
          ) : (
            <ul className="space-y-2">
              {historico.map((item) => {
                const isGanho = item.tipo === "ganho";
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isGanho
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      aria-hidden
                    >
                      {isGanho ? "+" : "−"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.descricao}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatarData(item.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold flex-shrink-0 ${
                        isGanho ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {isGanho ? "+" : "−"}
                      {Math.abs(item.pontos)} pts
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            Benefícios disponíveis
          </h2>
          <ul className="space-y-3">
            {beneficios.map((b) => (
              <li
                key={b.titulo}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <p className="text-sm font-medium text-gray-800">{b.titulo}</p>
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {b.custo} pts
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
