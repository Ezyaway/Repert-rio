# 🎸 Meu Repertório de Violão

Aplicativo web minimalista com estética old school para organizar músicas que você está aprendendo no violão. Totalmente baseado em navegador com armazenamento local (localStorage).

## ✨ Funcionalidades

### 📋 Gestão de Músicas
- **Lista geral** com todas as músicas cadastradas
- **Visualização detalhada** ao clicar em cada música
- **Criar, editar e excluir** músicas facilmente
- **Armazenamento automático** no localStorage do navegador

### 🎵 Informações de Cada Música
- Nome da música
- Artista
- Gênero musical
- Categoria personalizada
- Cifra com acordes posicionados (formato: `[Am]letra [G]aqui`)
- Tablatura (texto puro)
- Embed do Spotify (visualize e ouça diretamente no app)

### 🔍 Filtros e Organização
- Filtrar por **artista**, **gênero** ou **categoria**
- Ordenar por:
  - Nome da música (A-Z ou Z-A)
  - Nome do artista (A-Z ou Z-A)
  - Mais recentes
- **Abas de categorias personalizadas** para organização rápida
- Sistema de tags visuais

### 🎨 Design
- Estética **old school** com cores suaves e fontes retrô
- Layout totalmente **responsivo** (funciona bem em celular e desktop)
- Cores que remetem a papel envelhecido
- Fontes especiais: Courier Prime e Special Elite

## 🚀 Como Usar

### Localmente

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` diretamente no navegador
3. Comece a adicionar suas músicas!

### No GitHub Pages

1. **Crie um repositório no GitHub**
   - Acesse [github.com](https://github.com) e faça login
   - Clique em "New repository"
   - Dê um nome (ex: `repertorio-violao`)
   - Marque como "Public"
   - Clique em "Create repository"

2. **Faça upload dos arquivos**
   - Clique em "uploading an existing file"
   - Arraste os arquivos: `index.html`, `styles.css`, `app.js`, `README.md`
   - Clique em "Commit changes"

3. **Ative o GitHub Pages**
   - No repositório, vá em "Settings" (⚙️)
   - No menu lateral, clique em "Pages"
   - Em "Source", selecione "Deploy from a branch"
   - Em "Branch", selecione `main` e pasta `/ (root)`
   - Clique em "Save"

4. **Acesse seu site**
   - Aguarde alguns minutos
   - Seu site estará disponível em: `https://seu-usuario.github.io/repertorio-violao/`

## 📝 Como Adicionar Músicas

### Criando uma Nova Música

1. Clique no botão **"+ Nova Música"**
2. Preencha os campos:
   - **Nome da Música** (obrigatório)
   - **Artista** (obrigatório)
   - **Gênero** (opcional: Rock, MPB, Samba, etc.)
   - **Categoria Personalizada** (opcional: Favoritas, Estudando, Dominadas, etc.)

### Adicionando Cifras

Para adicionar cifras com acordes posicionados, use colchetes `[]`:

```
[C]Today is gonna be the day
That they're gonna [G]throw it back to [Am]you
[C]By now you should've somehow
Realized what you [G]gotta [Am]do
```

Os acordes aparecerão em vermelho acima da letra!

### Adicionando Tablaturas

Cole a tablatura em formato texto:

```
e|---0---3---0---|
B|---1---0---1---|
G|---0---0---2---|
D|---2---0---2---|
A|---3---2---0---|
E|-------3-------|
```

### Adicionando Spotify

1. Abra a música no Spotify (app ou web)
2. Clique em "Compartilhar" → "Copiar link da música"
3. Cole o link completo no campo "Link do Spotify"
   - Exemplo: `https://open.spotify.com/track/6b2RcmUt1g9N9mQ3CbjX1R`

## 💾 Armazenamento de Dados

- Todos os dados são salvos **automaticamente** no navegador (localStorage)
- Os dados **permanecem salvos** mesmo após fechar o navegador
- **Atenção**: Se limpar os dados do navegador, as músicas serão perdidas
- **Recomendação**: Faça backup periodicamente exportando manualmente (anote suas músicas ou tire prints)

## 🛠️ Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilização (Grid, Flexbox, Variáveis CSS)
- **JavaScript Vanilla** - Lógica e interatividade
- **localStorage** - Armazenamento local
- **Google Fonts** - Fontes Courier Prime e Special Elite

## 📱 Compatibilidade

- ✅ Chrome / Edge / Opera (versões recentes)
- ✅ Firefox (versões recentes)
- ✅ Safari (versões recentes)
- ✅ Dispositivos móveis (iOS e Android)

## 📂 Estrutura de Arquivos

```
repertorio-violao/
├── index.html      # Página principal
├── styles.css      # Estilos e design
├── app.js          # Lógica da aplicação
└── README.md       # Este arquivo
```

## 🎯 Dicas de Uso

1. **Organize por categorias**: Crie categorias como "Aprendendo", "Dominadas", "Favoritas"
2. **Use os filtros**: Filtre por artista para ver todas as músicas de uma banda
3. **Adicione links do Spotify**: Facilita ouvir enquanto pratica
4. **Formato de acordes**: Sempre use `[Acorde]` para que apareçam destacados

## 🐛 Solução de Problemas

**As músicas não aparecem após adicionar:**
- Verifique se preencheu os campos obrigatórios (Nome e Artista)
- Recarregue a página

**O Spotify não carrega:**
- Verifique se o link está correto
- Tente copiar novamente do aplicativo Spotify

**Perdi minhas músicas:**
- Se limpou os dados do navegador, infelizmente não é possível recuperar
- Recomenda-se fazer backups regulares

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente.

---

**Desenvolvido com ❤️ para músicos e violonistas**

Bons estudos! 🎸✨
