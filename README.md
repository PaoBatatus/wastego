# ♻ WasteGo
### Plataforma de Gestão Inteligente de Resíduos
**UTFPR — Câmpus Santa Helena | PI2 2026**

WasteGo é uma aplicação mobile focada em conectar cidadãos, empresas, cooperativas de reciclagem e a Prefeitura de Santa Helena, PR, numa plataforma unificada de gestão de resíduos sólidos.

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
| Frontend | React Native + Expo |
| Banco de Dados | MySQL 8.0 (via Docker) |
| Autenticação | Laravel Sanctum |
| Mapas | react-native-maps |
| PDFs | Laravel DomPDF |
| Testes Backend | PHPUnit |
| Teste de Carga | k6 |

---

## 📋 Pré-requisitos

Para rodar o ambiente de desenvolvimento, você precisará de:
- **Docker** e **Docker Compose** (Para rodar o Banco de Dados e o Backend em containers isolados)
- **Node.js** LTS e **npm** (Para rodar o Frontend via Expo)
- Aplicativo **Expo Go** instalado no seu celular iOS ou Android (para testes de desenvolvimento). *Nota: Um arquivo .apk buildado será adicionado futuramente para dispensar o uso do Expo Go.*

---

## 🚀 Como Instalar e Rodar

### 1. Clonar o repositório
```bash
git clone https://github.com/PaoBatatus/wastego.git
cd wastego
```

### 2. Configurar e Iniciar o Backend (Docker)
Todo o backend (Laravel + MySQL) está envelopado pelo Docker Compose para facilitar os testes. 

> ⚠️ **Segurança:** O arquivo `docker-compose.yml` está configurado com senhas *hardcoded* (`secret_password`) propositalmente para que qualquer pessoa consiga testar o projeto sem atritos. Para ambientes de produção reais, **é imprescindível alterar essas senhas**!

1. Na raiz do projeto, inicie os containers:
   ```bash
   docker compose up -d
   ```
2. Crie o arquivo `.env` do backend:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Edite o arquivo `backend/.env` recém-criado, ajustando a conexão do banco de dados para os valores do Docker Compose:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=wastego
   DB_USERNAME=root
   DB_PASSWORD=secret_password
   ```
4. Dentro do container rodando, instale as dependências e configure o Laravel:
   *(Volte para a pasta raiz `wastego` ou adapte o caminho se necessário)*
   ```bash
   docker exec -it wastego-backend composer install
   docker exec -it wastego-backend php artisan key:generate
   ```
5. Aguarde alguns segundos para o banco de dados inicializar, e em seguida rode as *migrations*:
   ```bash
   docker exec -it wastego-backend php artisan migrate
   ```
6. Inicie o servidor localmente no container:
   ```bash
   docker exec -d wastego-backend php artisan serve --host=0.0.0.0 --port=8000
   ```
   *O backend estará acessível na sua rede local na porta `8000`.*

### 3. Configurar e Iniciar o Frontend (React Native + Expo)
Para que o celular consiga acessar a API, você deve dizer a ele qual é o IP da sua máquina.

1. Encontre o IP local da sua máquina (ex: `192.168.0.10`). No linux você pode usar `hostname -I` ou `ip a`. No Windows use `ipconfig`.
2. Entre na pasta do frontend e crie um arquivo `.env` contendo a variável da URL base da API apontando para o seu IP.
   ```bash
   cd frontend
   echo "EXPO_PUBLIC_API_URL=http://<SEU_IP_AQUI>:8000/api/v1" > .env
   ```
3. Instale as dependências do Expo e React Native:
   ```bash
   npm install
   ```
4. Inicie o Metro Bundler do Expo:
   ```bash
   npx expo start
   ```
5. Com o terminal exibindo o QR Code, abra o aplicativo **Expo Go** no seu celular e escaneie. Garanta que o celular e o computador estão **na mesma rede Wi-Fi**.

---

## 🧪 Como Rodar os Testes

### Testes Unitários (PHPUnit)
Para rodar os testes da API diretamente no container:
```bash
docker exec -it wastego-backend php artisan test
```

### Teste de Carga (k6)
Na raiz do projeto:
```bash
k6 run load-test.js
```

---

## 📁 Estrutura de Pastas
wastego/
├── backend/          # API Laravel (PHP 8.4)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/         # App Mobile (React Native + Expo)
│   ├── src/
│   │   ├── app/      # Rotas (Expo Router)
│   │   ├── components/
│   │   └── services/
│   ├── assets/
│   └── app.json
├── docker-compose.yml
└── load-test.js

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
