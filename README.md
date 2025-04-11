# 📝 README - Sistema de Boletos para Condomínios

Backend Node.js para importação/exportação de boletos em CSV e PDF, desenvolvido para o teste técnico da Green Acesso.

## 🎯 Objetivo do Projeto

Este projeto foi desenvolvido como parte do desafio técnico da Green Acesso. Ele tem como objetivo importar boletos de um sistema financeiro em formato `.csv` e `.pdf`, processá-los e exportar relatórios em PDF, integrando os dados ao sistema de portaria.

## 🚀 Tecnologias

- **Node.js** (v18+)
- **Express**
- **PostgreSQL** (via Sequelize)

### Bibliotecas:

- **pdf-lib**: Manipulação de PDFs
- **csv-parser**: Processamento de arquivos CSV
- **multer**: Upload de arquivos
- **pdfkit**: Geração de PDFs

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

- **Descrição**: Este endpoint importa boletos a partir de um arquivo `.csv`.
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

- **Descrição**: Este endpoint processa um arquivo PDF contendo boletos e os divide em arquivos individuais.
- **Body**: PDF com 1 página por boleto (nomes dos sacados).
- **Saída**: Gera arquivos individuais em `./Arquivos_gerados/boletos/` (ex: `1.pdf`).

---

### 3. Listar Boletos (com Filtros)

**GET** `/api/boletos`

- **Descrição**: Este endpoint retorna uma lista de boletos com filtros opcionais.
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

- **Descrição**: Este endpoint gera um relatório em PDF com os boletos listados.
- **Saída**: Salva em `./Arquivos_gerados/relatorios/relatorio_YYYY-MM-DD.pdf` e retorna o conteúdo em base64.

- **Exemplo de Resposta**:

```json
{
  "success": true,
  "message": "Relatório gerado com sucesso",
  "filename": "relatorio_2025-04-11.pdf",
  "base64": "..."
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

Use a coleção do Postman para testar os endpoints. 

### Link da Coleção do Postman

[Green Acesso API - Postman Collection](content/Green%20Acesso%20API.postman_collection.json)

### Arquivo PDF Fake

O arquivo `boletos-test.pdf` usado para testes está disponível em `content/boletos-test.pdf`.

### Exemplo com cURL

```bash
# Importar CSV
curl -X POST -F "csv=@content/test.csv" http://localhost:3000/api/importar-csv

# Listar boletos filtrados
curl "http://localhost:3000/api/boletos?nome=JOSE&valor_inicial=100"
```