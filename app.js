class SongManager {
    constructor() {
        this.songs = this.loadSongs();
        this.customCategories = this.loadCustomCategories();
        this.chords = this.loadChords();
        this.currentSongId = null;
        this.currentChordId = null;
        this.currentFilter = { type: 'all', value: '', category: 'all' };
        this.currentSort = 'name-asc';
        this.currentRhythm = [];
        this.visualEditorMode = false;
        this.selectedFinger = 1;
        this.chordData = {
            startFret: 0,
            fingers: {},
            stringStatus: ['x', 'x', 'x', 'x', 'x', 'x']
        };
        this.EDITOR_STRING_POSITIONS = [25, 59, 93, 127, 161, 195];
        this.DISPLAY_STRING_POSITIONS = [25, 55, 85, 115, 145, 175];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderSongsList();
        this.updateCategoryTabs();
    }

    loadCustomCategories() {
        const stored = localStorage.getItem('customCategories');
        return stored ? JSON.parse(stored) : [];
    }

    saveCustomCategories() {
        localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
    }

    loadChords() {
        const stored = localStorage.getItem('guitarChords');
        return stored ? JSON.parse(stored) : [];
    }

    saveChords() {
        localStorage.setItem('guitarChords', JSON.stringify(this.chords));
    }

    setupEventListeners() {
        document.getElementById('addSongBtn').addEventListener('click', () => this.showForm());
        document.getElementById('manageChordsBtn').addEventListener('click', () => this.showChordsManager());
        document.getElementById('backBtn').addEventListener('click', () => this.showMainView());
        document.getElementById('backToChordsBtn').addEventListener('click', () => this.showMainView());
        document.getElementById('cancelFormBtn').addEventListener('click', () => this.showMainView());
        document.getElementById('songForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('editBtn').addEventListener('click', () => this.editCurrentSong());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteCurrentSong());
        
        document.getElementById('filterType').addEventListener('change', (e) => this.handleFilterTypeChange(e));
        document.getElementById('filterValue').addEventListener('change', (e) => this.handleFilterValueChange(e));
        document.getElementById('sortOrder').addEventListener('change', (e) => this.handleSortChange(e));
        
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCustomCategory());
        
        document.getElementById('addChordBtn').addEventListener('click', () => this.addChord());
        
        document.querySelectorAll('.rhythm-btn').forEach(btn => {
            if (btn.id === 'clearRhythm') {
                btn.addEventListener('click', () => this.clearRhythm());
            } else {
                btn.addEventListener('click', (e) => this.addRhythmArrow(e.target.dataset.arrow));
            }
        });
        
        document.querySelector('.chord-popup-close').addEventListener('click', () => this.closeChordPopup());
        document.getElementById('chordPopup').addEventListener('click', (e) => {
            if (e.target.id === 'chordPopup') this.closeChordPopup();
        });
        
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleImportFile(e));
        
        document.getElementById('toggleEditorMode').addEventListener('click', () => this.toggleEditorMode());
        document.getElementById('startFret').addEventListener('change', (e) => this.handleFretChange(e));
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab') && !e.target.classList.contains('add-category')) {
                this.handleCategoryClick(e.target);
            }
            if (e.target.classList.contains('chord') && e.target.classList.contains('clickable')) {
                this.showChordPopup(e.target.textContent);
            }
            if (e.target.classList.contains('finger-btn')) {
                this.selectFinger(e.target);
            }
            if (e.target.classList.contains('status-btn')) {
                this.toggleStringStatus(e.target);
            }
            if (e.target.classList.contains('finger-position') || e.target.closest('.finger-position')) {
                const position = e.target.classList.contains('finger-position') ? e.target : e.target.closest('.finger-position');
                this.toggleFingerPosition(position);
            }
        });
    }

    loadSongs() {
        const stored = localStorage.getItem('guitarSongs');
        return stored ? JSON.parse(stored) : [];
    }

    saveSongs() {
        localStorage.setItem('guitarSongs', JSON.stringify(this.songs));
    }

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    showMainView() {
        this.showView('mainView');
        this.currentSongId = null;
        this.renderSongsList();
    }

    showForm(song = null) {
        this.showView('songFormView');
        const form = document.getElementById('songForm');
        const title = document.getElementById('formTitle');
        
        this.updateCategorySuggestions();
        
        if (song) {
            title.textContent = 'Editar Música';
            document.getElementById('songName').value = song.name;
            document.getElementById('songArtist').value = song.artist;
            document.getElementById('songGenre').value = song.genre || '';
            document.getElementById('songCategory').value = song.category || '';
            document.getElementById('songChords').value = song.chords || '';
            document.getElementById('songTab').value = song.tablature || '';
            document.getElementById('songSpotify').value = song.spotifyUrl || '';
            this.currentRhythm = song.rhythm ? song.rhythm.split('') : [];
            this.updateRhythmDisplay();
            this.currentSongId = song.id;
        } else {
            title.textContent = 'Nova Música';
            form.reset();
            this.currentRhythm = [];
            this.updateRhythmDisplay();
            this.currentSongId = null;
        }
    }

    updateCategorySuggestions() {
        const categories = new Set([...this.customCategories]);
        this.songs.forEach(song => {
            if (song.category) categories.add(song.category);
        });
        
        const datalist = document.getElementById('categorySuggestions');
        datalist.innerHTML = Array.from(categories).sort().map(cat => 
            `<option value="${this.escapeHtml(cat)}">`
        ).join('');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const songData = {
            name: document.getElementById('songName').value.trim(),
            artist: document.getElementById('songArtist').value.trim(),
            genre: document.getElementById('songGenre').value.trim(),
            category: document.getElementById('songCategory').value.trim(),
            chords: document.getElementById('songChords').value.trim(),
            tablature: document.getElementById('songTab').value.trim(),
            rhythm: this.currentRhythm.join(''),
            spotifyUrl: document.getElementById('songSpotify').value.trim(),
        };

        if (this.currentSongId) {
            const index = this.songs.findIndex(s => s.id === this.currentSongId);
            if (index !== -1) {
                this.songs[index] = { ...this.songs[index], ...songData, updatedAt: Date.now() };
            }
        } else {
            const newSong = {
                id: Date.now().toString(),
                ...songData,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.songs.push(newSong);
        }

        this.saveSongs();
        this.updateCategoryTabs();
        this.showMainView();
    }

    editCurrentSong() {
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (song) {
            this.showForm(song);
        }
    }

    deleteCurrentSong() {
        if (!confirm('Tem certeza que deseja excluir esta música?')) {
            return;
        }

        this.songs = this.songs.filter(s => s.id !== this.currentSongId);
        this.saveSongs();
        this.updateCategoryTabs();
        this.showMainView();
    }

    showSongDetail(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        this.currentSongId = songId;
        this.showView('songDetailView');

        const detailContainer = document.getElementById('songDetail');
        
        let html = `
            <h2>${this.escapeHtml(song.name)}</h2>
            <div class="meta">
                <span><strong>🎤 Artista:</strong> ${this.escapeHtml(song.artist)}</span>
                ${song.genre ? `<span><strong>🎵 Gênero:</strong> ${this.escapeHtml(song.genre)}</span>` : ''}
                ${song.category ? `<span><strong>📁 Categoria:</strong> ${this.escapeHtml(song.category)}</span>` : ''}
            </div>
        `;

        if (song.rhythm) {
            html += `
                <div class="section">
                    <h3>🥁 Ritmo</h3>
                    <div class="rhythm-display" style="justify-content: flex-start;">${song.rhythm.split('').map(arrow => `<span>${arrow}</span>`).join(' ')}</div>
                </div>
            `;
        }

        if (song.chords) {
            html += `
                <div class="section">
                    <h3>📝 Cifra</h3>
                    <div class="chords-display">${this.formatChords(song.chords)}</div>
                </div>
            `;
        }

        if (song.tablature) {
            html += `
                <div class="section">
                    <h3>🎸 Tablatura</h3>
                    <div class="tab-display">${this.escapeHtml(song.tablature)}</div>
                </div>
            `;
        }

        if (song.spotifyUrl) {
            const embedUrl = this.getSpotifyEmbedUrl(song.spotifyUrl);
            if (embedUrl) {
                html += `
                    <div class="section">
                        <h3>🎧 Ouça no Spotify</h3>
                        <div class="spotify-embed">
                            <iframe src="${embedUrl}" width="100%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                        </div>
                    </div>
                `;
            }
        }

        detailContainer.innerHTML = html;
    }

    formatChords(text) {
        const lines = text.split('\n');
        let html = '<div class="chord-lyrics-container">';
        
        for (let line of lines) {
            if (line.trim() === '') {
                html += '<div class="chord-line-group"><div class="empty-line">&nbsp;</div></div>';
                continue;
            }

            const chordPositions = [];
            let lyricLine = '';
            let position = 0;
            
            const parts = line.split(/(\[[^\]]+\])/g);
            
            for (let part of parts) {
                if (part.startsWith('[') && part.endsWith(']')) {
                    const chord = part.slice(1, -1);
                    chordPositions.push({ pos: position, chord: chord });
                } else {
                    lyricLine += part;
                    position += part.length;
                }
            }
            
            html += '<div class="chord-line-group">';
            
            if (chordPositions.length > 0) {
                const lineLength = Math.max(lyricLine.length, 
                    ...chordPositions.map(cp => cp.pos + cp.chord.length));
                const chordBuffer = new Array(lineLength).fill('\u00A0');
                
                for (let { pos, chord } of chordPositions) {
                    const isClickable = this.chords.some(c => c.name.toLowerCase() === chord.toLowerCase());
                    const clickClass = isClickable ? ' clickable' : '';
                    const chordSpan = `<span class="chord${clickClass}">${this.escapeHtml(chord)}</span>`;
                    chordBuffer[pos] = chordSpan;
                    for (let i = 1; i < chord.length && pos + i < lineLength; i++) {
                        chordBuffer[pos + i] = '';
                    }
                }
                
                html += '<div class="chord-line">' + chordBuffer.join('') + '</div>';
            }
            
            html += '<div class="lyric-line">' + this.escapeHtml(lyricLine || ' ') + '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    getSpotifyEmbedUrl(url) {
        if (!url) return null;
        
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
        if (trackMatch) {
            return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator`;
        }
        
        const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
        if (playlistMatch) {
            return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator`;
        }
        
        const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/);
        if (albumMatch) {
            return `https://open.spotify.com/embed/album/${albumMatch[1]}?utm_source=generator`;
        }
        
        return null;
    }

    renderSongsList() {
        const container = document.getElementById('songsList');
        
        let filteredSongs = this.getFilteredSongs();
        filteredSongs = this.sortSongs(filteredSongs);

        if (filteredSongs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📝 Nenhuma música encontrada.</p>
                    <p>Tente ajustar os filtros ou adicione uma nova música!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredSongs.map(song => `
            <div class="song-card" data-song-id="${song.id}">
                <h3>${this.escapeHtml(song.name)}</h3>
                <div class="artist">por ${this.escapeHtml(song.artist)}</div>
                <div class="tags">
                    ${song.genre ? `<span class="tag">🎵 ${this.escapeHtml(song.genre)}</span>` : ''}
                    ${song.category ? `<span class="tag">📁 ${this.escapeHtml(song.category)}</span>` : ''}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showSongDetail(card.dataset.songId);
            });
        });
    }

    getFilteredSongs() {
        let filtered = [...this.songs];

        if (this.currentFilter.category !== 'all') {
            filtered = filtered.filter(song => 
                (song.category || '').toLowerCase() === this.currentFilter.category.toLowerCase()
            );
        }

        if (this.currentFilter.type === 'artist' && this.currentFilter.value) {
            filtered = filtered.filter(song => 
                song.artist.toLowerCase() === this.currentFilter.value.toLowerCase()
            );
        } else if (this.currentFilter.type === 'genre' && this.currentFilter.value) {
            filtered = filtered.filter(song => 
                (song.genre || '').toLowerCase() === this.currentFilter.value.toLowerCase()
            );
        } else if (this.currentFilter.type === 'category' && this.currentFilter.value) {
            filtered = filtered.filter(song => 
                (song.category || '').toLowerCase() === this.currentFilter.value.toLowerCase()
            );
        }

        return filtered;
    }

    sortSongs(songs) {
        const sorted = [...songs];
        
        switch (this.currentSort) {
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
                break;
            case 'artist-asc':
                sorted.sort((a, b) => a.artist.localeCompare(b.artist, 'pt-BR'));
                break;
            case 'artist-desc':
                sorted.sort((a, b) => b.artist.localeCompare(a.artist, 'pt-BR'));
                break;
            case 'recent':
                sorted.sort((a, b) => b.createdAt - a.createdAt);
                break;
        }
        
        return sorted;
    }

    handleFilterTypeChange(e) {
        const type = e.target.value;
        this.currentFilter.type = type;
        this.currentFilter.value = '';
        
        const valueSelect = document.getElementById('filterValue');
        
        if (type === 'all') {
            valueSelect.style.display = 'none';
            this.renderSongsList();
            return;
        }

        const values = new Set();
        this.songs.forEach(song => {
            let value;
            if (type === 'artist') value = song.artist;
            else if (type === 'genre') value = song.genre;
            else if (type === 'category') value = song.category;
            
            if (value) values.add(value);
        });

        valueSelect.innerHTML = '<option value="">Todos</option>' + 
            Array.from(values).sort().map(v => 
                `<option value="${this.escapeHtml(v)}">${this.escapeHtml(v)}</option>`
            ).join('');
        
        valueSelect.style.display = 'block';
        this.renderSongsList();
    }

    handleFilterValueChange(e) {
        this.currentFilter.value = e.target.value;
        this.renderSongsList();
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.renderSongsList();
    }

    updateCategoryTabs() {
        const categories = new Set([...this.customCategories]);
        this.songs.forEach(song => {
            if (song.category) categories.add(song.category);
        });

        const container = document.getElementById('customCategories');
        container.innerHTML = Array.from(categories).sort().map(cat => 
            `<button class="category-tab" data-category="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</button>`
        ).join('');
    }

    handleCategoryClick(tab) {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const category = tab.dataset.category;
        this.currentFilter.category = category || 'all';
        this.renderSongsList();
    }

    addCustomCategory() {
        const categoryName = prompt('Digite o nome da nova categoria:');
        if (!categoryName || !categoryName.trim()) return;

        const trimmedName = categoryName.trim();
        
        if (this.customCategories.includes(trimmedName)) {
            alert('Esta categoria já existe!');
            return;
        }

        this.customCategories.push(trimmedName);
        this.saveCustomCategories();
        this.updateCategoryTabs();
        
        alert(`Categoria "${trimmedName}" criada! Agora você pode atribuí-la às músicas ao editá-las.`);
    }

    showChordsManager() {
        this.showView('chordsManagerView');
        this.cancelEditChord();
        this.renderChordsList();
    }

    addChord() {
        const name = document.getElementById('chordName').value.trim();
        let diagram = '';
        let visualData = null;
        
        if (this.visualEditorMode) {
            diagram = this.chordDataToString();
            visualData = {
                startFret: this.chordData.startFret,
                fingers: { ...this.chordData.fingers },
                stringStatus: [...this.chordData.stringStatus]
            };
        } else {
            diagram = document.getElementById('chordDiagram').value.trim();
        }
        
        if (!name || !diagram) {
            alert('Por favor, preencha o nome e o diagrama do acorde.');
            return;
        }
        
        if (this.currentChordId) {
            const index = this.chords.findIndex(c => c.id === this.currentChordId);
            if (index !== -1) {
                const duplicateExists = this.chords.some(c => 
                    c.id !== this.currentChordId && 
                    c.name.toLowerCase() === name.toLowerCase()
                );
                
                if (duplicateExists) {
                    alert('Já existe outro acorde com essa sigla!');
                    return;
                }
                
                this.chords[index] = {
                    ...this.chords[index],
                    name: name,
                    diagram: diagram,
                    visualData: visualData
                };
            }
            
            this.currentChordId = null;
            document.getElementById('addChordBtn').textContent = '+ Adicionar Acorde';
        } else {
            if (this.chords.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                alert('Já existe um acorde com essa sigla!');
                return;
            }
            
            this.chords.push({
                id: Date.now().toString(),
                name: name,
                diagram: diagram,
                visualData: visualData
            });
        }
        
        this.saveChords();
        this.renderChordsList();
        this.resetChordForm();
    }
    
    resetChordForm() {
        document.getElementById('chordName').value = '';
        document.getElementById('chordDiagram').value = '';
        
        this.chordData = {
            startFret: 0,
            fingers: {},
            stringStatus: ['x', 'x', 'x', 'x', 'x', 'x']
        };
        
        document.getElementById('startFret').value = '0';
        
        document.querySelectorAll('.string-status-item').forEach((item, idx) => {
            const btns = item.querySelectorAll('.status-btn');
            btns.forEach(b => b.classList.remove('active'));
            btns[1].classList.add('active');
        });
        
        if (this.visualEditorMode) {
            this.initChordGrid();
        }
    }

    editChord(chordId) {
        const chord = this.chords.find(c => c.id === chordId);
        if (!chord) return;
        
        this.currentChordId = chordId;
        document.getElementById('chordName').value = chord.name;
        document.getElementById('chordDiagram').value = chord.diagram;
        document.getElementById('addChordBtn').textContent = '✓ Atualizar Acorde';
        
        if (chord.visualData && this.visualEditorMode) {
            this.chordData = {
                startFret: chord.visualData.startFret || 0,
                fingers: { ...chord.visualData.fingers } || {},
                stringStatus: [...chord.visualData.stringStatus] || ['x', 'x', 'x', 'x', 'x', 'x']
            };
            
            document.getElementById('startFret').value = this.chordData.startFret;
            
            this.chordData.stringStatus.forEach((status, idx) => {
                const item = document.querySelector(`.string-status-item[data-string="${idx}"]`);
                if (item) {
                    const btns = item.querySelectorAll('.status-btn');
                    btns.forEach(b => b.classList.remove('active'));
                    const activeBtn = status === 'o' 
                        ? item.querySelector('[data-status="open"]')
                        : item.querySelector('[data-status="muted"]');
                    if (activeBtn) activeBtn.classList.add('active');
                }
            });
            
            this.initChordGrid();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEditChord() {
        this.currentChordId = null;
        this.resetChordForm();
        document.getElementById('addChordBtn').textContent = '+ Adicionar Acorde';
    }

    renderChordsList() {
        const container = document.getElementById('chordsList');
        
        if (this.chords.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--brown); padding: 20px;">Nenhum acorde cadastrado ainda.</p>';
            return;
        }
        
        container.innerHTML = this.chords.map(chord => `
            <div class="chord-item">
                <button class="delete-chord" data-chord-id="${chord.id}">✕</button>
                <button class="edit-chord" data-chord-id="${chord.id}">✏️</button>
                <h4>${this.escapeHtml(chord.name)}</h4>
                <pre>${this.escapeHtml(chord.diagram)}</pre>
            </div>
        `).join('');
        
        container.querySelectorAll('.delete-chord').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChord(btn.dataset.chordId);
            });
        });
        
        container.querySelectorAll('.edit-chord').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editChord(btn.dataset.chordId);
            });
        });
    }

    deleteChord(chordId) {
        if (!confirm('Tem certeza que deseja excluir este acorde?')) {
            return;
        }
        
        this.chords = this.chords.filter(c => c.id !== chordId);
        this.saveChords();
        this.renderChordsList();
    }

    showChordPopup(chordName) {
        const chord = this.chords.find(c => c.name.toLowerCase() === chordName.toLowerCase());
        
        if (!chord) {
            return;
        }
        
        document.getElementById('chordPopupTitle').textContent = chord.name;
        
        const diagramContainer = document.getElementById('chordPopupDiagram');
        
        if (chord.visualData) {
            diagramContainer.innerHTML = this.renderVisualChord(chord.visualData);
        } else {
            diagramContainer.innerHTML = `<pre>${this.escapeHtml(chord.diagram)}</pre>`;
        }
        
        document.getElementById('chordPopup').style.display = 'flex';
    }
    
    renderVisualChord(visualData) {
        const numFrets = 4;
        const numStrings = 6;
        const startFret = visualData.startFret || 0;
        
        let html = '<div class="visual-chord-display">';
        
        if (startFret > 0) {
            html += `<div class="start-fret-indicator">${startFret}ª</div>`;
        }
        
        html += '<div class="chord-diagram-display">';
        html += '<div class="fretboard-display">';
        
        for (let string = 0; string < numStrings; string++) {
            html += `<div class="string-line-display" data-string="${string}" style="top: ${this.DISPLAY_STRING_POSITIONS[string]}px"></div>`;
        }
        
        for (let fret = 0; fret <= numFrets; fret++) {
            html += `<div class="fret-line-display" style="left: ${fret * 25}%"></div>`;
        }
        
        for (let fret = 0; fret < numFrets; fret++) {
            for (let string = 0; string < numStrings; string++) {
                const key = `${string}-${fret}`;
                const finger = visualData.fingers[key];
                const topPos = this.DISPLAY_STRING_POSITIONS[string];
                const leftPos = ((fret + 0.5) / numFrets) * 100;
                
                if (finger) {
                    html += `<div class="finger-marker-display" style="top: ${topPos}px; left: ${leftPos}%">${finger}</div>`;
                }
            }
        }
        
        html += '</div>';
        
        html += '<div class="display-string-status">';
        for (let i = 0; i < numStrings; i++) {
            const status = visualData.stringStatus[i];
            html += `<div class="status-indicator">${status === 'o' ? '○' : '✕'}</div>`;
        }
        html += '</div>';
        
        html += '</div>';
        html += '</div>';
        return html;
    }

    closeChordPopup() {
        document.getElementById('chordPopup').style.display = 'none';
    }

    addRhythmArrow(arrow) {
        this.currentRhythm.push(arrow);
        document.getElementById('songRhythm').value = this.currentRhythm.join('');
        this.updateRhythmDisplay();
    }

    clearRhythm() {
        this.currentRhythm = [];
        document.getElementById('songRhythm').value = '';
        this.updateRhythmDisplay();
    }

    updateRhythmDisplay() {
        const display = document.getElementById('rhythmDisplay');
        display.innerHTML = this.currentRhythm.map(arrow => 
            `<span>${arrow}</span>`
        ).join(' ');
    }

    exportData() {
        const data = {
            songs: this.songs,
            chords: this.chords,
            customCategories: this.customCategories,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `repertorio-violao-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('✅ Dados exportados com sucesso!');
    }
    
    importData() {
        document.getElementById('importFileInput').click();
    }
    
    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!data.songs || !data.chords) {
                    alert('❌ Arquivo inválido! O arquivo JSON não contém os dados esperados.');
                    return;
                }
                
                const confirmMsg = `Você está prestes a importar:\n\n` +
                    `- ${data.songs.length} músicas\n` +
                    `- ${data.chords.length} acordes\n` +
                    `- ${data.customCategories?.length || 0} categorias\n\n` +
                    `Isso irá SUBSTITUIR todos os seus dados atuais!\n\n` +
                    `Deseja continuar?`;
                
                if (!confirm(confirmMsg)) {
                    return;
                }
                
                this.songs = data.songs || [];
                this.chords = data.chords || [];
                this.customCategories = data.customCategories || [];
                
                this.saveSongs();
                this.saveChords();
                this.saveCustomCategories();
                
                this.renderSongsList();
                this.updateCategoryTabs();
                
                alert('✅ Dados importados com sucesso!');
            } catch (error) {
                alert('❌ Erro ao ler o arquivo! Certifique-se de que é um arquivo JSON válido.');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
        e.target.value = '';
    }
    
    toggleEditorMode() {
        this.visualEditorMode = !this.visualEditorMode;
        const textMode = document.getElementById('textEditorMode');
        const visualMode = document.getElementById('visualEditorMode');
        const toggleBtn = document.getElementById('toggleEditorMode');
        
        if (this.visualEditorMode) {
            textMode.style.display = 'none';
            visualMode.style.display = 'block';
            toggleBtn.textContent = '📝 Editor de Texto';
            this.initChordGrid();
        } else {
            textMode.style.display = 'block';
            visualMode.style.display = 'none';
            toggleBtn.textContent = '🎸 Editor Visual';
        }
    }
    
    initChordGrid() {
        const grid = document.getElementById('chordGrid');
        if (!grid) {
            console.error('Element chordGrid not found');
            return;
        }
        
        const numFrets = 4;
        const numStrings = 6;
        
        let html = '<div class="chord-diagram">';
        html += '<div class="fretboard">';
        
        for (let string = 0; string < numStrings; string++) {
            html += `<div class="string-line" data-string="${string}" style="top: ${this.EDITOR_STRING_POSITIONS[string]}px"></div>`;
        }
        
        for (let fret = 0; fret <= numFrets; fret++) {
            html += `<div class="fret-line" style="left: ${fret * 25}%"></div>`;
        }
        
        for (let fret = 0; fret < numFrets; fret++) {
            for (let string = 0; string < numStrings; string++) {
                const key = `${string}-${fret}`;
                const finger = this.chordData.fingers[key] || 0;
                const topPos = this.EDITOR_STRING_POSITIONS[string];
                const leftPos = ((fret + 0.5) / numFrets) * 100;
                
                html += `<div class="finger-position" data-string="${string}" data-fret="${fret}" style="top: ${topPos}px; left: ${leftPos}%">`;
                if (finger > 0) {
                    html += `<span class="finger-marker">${finger}</span>`;
                }
                html += '</div>';
            }
        }
        
        html += '</div>';
        html += '</div>';
        grid.innerHTML = html;
    }
    
    selectFinger(btn) {
        document.querySelectorAll('.finger-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedFinger = parseInt(btn.dataset.finger);
    }
    
    toggleStringStatus(btn) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const stringIndex = parseInt(parent.dataset.string);
        const status = btn.dataset.status;
        this.chordData.stringStatus[stringIndex] = status === 'open' ? 'o' : 'x';
    }
    
    toggleFingerPosition(cell) {
        const string = parseInt(cell.dataset.string);
        const fret = parseInt(cell.dataset.fret);
        const key = `${string}-${fret}`;
        
        if (this.selectedFinger === 0) {
            delete this.chordData.fingers[key];
            cell.innerHTML = '';
        } else {
            this.chordData.fingers[key] = this.selectedFinger;
            cell.innerHTML = `<span class="finger-marker">${this.selectedFinger}</span>`;
        }
    }
    
    handleFretChange(e) {
        this.chordData.startFret = parseInt(e.target.value);
    }
    
    chordDataToString() {
        const lines = [];
        const strings = 6;
        const frets = 5;
        
        if (this.chordData.startFret > 0) {
            lines.push(`${this.chordData.startFret}ª casa`);
        }
        
        for (let string = 0; string < strings; string++) {
            let stringLine = '';
            for (let fret = 0; fret < frets; fret++) {
                const key = `${string}-${fret}`;
                const finger = this.chordData.fingers[key];
                stringLine += finger ? `[${fret}:${finger}]` : '';
            }
            if (stringLine) {
                lines.push(`Corda ${string + 1}: ${stringLine}`);
            }
        }
        
        lines.push(`Status: ${this.chordData.stringStatus.join(' ')}`);
        return lines.join('\n');
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SongManager();
});
