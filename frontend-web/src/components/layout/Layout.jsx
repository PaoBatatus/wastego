import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const menus = {
  cidadao: [
    { label: "Início", path: "/cidadao" },
    { label: "Anunciar Resíduo", path: "/cidadao/anunciar" },
    { label: "Mapa de Ecopontos", path: "/cidadao/mapa" },
    { label: "Denunciar", path: "/cidadao/denunciar" },
    { label: "Moeda Verde", path: "/cidadao/pontos" },
  ],
  empresa: [
    { label: "Início", path: "/empresa" },
    { label: "Anunciar Lote", path: "/empresa/anunciar" },
    { label: "Meus Certificados", path: "/empresa/certificados" },
  ],
  cooperativa: [
    { label: "Início", path: "/cooperativa" },
    { label: "Mural de Ofertas", path: "/cooperativa/mural" },
  ],
  gestor: [
    { label: "Dashboard", path: "/gestor" },
    { label: "Denúncias", path: "/gestor/denuncias" },
  ],
};

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const itensMenu = menus[usuario?.perfil] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-green-700 font-bold text-xl">♻ WasteGo</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{usuario?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <nav className="w-48 min-h-screen bg-white border-r border-gray-200 pt-6 px-2">
          {itensMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 mb-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}