# 🎸 Meu Repertório de Violão

## Visão Geral
Aplicativo web minimalista com estética old school para organizar músicas que você está aprendendo no violão. Desenvolvido em HTML, CSS e JavaScript puro, com armazenamento local usando localStorage.

## Estado Atual
✅ **Projeto Completo e Funcional** (Novembro 2025)

### Funcionalidades Implementadas
- ✅ Sistema CRUD completo (criar, ler, atualizar, deletar músicas)
- ✅ Armazenamento persistente com localStorage
- ✅ Editor de cifras com acordes posicionados acima da letra (formato Cifra Club)
- ✅ **Dicionário de acordes com CRUD completo** (adicionar, editar, excluir acordes com diagramas)
- ✅ **Popup interativo ao clicar em acordes** nas cifras (mostra diagrama cadastrado)
- ✅ **Campo de ritmo** com setas ↑, ↓, X (sequência ilimitada)
- ✅ Suporte para tablaturas em texto puro
- ✅ Integração com Spotify via iframe embed (sem fundo branco)
- ✅ Sistema de filtros por artista, gênero e categoria
- ✅ Ordenação alfabética (A-Z, Z-A) e por data de criação
- ✅ Categorias personalizadas persistentes
- ✅ Design responsivo para mobile e desktop
- ✅ Estética old school com cores suaves e fontes retrô

## Arquitetura do Projeto

### Estrutura de Arquivos
```
/
├── index.html       # Página principal com estrutura HTML
├── styles.css       # Estilos com tema old school e responsividade
├── app.js          # Lógica da aplicação (classe SongManager)
├── README.md       # Documentação para usuários finais
└── replit.md       # Documentação técnica do projeto
```

### Tecnologias Utilizadas
- **HTML5**: Estrutura semântica com views separadas
- **CSS3**: Variáveis CSS, Grid, Flexbox, design responsivo
- **JavaScript ES6+**: Classes, arrow functions, template literals
- **LocalStorage API**: Persistência de dados no navegador
- **Google Fonts**: Courier Prime (corpo) e Special Elite (títulos)

### Armazenamento de Dados

#### localStorage Keys
1. **`guitarSongs`**: Array de objetos com todas as músicas
   ```json
   {
     "id": "timestamp_string",
     "name": "Nome da Música",
     "artist": "Artista",
     "genre": "Gênero",
     "category": "Categoria",
     "chords": "Letra com [Acordes]",
     "tablature": "Tablatura em texto",
     "rhythm": "↑ ↓ ↓ ↑ ↓ X",
     "spotifyUrl": "Link do Spotify",
     "createdAt": timestamp,
     "updatedAt": timestamp
   }
   ```

2. **`customCategories`**: Array de strings com categorias personalizadas
   ```json
   ["Favoritas", "Estudando", "Dominadas"]
   ```

3. **`guitarChords`**: Array de objetos com acordes cadastrados
   ```json
   {
     "id": "timestamp_string",
     "name": "Am",
     "diagram": "e|--0--\nB|--1--\nG|--2--\nD|--2--\nA|--0--\nE|-----"
   }
   ```

### Componentes Principais

#### SongManager (app.js)
Classe principal que gerencia todo o estado e lógica do aplicativo:

**Propriedades:**
- `songs`: Array de músicas carregado do localStorage
- `customCategories`: Array de categorias personalizadas
- `chords`: Array de acordes cadastrados
- `currentSongId`: ID da música atualmente visualizada/editada
- `currentChordId`: ID do acorde atualmente sendo editado
- `currentFilter`: Objeto com tipo e valor do filtro ativo
- `currentSort`: String com tipo de ordenação
- `currentRhythm`: Array de setas do ritmo atual

**Métodos principais:**
- `loadSongs()` / `saveSongs()`: Persistência de músicas
- `loadCustomCategories()` / `saveCustomCategories()`: Persistência de categorias
- `loadChords()` / `saveChords()`: Persistência de acordes
- `showForm()`: Exibe formulário de criação/edição com datalist de categorias
- `handleFormSubmit()`: Salva nova música ou edições
- `showSongDetail()`: Exibe detalhes completos da música
- `formatChords()`: Converte formato `[Acorde]letra` em HTML com acordes acima da letra e marca acordes clicáveis
- `showChordPopup()`: Exibe popup com diagrama do acorde ao clicar
- `addRhythmArrow()`: Adiciona setas ao campo de ritmo
- `clearRhythm()`: Limpa sequência de ritmo
- `getSpotifyEmbedUrl()`: Converte link do Spotify em URL de embed
- `renderSongsList()`: Renderiza lista filtrada e ordenada
- `getFilteredSongs()` / `sortSongs()`: Lógica de filtros e ordenação
- `updateCategoryTabs()`: Atualiza abas de categorias
- `showChordsManager()`: Exibe gerenciador de acordes
- `addChord()`: Adiciona ou atualiza acorde
- `editChord()`: Carrega acorde para edição
- `deleteChord()`: Remove acorde com confirmação
- `renderChordsList()`: Renderiza lista de acordes cadastrados

#### Editor de Cifras
O método `formatChords()` implementa o posicionamento de acordes:

