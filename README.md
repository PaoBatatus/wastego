# ♻ WasteGo
### Plataforma de Gestão Inteligente de Resíduos
**UTFPR — Câmpus Santa Helena | PI2 2026**

WasteGo é uma aplicação web progressiva (PWA) que conecta cidadãos, empresas, cooperativas de reciclagem e a Prefeitura de Santa Helena, PR, numa plataforma unificada de gestão de resíduos sólidos.

---

## 🎯 Problema que Resolve

Santa Helena (26 mil habitantes) possui coleta básica de lixo mas enfrenta cinco gargalos sem solução digital:
- Coleta seletiva sem rastreabilidade
- Logística fragmentada entre empresas e cooperativas
- Sem canal cidadão para denunciar descartes irregulares
- Nenhum mecanismo de engajamento cidadão
- Prefeitura sem dados para políticas públicas

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | PHP 8.4 + Laravel 13 |
| Frontend | React 18 + Vite + Tailwind CSS |
| Banco de Dados | MySQL 8.0 |
| Autenticação | Laravel Sanctum |
| Mapas | Leaflet + OpenStreetMap |
| PDFs | Laravel DomPDF |
| Testes Backend | PHPUnit |
| Testes E2E | Cypress |
| Teste de Carga | k6 |

---

## 📋 Pré-requisitos

- PHP 8.4+
- Node.js LTS
- MySQL 8.0
- Composer

---

## 🚀 Como Instalar e Rodar

### 1. Clonar o repositório
```bash
git clone https://github.com/PaoBatatus/wastego.git
cd wastego
```

### 2. Configurar o Backend
```bash
cd backend
composer install
cp .env.example .env
# Edite o .env com suas credenciais do MySQL
php artisan key:generate
php artisan migrate
php artisan serve
```

### 3. Configurar o Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173

---

## ⚙️ Variáveis de Ambiente

Crie o arquivo `backend/.env` baseado no `.env.example` e configure:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wastego
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

---

## 🧪 Como Rodar os Testes

### Testes Unitários (PHPUnit)
```bash
cd backend
php artisan test
```

### Testes E2E (Cypress)
```bash
cd frontend
npx cypress run
```

### Teste de Carga (k6)
```bash
k6 run load-test.js
```

---

## 📁 Estrutura de Pastas
wastego/
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── cypress/e2e/
└── .github/workflows/ci.yml

---

## 👥 Perfis de Usuário

| Perfil | Funcionalidades |
|--------|----------------|
| **Cidadão** | Anunciar resíduo, ver mapa de ecopontos, fazer denúncia, Moeda Verde |
| **Empresa** | Anunciar lote, baixar Certificado Digital de Destino (CDF) |
| **Cooperativa** | Ver mural de ofertas com mapa, planejar rotas de coleta |
| **Gestor** | Dashboard com gráficos, mapa de calor de denúncias, gestão de status |

---

## 🔌 Endpoints Principais da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/v1/auth/register | Cadastro de usuário |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/residuos | Listar resíduos disponíveis |
| POST | /api/v1/residuos | Criar anúncio de resíduo |
| GET | /api/v1/ecopontos | Listar ecopontos |
| POST | /api/v1/denuncias | Criar denúncia |
| GET | /api/v1/dashboard/resumo | Resumo para o gestor |
| GET | /api/v1/pontos | Saldo de Moeda Verde |

---

## 👨‍💻 Equipe

| Nome | Email |
|------|-------|
| Pedro Luca de Lacerda Alves | alvesp.2024@alunos.utfpr.edu.br |
| Felipe Fonseca | fonseca.2006@alunos.utfpr.edu.br |
| Orias Malta dos Santos Junior | orias.2006@alunos.utfpr.edu.br |
| João Pedro Gomes | joaopedrogomes@alunos.utfpr.edu.br |
| Marcos Vinicius de Souza Raspa | marcosraspa@alunos.utfpr.edu.br |

---

*UTFPR — Câmpus Santa Helena | PI2 2026*
