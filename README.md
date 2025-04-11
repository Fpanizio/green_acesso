# 📝 README - Sistema de Boletos para Condomínios

Backend Node.js para importação/exportação de boletos em CSV e PDF, desenvolvido para o teste técnico da Green Acesso.

## 🚀 Tecnologias

- **Node.js** (v18+)
- **Express**
- **PostgreSQL** (via Sequelize)

### Bibliotecas:

- **pdf-lib**: Manipulação de PDFs
- **csv-parser**: Processamento de arquivos CSV
- **multer**: Upload de arquivos

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DB_NAME=green_acesso
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
PORT=3000
```

### 2. Instalação

Execute o comando abaixo para instalar as dependências:

```bash
npm install
```

### 3. Execução

Inicie o servidor com o comando:

```bash
npm start
```

O servidor estará disponível em: [http://localhost:3000](http://localhost:3000)

## 📌 Endpoints

### 1. Importar CSV

**POST** `/api/importar-csv`

- **Body**: Arquivo CSV no formato:

```csv
nome;unidade;valor;linha_digitavel
JOSE DA SILVA;17;182.54;123456123456123456
```

- **Resposta de Sucesso**:

```json
{
  "success": true,
  "imported": 3,
  "errors": null
}
```

---

### 2. Processar PDF

**POST** `/api/processar-pdf`

- **Body**: PDF com 1 página por boleto (nomes dos sacados).
- **Saída**: Gera arquivos individuais em `./boletos_gerados/` (ex: `1.pdf`).

---

### 3. Listar Boletos (com Filtros)

**GET** `/api/boletos`

- **Query Params**:

  - `nome`: Filtra por nome do sacado (parcial, case-insensitive).
  - `valor_inicial`: Filtra boletos com valor maior ou igual ao especificado.
  - `valor_final`: Filtra boletos com valor menor ou igual ao especificado.
  - `id_lote`: Filtra boletos pelo ID do lote.

- **Exemplo**:

```bash
GET /api/boletos?nome=JOSE&valor_inicial=100&id_lote=3
```

- **Resposta de Sucesso**:

```json
[
  {
    "id": 1,
    "nome_sacado": "JOSE DA SILVA",
    "valor": 182.54,
    "linha_digitavel": "123456123456123456",
    "ativo": true,
    "Lote": {
      "nome": "0017"
    }
  }
]
```

---

### 4. Gerar Relatório PDF

**GET** `/api/relatorio?relatorio=1`

- **Saída**: Salva em `./relatorios/relatorio_YYYY-MM-DD.pdf`.
- **Retorna** o caminho do arquivo:

```json
{
  "path": "/caminho/relatorio_2025-04-11.pdf",
  "filename": "relatorio_2025-04-11.pdf"
}
```

## 🗂️ Estrutura de Arquivos

```plaintext
src/
├── models/            # Models do Sequelize
├── routes/            # Definição de rotas
├── utils/             # Helpers (upload, etc.)
├── app.js             # Configuração do Express
└── config/            # Banco de dados
```

## 🧪 Testes Manuais

Use a coleção do Postman ou os exemplos abaixo com `cURL`:

Coleção do postman: "https://.postman.co/workspace/My-Workspace~1cb39973-368d-4a91-8717-f871dd02eaba/collection/20854740-b08823bc-302a-464c-87bf-d8774c926f70?action=share&creator=20854740"

### Exemplo com cURL

```bash
# Importar CSV
curl -X POST -F "csv=@boletos.csv" http://localhost:3000/api/importar-csv

# Listar boletos filtrados
curl "http://localhost:3000/api/boletos?nome=JOSE&valor_inicial=100"
```

## 📄 Notas

- **Banco de Dados**: As tabelas `lotes` e `boletos` são criadas automaticamente.