1. **Entrada**: Texto com formato `[Am]letra [G]mais letra`
2. **Processamento**:
   - Separa acordes e letra usando regex `/(\[[^\]]+\])/g`
   - Calcula posições exatas de cada acorde
   - Cria buffer de largura fixa com espaços não-quebráveis (\u00A0)
   - Insere acordes nas posições corretas
3. **Saída**: HTML estruturado com divs separadas:
   ```html
   <div class="chord-line-group">
     <div class="chord-line">Am    G</div>
     <div class="lyric-line">letra mais letra</div>
   </div>
   ```

#### Sistema de Filtros
- **Filtro por tipo**: artista, gênero, categoria ou "todas"
- **Filtro por valor**: populate dinâmico baseado em dados existentes
- **Ordenação**: nome (A-Z/Z-A), artista (A-Z/Z-A), mais recentes
- **Categorias**: Abas clicáveis + categoria "Todas"

### Design e Estética

#### Paleta de Cores (CSS Variables)
```css
--cream: #f4f1e8          /* Fundo principal (papel envelhecido) */
--dark-cream: #e8e3d3     /* Fundo secundário */
--brown: #5c4a3a          /* Texto secundário */
--dark-brown: #3d2f24     /* Texto principal */
--accent: #8b6f47         /* Botões e destaques */
--red: #a64b3a            /* Acordes e botão deletar */
--green: #6b8e6b          /* Botões de ação */
```

#### Responsividade
- **Desktop**: Layout de 2 colunas, max-width 1000px
- **Tablet** (<768px): Layout adaptativo, filtros em coluna
- **Mobile** (<480px): Layout stack, fontes reduzidas, botões full-width

### Fluxo de Navegação

1. **Tela Principal** (`mainView`):
   - Lista de músicas com cards clicáveis
   - Filtros e ordenação
   - Abas de categorias
   - Botões: "Nova Música" e "Gerenciar Acordes"

2. **Gerenciador de Acordes** (`chordsManagerView`):
   - Formulário para adicionar/editar acordes (sigla + diagrama)
   - Lista de acordes cadastrados com botões de editar (✏️) e excluir (✕)
   - Persistência no localStorage
   - Botão para voltar à tela principal

3. **Formulário** (`songFormView`):
   - Campos: nome*, artista*, gênero, categoria (datalist), cifra, tablatura, ritmo, Spotify
   - **Campo de ritmo** com botões para adicionar setas ↑, ↓, X (ilimitado)
   - Validação HTML5 (campos obrigatórios)
   - Datalist populado com categorias existentes

4. **Detalhes** (`songDetailView`):
   - Informações completas da música
   - **Cifra formatada com acordes clicáveis** (se cadastrados no dicionário)
   - **Popup ao clicar em acordes** mostrando diagrama
   - **Ritmo exibido** com setas formatadas
   - Tablatura (se houver)
   - Player Spotify embed sem fundo branco (se houver)
   - Botões: Voltar, Editar, Excluir

## Hospedagem

### GitHub Pages
Projeto otimizado para hospedagem estática no GitHub Pages:
1. Sem dependências externas (apenas Google Fonts via CDN)
2. Arquivos HTML/CSS/JS standalone
3. Sem build process necessário
4. Funciona offline após primeiro carregamento

### Servidor Local
Atualmente rodando com Python HTTP server:
```bash
python3 -m http.server 5000
```

## Melhorias Futuras Possíveis
- [ ] Exportação/importação de dados em JSON
- [ ] Busca por texto livre (nome, artista, letra)
- [ ] Modo apresentação (tela cheia para cifras)
- [ ] Campo de notas/observações por música
- [ ] Sistema de favoritos
- [ ] Marcadores de progresso de aprendizado
- [ ] Transposição automática de acordes
- [ ] Impressão de cifras formatadas

## Notas Técnicas

### Compatibilidade
- Chrome/Edge/Opera: ✅
- Firefox: ✅
- Safari: ✅
- Mobile (iOS/Android): ✅

### Limitações Conhecidas
- Dados armazenados apenas no navegador (limpar cache = perder dados)
- Sem sincronização entre dispositivos
- Limite de ~5-10MB no localStorage (varia por navegador)
- Spotify embed requer conexão com internet

### Segurança
- Uso de `escapeHtml()` para prevenir XSS em todos os campos de entrada
- Validação HTML5 em campos obrigatórios
- Confirmação antes de deletar músicas

## Changelog

### v1.1 (Novembro 2025) - Funcionalidades Avançadas
- ✅ **Dicionário de Acordes**: Sistema completo de CRUD para gerenciar acordes com diagramas
- ✅ **Acordes Clicáveis**: Popup interativo ao clicar em acordes cadastrados nas cifras
- ✅ **Campo de Ritmo**: Builder de ritmo com setas ↑, ↓, X (sequência ilimitada)
- ✅ **Correção Spotify**: Removido fundo branco do iframe embed

### v1.0 (Novembro 2025) - Release Inicial
- ✅ Implementação completa de todas as funcionalidades solicitadas
- ✅ Editor de cifras com acordes posicionados corretamente acima da letra
- ✅ Sistema de categorias personalizadas com persistência
- ✅ Design responsivo old school para mobile e desktop
- ✅ Documentação completa (README.md + replit.md)

---

**Desenvolvido por**: Replit Agent  
**Data**: Novembro 2025  
**Licença**: Open Source
