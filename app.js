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
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab') && !e.target.classList.contains('add-category')) {
                this.handleCategoryClick(e.target);
            }
            if (e.target.classList.contains('chord') && e.target.classList.contains('clickable')) {
                this.showChordPopup(e.target.textContent);
            }
        });
        document.getElementById("exportBtn").addEventListener("click", () => {
            const exportData = {
                songs,
                customCategories,
                chord,
            };
            downloadFile("backup.json", JSON.stringify(exportData, null, 2));
        });
        // Botão de importar backup
        document.getElementById("importBtn").addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);
                    songs = data.songs || [];
                    customCategories = data.customCategories || [];
                    chords = data.chords || [];
                    saveData();   // salva no localStorage
                    renderSongs();
                    alert("Dados importados com sucesso!");
                } catch (error) {
                    alert("Arquivo inválido ou corrompido.");
                }
            };
            reader.readAsText(file);
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
        const diagram = document.getElementById('chordDiagram').value.trim();
        
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
                    diagram: diagram
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
                diagram: diagram
            });
        }
        
        this.saveChords();
        this.renderChordsList();
        
        document.getElementById('chordName').value = '';
        document.getElementById('chordDiagram').value = '';
    }

    editChord(chordId) {
        const chord = this.chords.find(c => c.id === chordId);
        if (!chord) return;
        
        this.currentChordId = chordId;
        document.getElementById('chordName').value = chord.name;
        document.getElementById('chordDiagram').value = chord.diagram;
        document.getElementById('addChordBtn').textContent = '✓ Atualizar Acorde';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEditChord() {
        this.currentChordId = null;
        document.getElementById('chordName').value = '';
        document.getElementById('chordDiagram').value = '';
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
        document.getElementById('chordPopupDiagram').textContent = chord.diagram;
        document.getElementById('chordPopup').style.display = 'flex';
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function downloadFile(filename, content) {
        const element = document.createElement("a");
        const blob = new Blob([content], { type: "application/json" });
        element.href = URL.createObjectURL(blob);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new SongManager();
});
