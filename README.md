# Controle do Peso - Web App com IndexedDB

Este é um aplicativo web para registrar e acompanhar o histórico de peso corporal. Ele utiliza tecnologias modernas como `IndexedDB` para armazenamento local, `sql.js` para manipulação de banco de dados SQLite no navegador e `Chart.js` para visualização de gráficos.

## Funcionalidades

- **Registro de Peso**: Permite registrar o peso diário com uma data específica.
- **Histórico de Peso**: Exibe um gráfico interativo com o histórico de peso registrado.
- **Exportação e Importação de Banco de Dados**: 
  - Exporta os dados para um arquivo SQLite.
  - Importa dados de um arquivo SQLite para restaurar ou transferir informações.
- **Armazenamento Local**: Os dados são armazenados localmente no navegador usando IndexedDB.
- **Internacionalização (i18n)**: Suporte para múltiplos idiomas (atualmente `pt-BR` e `en`).

## Tecnologias Utilizadas

- **HTML5** e **CSS3**: Estrutura e estilo da aplicação.
- **JavaScript**: Lógica do aplicativo.
- **IndexedDB**: Armazenamento local dos dados.
- **sql.js**: Manipulação de banco de dados SQLite no navegador.
- **Chart.js**: Criação de gráficos interativos.
- **JSON**: Arquivos de tradução para internacionalização.

## Pré-requisitos

- Navegador moderno com suporte a `IndexedDB` e `ES6`.
- Conexão com a internet para carregar bibliotecas externas (como `sql.js` e `Chart.js`).

## Como Usar

1. **Abrir o Aplicativo**:
   - Abra o arquivo `index.html` em um navegador compatível.

2. **Registrar Peso**:
   - Insira uma data no campo "Selecione uma data".
   - Insira o peso no campo "Peso (kg)".
   - Clique no botão **"Adicionar registro de peso"**.

3. **Visualizar Histórico**:
   - O gráfico exibirá o histórico de peso registrado.

4. **Exportar Banco de Dados**:
   - Clique no botão **"Exportar DB"** para salvar os dados em um arquivo SQLite.

5. **Importar Banco de Dados**:
   - Clique no botão **"Importar DB"** e selecione um arquivo SQLite para restaurar os dados.

6. **Internacionalização**:
   - O idioma é detectado automaticamente com base no idioma do navegador (`pt-BR` ou `en`).
   - Para adicionar novos idiomas, crie um arquivo JSON na pasta `lang` com as traduções.

## Estrutura do Projeto
controle-do-peso-web-app-indexDB/  
├── index.html # Página principal do aplicativo  
├── css/  
│ └── estilo.css # Estilos do aplicativo  
├── js/ │  
└── main.js # Lógica principal do aplicativo  
├── lang/  
│ ├── pt-BR.json # Traduções em português  
│ └── en.json # Traduções em inglês  
├── README.md # Documentação do projeto  

## Personalização

- **Adicionar Novos Idiomas**:
  - Crie um arquivo JSON na pasta `lang` com as traduções.
  - Certifique-se de que o arquivo siga o formato dos arquivos existentes (`pt-BR.json` ou `en.json`).

- **Alterar Estilo**:
  - Edite o arquivo `css/estilo.css` para personalizar o design.

## Problemas Conhecidos

- O tamanho máximo do arquivo SQLite para importação é de 5MB.
- A aplicação depende de bibliotecas externas carregadas via CDN.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença
Este projeto é de código aberto e está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).

