import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./index.css";

import LoginPage from "./pages/auth/LoginPage";
import CadastroPage from "./pages/auth/CadastroPage";
import CidadaoHome from "./pages/cidadao/CidadaoHome";
import AnunciarResiduoPage from "./pages/cidadao/AnunciarResiduoPage";
import MapaEcopontosPage from "./pages/cidadao/MapaEcopontosPage";
import DenunciarPage from "./pages/cidadao/DenunciarPage";
import MoedaVerdePage from "./pages/cidadao/MoedaVerdePage";
import EmpresaHome from "./pages/empresa/EmpresaHome";
import AnunciarLotePage from "./pages/empresa/AnunciarLotePage";
import CertificadosPage from "./pages/empresa/CertificadosPage";
import CooperativaHome from "./pages/cooperativa/CooperativaHome";
import MuralOfertasPage from "./pages/cooperativa/MuralOfertasPage";
import GestorDashboard from "./pages/gestor/GestorDashboard";
import GestorDenunciasPage from "./pages/gestor/GestorDenunciasPage";

function RotaProtegida({ children, perfil }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" />;
  if (perfil && usuario.perfil !== perfil) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          <Route
            path="/cidadao"
            element={
              <RotaProtegida perfil="cidadao">
                <CidadaoHome />
              </RotaProtegida>
            }
          />
          <Route
            path="/cidadao/anunciar"
            element={
              <RotaProtegida perfil="cidadao">
                <AnunciarResiduoPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/cidadao/mapa"
            element={
              <RotaProtegida perfil="cidadao">
                <MapaEcopontosPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/cidadao/denunciar"
            element={
              <RotaProtegida perfil="cidadao">
                <DenunciarPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/cidadao/pontos"
            element={
              <RotaProtegida perfil="cidadao">
                <MoedaVerdePage />
              </RotaProtegida>
            }
          />

          <Route
            path="/empresa"
            element={
              <RotaProtegida perfil="empresa">
                <EmpresaHome />
              </RotaProtegida>
            }
          />
          <Route
            path="/empresa/anunciar"
            element={
              <RotaProtegida perfil="empresa">
                <AnunciarLotePage />
              </RotaProtegida>
            }
          />
          <Route
            path="/empresa/certificados"
            element={
              <RotaProtegida perfil="empresa">
                <CertificadosPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/cooperativa"
            element={
              <RotaProtegida perfil="cooperativa">
                <CooperativaHome />
              </RotaProtegida>
            }
          />
          <Route
            path="/cooperativa/mural"
            element={
              <RotaProtegida perfil="cooperativa">
                <MuralOfertasPage />
              </RotaProtegida>
            }
          />

          <Route
            path="/gestor"
            element={
              <RotaProtegida perfil="gestor">
                <GestorDashboard />
              </RotaProtegida>
            }
          />
          <Route
            path="/gestor/denuncias"
            element={
              <RotaProtegida perfil="gestor">
                <GestorDenunciasPage />
              </RotaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
