// AI Journal Application
class JournalApp {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        this.trashEntries = JSON.parse(localStorage.getItem('journalTrash')) || [];
        this.currentView = 'entries';
        this.editingEntry = null;
        this.searchResults = [];
        this.selectedEntries = [];
        this.aiConfig = JSON.parse(localStorage.getItem('aiConfig')) || {
            apiKey: '',
            model: 'gpt-4'
        };
        this.currentPhotos = [];
        this.currentLocation = null;
        
        this.initializeApp();
    }


    initializeApp() {
        this.setupEventListeners();
        this.loadEntries();
        this.updateStats();
        this.setupTheme();
        this.setupDateDefaults();
        this.initializeAiPanel();
        this.initializeTrashCleanup();
    }

    initializeAiPanel() {
        const panel = document.getElementById('aiPanel');
        const floatingToggle = document.getElementById('aiPanelToggleFloating');
        const contentArea = document.querySelector('.content-area');
        
        // Start with panel collapsed and floating button visible
        panel.classList.add('collapsed');
        floatingToggle.classList.remove('hidden');
        contentArea.classList.remove('with-ai-panel');
        
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Entry actions
        document.getElementById('newEntryBtn').addEventListener('click', () => {
            this.switchView('new');
        });

        document.getElementById('saveEntryBtn').addEventListener('click', () => {
            this.saveEntry();
        });

        document.getElementById('cancelEntryBtn').addEventListener('click', () => {
            this.switchView('entries');
            this.clearEntryForm();
        });

        document.getElementById('updateEntryBtn').addEventListener('click', () => {
            this.updateEntry();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.switchView('entries');
            this.editingEntry = null;
        });

        document.getElementById('deleteEntryBtn').addEventListener('click', () => {
            this.deleteEntry(this.editingEntry);
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        document.getElementById('tagFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('dateFromFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('dateToFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editModalEntry').addEventListener('click', () => {
            this.editEntryFromModal();
        });

        document.getElementById('deleteModalEntry').addEventListener('click', () => {
            this.deleteEntryFromModal();
        });

        // Click outside modal to close
        document.getElementById('entryModal').addEventListener('click', (e) => {
            if (e.target.id === 'entryModal') {
                this.closeModal();
            }
        });

        // Auto-save on input
        document.getElementById('entryTitle').addEventListener('input', () => {
            this.autoSave();
        });

        document.getElementById('entryContent').addEventListener('input', () => {
            this.autoSave();
        });

        // AI Panel events
        document.getElementById('aiPanelToggle').addEventListener('click', () => {
            this.toggleAiPanel();
        });

        document.getElementById('aiPanelToggleFloating').addEventListener('click', () => {
            this.showAiPanel();
        });

        document.getElementById('summarizeSelected').addEventListener('click', () => {
            this.summarizeSelectedEntries();
        });

        document.getElementById('summarizeAll').addEventListener('click', () => {
            this.summarizeAllEntries();
        });

        // Batch delete event listeners
        document.getElementById('batchDeleteSelected').addEventListener('click', () => {
            this.showBatchDeleteModal();
        });

        document.getElementById('closeBatchDeleteModal').addEventListener('click', () => {
            this.hideBatchDeleteModal();
        });

        document.getElementById('cancelBatchDelete').addEventListener('click', () => {
            this.hideBatchDeleteModal();
        });

        document.getElementById('confirmBatchDelete').addEventListener('click', () => {
            this.confirmBatchDelete();
        });

        document.getElementById('suggestTags').addEventListener('click', () => {
            this.suggestTags();
        });

        document.getElementById('generateInsights').addEventListener('click', () => {
            this.generateInsights();
        });

        // Settings events
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('testApiKey').addEventListener('click', () => {
            this.testApiKey();
        });

        // Trash events
        document.getElementById('clearTrashBtn').addEventListener('click', () => {
            this.clearTrash();
        });

        // Markdown events
        document.getElementById('writeTab').addEventListener('click', () => {
            this.switchMarkdownTab('write');
        });

        document.getElementById('previewTab').addEventListener('click', () => {
            this.switchMarkdownTab('preview');
        });

        document.getElementById('editWriteTab').addEventListener('click', () => {
            this.switchMarkdownTab('editWrite');
        });

        document.getElementById('editPreviewTab').addEventListener('click', () => {
            this.switchMarkdownTab('editPreview');
        });

        // Export events
        document.getElementById('exportAllPDF').addEventListener('click', () => {
            this.exportEntries('pdf', 'all');
        });

        document.getElementById('exportAllMD').addEventListener('click', () => {
            this.exportEntries('markdown', 'all');
        });

        document.getElementById('exportSelectedPDF').addEventListener('click', () => {
            this.exportEntries('pdf', 'selected');
        });

        document.getElementById('exportSelectedMD').addEventListener('click', () => {
            this.exportEntries('markdown', 'selected');
        });

        // Photo upload events
        document.getElementById('photoUpload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'photoPreviewContainer');
        });

        document.getElementById('editPhotoUpload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'editPhotoPreviewContainer');
        });

        // Geolocation events
        document.getElementById('getLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation('entryLocation');
        });

        document.getElementById('getEditLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation('editEntryLocation');
        });

        // Inline photo insertion events
        document.getElementById('insertPhotoTab').addEventListener('click', () => {
            this.insertInlinePhoto('entryContent');
        });

        document.getElementById('editInsertPhotoTab').addEventListener('click', () => {
            this.insertInlinePhoto('editEntryContent');
        });

    }

    setupTheme() {
        const savedTheme = localStorage.getItem('journalTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('journalTheme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    setupDateDefaults() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
    }

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });

        // Remove active class from nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected view
        const viewId = viewName === 'new' ? 'newEntryView' : 
                      viewName === 'edit' ? 'editEntryView' :
                      viewName === 'search' ? 'searchView' :
                      viewName === 'stats' ? 'statsView' :
                      viewName === 'trash' ? 'trashView' :
                      viewName === 'settings' ? 'settingsView' : 'entriesView';
        document.getElementById(viewId).classList.remove('hidden');

        // Add active class to nav item
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        this.currentView = viewName;

        // Load data for specific views
        switch (viewName) {
            case 'entries':
                this.loadEntries();
                break;
            case 'search':
                this.loadTags();
                this.performSearch('');
                break;
            case 'stats':
                this.updateStats();
                this.updateCharts();
                break;
            case 'new':
                this.clearEntryForm();
                break;
            case 'edit':
                // Edit view is handled directly in editEntry method
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'trash':
                this.loadTrashEntries();
                break;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveEntry() {
        const title = document.getElementById('entryTitle').value.trim();
        const content = document.getElementById('entryContent').value.trim();
        const date = document.getElementById('entryDate').value;
        const tags = document.getElementById('entryTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const location = document.getElementById('entryLocation').value.trim();

        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }

        const entry = {
            id: this.generateId(),
            title,
            content,
            date,
            tags,
            location,
            photos: [...this.currentPhotos], // Copy current photos
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: content.split(/\s+/).length
        };

        this.entries.unshift(entry);
        this.saveToLocalStorage();
        this.switchView('entries');
        this.clearEntryForm();
        this.showNotification('Entry saved successfully!', 'success');
    }

    updateEntry() {
        const title = document.getElementById('editEntryTitle').value.trim();
        const content = document.getElementById('editEntryContent').value.trim();
        const date = document.getElementById('editEntryDate').value;
        const tags = document.getElementById('editEntryTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const location = document.getElementById('editEntryLocation').value.trim();

        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }

        const entryIndex = this.entries.findIndex(entry => entry.id === this.editingEntry);
        if (entryIndex !== -1) {
            this.entries[entryIndex] = {
                ...this.entries[entryIndex],
                title,
                content,
                date,
                tags,
                location,
                photos: [...this.currentPhotos], // Copy current photos
                updatedAt: new Date().toISOString(),
                wordCount: content.split(/\s+/).length
            };

            this.saveToLocalStorage();
            this.switchView('entries');
            this.editingEntry = null;
            this.showNotification('Entry updated successfully!', 'success');
        }
    }

    deleteEntry(entryId) {
        if (confirm('Move this entry to trash? You can restore it from the Trash view.')) {
            const entry = this.entries.find(e => e.id === entryId);
            if (entry) {
                // Move to trash with deletion timestamp
                const trashEntry = {
                    ...entry,
                    deletedAt: new Date().toISOString(),
                    deleteAfter: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                };
                
                this.trashEntries.unshift(trashEntry);
                this.entries = this.entries.filter(entry => entry.id !== entryId);
                
                this.saveToLocalStorage();
                this.saveTrashToLocalStorage();
                this.loadEntries();
                this.closeModal();
                this.showNotification('Entry moved to trash!', 'success');
            }
        }
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            this.editingEntry = entryId;
            
            // Hide all views first
            document.querySelectorAll('.view').forEach(view => {
                view.classList.add('hidden');
            });
            
            // Remove active class from nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Show edit view
            const editView = document.getElementById('editEntryView');
            editView.classList.remove('hidden');
            
            // Add active class to nav item
            const editNavItem = document.querySelector('[data-view="edit"]');
            if (editNavItem) editNavItem.classList.add('active');
            
            this.currentView = 'edit';
            
            // Wait a moment for DOM to be ready, then populate
            setTimeout(() => {
                const titleField = document.getElementById('editEntryTitle');
                const contentField = document.getElementById('editEntryContent');
                const dateField = document.getElementById('editEntryDate');
                const tagsField = document.getElementById('editEntryTags');
                const locationField = document.getElementById('editEntryLocation');
                
                if (titleField) titleField.value = entry.title;
                if (contentField) contentField.value = entry.content;
                if (dateField) dateField.value = entry.date;
                if (tagsField) tagsField.value = entry.tags.join(', ');
                if (locationField) locationField.value = entry.location || '';
                
                // Load photos for editing
                this.loadPhotosForEdit(entry.photos || []);
                
                // Initialize markdown preview
                this.updateMarkdownPreview(true);
                this.switchMarkdownTab('editWrite');
            }, 200);
        }
    }

    viewEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            document.getElementById('modalTitle').textContent = entry.title;
            document.getElementById('modalDate').textContent = this.formatDate(entry.date);
            document.getElementById('modalTags').textContent = entry.tags.join(', ');
            
            // Display location if available
            const locationElement = document.getElementById('modalLocation');
            if (entry.location) {
                locationElement.textContent = entry.location;
                locationElement.style.display = 'flex';
            } else {
                locationElement.style.display = 'none';
            }
            
            // Display photos if available
            const photosContainer = document.getElementById('modalPhotos');
            if (entry.photos && entry.photos.length > 0) {
                photosContainer.innerHTML = entry.photos.map(photo => 
                    `<div class="modal-photo">
                        <img src="${photo.data}" alt="${photo.name}" onclick="this.requestFullscreen()">
                    </div>`
                ).join('');
                photosContainer.style.display = 'flex';
            } else {
                photosContainer.style.display = 'none';
            }
            
            // For modal, show full markdown without truncation
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false
                });
                
                // Process photo references for the entry's photos
                const processedContent = this.processPhotoReferencesForEntry(entry.content, entry.photos || []);
                const fullHtml = marked.parse(processedContent);
                document.getElementById('modalContent').innerHTML = fullHtml;
            } else {
                document.getElementById('modalContent').innerHTML = this.escapeHtml(entry.content);
            }
            
            // Update modal buttons
            document.getElementById('editModalEntry').onclick = () => this.editEntry(entryId);
            document.getElementById('deleteModalEntry').onclick = () => this.deleteEntry(entryId);
            
            this.openModal();
        }
    }

    loadEntries() {
        const entriesGrid = document.getElementById('entriesGrid');
        const entryCount = document.getElementById('entryCount');
        
        entryCount.textContent = `${this.entries.length} ${this.entries.length === 1 ? 'entry' : 'entries'}`;

        if (this.entries.length === 0) {
            entriesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No entries yet</h3>
                    <p style="color: var(--text-muted);">Start your journaling journey by creating your first entry!</p>
                </div>
            `;
            return;
        }

        entriesGrid.innerHTML = this.entries.map(entry => `
            <div class="entry-card fade-in" data-entry-id="${entry.id}" 
                 onclick="journalApp.viewEntry('${entry.id}')" 
                 oncontextmenu="event.preventDefault(); journalApp.toggleEntrySelection('${entry.id}'); return false;">
                <div class="entry-card-header">
                    <h3 class="entry-card-title">${this.escapeHtml(entry.title)}</h3>
                    <div class="entry-card-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(entry.date)}
                    </div>
                    ${entry.location ? `
                        <div class="entry-card-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${this.escapeHtml(entry.location)}
                        </div>
                    ` : ''}
                </div>
                ${entry.photos && entry.photos.length > 0 ? `
                    <div class="entry-card-photos">
                        ${entry.photos.slice(0, 3).map(photo => 
                            `<div class="entry-card-photo">
                                <img src="${photo.data}" alt="${photo.name}">
                            </div>`
                        ).join('')}
                        ${entry.photos.length > 3 ? `<div class="photo-count">+${entry.photos.length - 3}</div>` : ''}
                    </div>
                ` : ''}
                <div class="entry-card-content">${this.renderMarkdownPreview(entry.content)}</div>
                <div class="entry-card-tags">
                    ${entry.tags.map(tag => `<span class="entry-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="entry-card-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" 
                            onclick="event.stopPropagation(); journalApp.toggleEntrySelection('${entry.id}')">
                        <i class="fas fa-check"></i> Select
                    </button>
                    <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" 
                            onclick="event.stopPropagation(); journalApp.editEntry('${entry.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" 
                            onclick="event.stopPropagation(); journalApp.downloadEntry('${entry.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `).join('');

        this.updateEntrySelection();
    }

    performSearch(query) {
        const tagFilter = document.getElementById('tagFilter').value;
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;

        let results = this.entries.filter(entry => {
            const matchesQuery = !query || 
                entry.title.toLowerCase().includes(query.toLowerCase()) ||
                entry.content.toLowerCase().includes(query.toLowerCase()) ||
                entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

            const matchesTag = !tagFilter || entry.tags.includes(tagFilter);

            const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
            const matchesDateTo = !dateTo || entry.date <= dateTo;

            return matchesQuery && matchesTag && matchesDateFrom && matchesDateTo;
        });

        this.searchResults = results;
        this.displaySearchResults();
    }

    applyFilters() {
        const query = document.getElementById('searchInput').value;
        this.performSearch(query);
    }

    displaySearchResults() {
        const searchResults = document.getElementById('searchResults');
        
        if (this.searchResults.length === 0) {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary);">No results found</h3>
                    <p style="color: var(--text-muted);">Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = this.searchResults.map(entry => `
            <div class="search-result-item" onclick="journalApp.viewEntry('${entry.id}')">
                <div class="search-result-header">
                    <h4>${this.escapeHtml(entry.title)}</h4>
                    <span class="search-result-date">${this.formatDate(entry.date)}</span>
                </div>
                <div class="search-result-content">${this.escapeHtml(entry.content.substring(0, 200))}...</div>
                <div class="search-result-tags">
                    ${entry.tags.map(tag => `<span class="entry-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    loadTags() {
        const tagFilter = document.getElementById('tagFilter');
        const allTags = [...new Set(this.entries.flatMap(entry => entry.tags))].sort();
        
        tagFilter.innerHTML = '<option value="">All Tags</option>' +
            allTags.map(tag => `<option value="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</option>`).join('');
    }

    updateStats() {
        const totalEntries = this.entries.length;
        const totalWords = this.entries.reduce((sum, entry) => sum + entry.wordCount, 0);
        const totalTags = new Set(this.entries.flatMap(entry => entry.tags)).size;
        
        // Calculate streak
        const streakDays = this.calculateStreak();

        document.getElementById('totalEntries').textContent = totalEntries;
        document.getElementById('totalWords').textContent = totalWords.toLocaleString();
        document.getElementById('totalTags').textContent = totalTags;
        document.getElementById('streakDays').textContent = streakDays;
    }

    calculateStreak() {
        if (this.entries.length === 0) return 0;

        const sortedDates = this.entries
            .map(entry => entry.date)
            .sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date();
        let currentDate = new Date(today);

        for (let i = 0; i < sortedDates.length; i++) {
            const entryDate = new Date(sortedDates[i]);
            const diffTime = currentDate - entryDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streak++;
                currentDate = new Date(entryDate);
            } else {
                break;
            }
        }

        return streak;
    }

    updateCharts() {
        this.updateMonthlyChart();
        this.updateTagCloud();
    }

    updateMonthlyChart() {
        const chartContainer = document.getElementById('monthlyChart');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Get entries for current month
        const monthlyEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        // Group by day
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyCounts = Array(daysInMonth).fill(0);

        monthlyEntries.forEach(entry => {
            const day = new Date(entry.date).getDate();
            dailyCounts[day - 1]++;
        });

        const maxCount = Math.max(...dailyCounts, 1);
        
        chartContainer.innerHTML = `
            <div class="simple-bar-chart">
                ${dailyCounts.map((count, index) => `
                    <div class="bar-container">
                        <div class="bar" style="height: ${(count / maxCount) * 100}%"></div>
                        <span class="bar-label">${index + 1}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateTagCloud() {
        const tagCloud = document.getElementById('tagCloud');
        const tagCounts = {};
        
        this.entries.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (sortedTags.length === 0) {
            tagCloud.innerHTML = '<p style="color: var(--text-muted);">No tags yet</p>';
            return;
        }

        const maxCount = Math.max(...sortedTags.map(([, count]) => count));

        tagCloud.innerHTML = sortedTags.map(([tag, count]) => {
            const size = Math.max(0.8, (count / maxCount) * 1.5);
            return `<span class="tag-cloud-item" style="font-size: ${size}em;">${this.escapeHtml(tag)} (${count})</span>`;
        }).join(' ');
    }

    openModal() {
        document.getElementById('entryModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('entryModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    editEntryFromModal() {
        const modalTitle = document.getElementById('modalTitle').textContent;
        const entry = this.entries.find(e => e.title === modalTitle);
        if (entry) {
            this.closeModal();
            this.editEntry(entry.id);
        }
    }

    deleteEntryFromModal() {
        const modalTitle = document.getElementById('modalTitle').textContent;
        const entry = this.entries.find(e => e.title === modalTitle);
        if (entry) {
            this.deleteEntry(entry.id);
        }
    }

    clearEntryForm() {
        // Only clear the NEW entry form fields, not the edit form fields
        const titleField = document.getElementById('entryTitle');
        const contentField = document.getElementById('entryContent');
        const tagsField = document.getElementById('entryTags');
        const dateField = document.getElementById('entryDate');
        const locationField = document.getElementById('entryLocation');
        
        if (titleField) titleField.value = '';
        if (contentField) contentField.value = '';
        if (tagsField) tagsField.value = '';
        if (locationField) locationField.value = '';
        
        // Clear photos
        this.currentPhotos = [];
        const photoContainer = document.getElementById('photoPreviewContainer');
        if (photoContainer) photoContainer.innerHTML = '';
        
        if (dateField) {
            // Auto-fill with current date and time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            // Set date field to current date
            dateField.value = `${year}-${month}-${day}`;
            
            // Auto-fill title with current date and time
            if (titleField) {
                titleField.value = `${year}-${month}-${day} ${hours}:${minutes}`;
            }
        }
    }

    autoSave() {
        // Simple auto-save to localStorage (could be enhanced with a debounce)
        const draft = {
            title: document.getElementById('entryTitle').value,
            content: document.getElementById('entryContent').value,
            tags: document.getElementById('entryTags').value,
            date: document.getElementById('entryDate').value
        };
        localStorage.setItem('journalDraft', JSON.stringify(draft));
    }

    loadDraft() {
        const draft = JSON.parse(localStorage.getItem('journalDraft'));
        if (draft && this.currentView === 'new') {
            document.getElementById('entryTitle').value = draft.title || '';
            document.getElementById('entryContent').value = draft.content || '';
            document.getElementById('entryTags').value = draft.tags || '';
            document.getElementById('entryDate').value = draft.date || new Date().toISOString().split('T')[0];
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : 'primary'}-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease-in-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // AI Panel Methods
    toggleAiPanel() {
        const panel = document.getElementById('aiPanel');
        const toggle = document.getElementById('aiPanelToggle');
        const floatingToggle = document.getElementById('aiPanelToggleFloating');
        const contentArea = document.querySelector('.content-area');
        
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            toggle.querySelector('i').className = 'fas fa-chevron-right';
            floatingToggle.classList.add('hidden');
            contentArea.classList.add('with-ai-panel');
        } else {
            panel.classList.add('collapsed');
            toggle.querySelector('i').className = 'fas fa-chevron-left';
            floatingToggle.classList.remove('hidden');
            contentArea.classList.remove('with-ai-panel');
        }
    }

    showAiPanel() {
        const panel = document.getElementById('aiPanel');
        const toggle = document.getElementById('aiPanelToggle');
        const floatingToggle = document.getElementById('aiPanelToggleFloating');
        const contentArea = document.querySelector('.content-area');
        
        panel.classList.remove('collapsed');
        toggle.querySelector('i').className = 'fas fa-chevron-right';
        floatingToggle.classList.add('hidden');
        contentArea.classList.add('with-ai-panel');
    }

    // Settings Methods
    loadSettings() {
        document.getElementById('openaiApiKey').value = this.aiConfig.apiKey || '';
        document.getElementById('aiModel').value = this.aiConfig.model || 'gpt-4';
    }

    saveSettings() {
        this.aiConfig.apiKey = document.getElementById('openaiApiKey').value.trim();
        this.aiConfig.model = document.getElementById('aiModel').value;
        
        localStorage.setItem('aiConfig', JSON.stringify(this.aiConfig));
        this.showNotification('Settings saved successfully!', 'success');
    }

    async testApiKey() {
        const apiKey = document.getElementById('openaiApiKey').value.trim();
        if (!apiKey) {
            alert('Please enter an API key first.');
            return;
        }

        // Temporarily set the API key for testing
        const originalApiKey = this.aiConfig.apiKey;
        this.aiConfig.apiKey = apiKey;

        const testBtn = document.getElementById('testApiKey');
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        testBtn.disabled = true;

        try {
            console.log('🧪 Testing API connection in Electron app...');
            const success = await this.testApiConnection();
            
            if (success) {
                this.showNotification('✅ API key is valid and working!', 'success');
            } else {
                this.showNotification('❌ API key test failed. Check console for details.', 'error');
            }
        } catch (error) {
            console.error('Test API Key Error:', error);
            this.showNotification(`❌ Error testing API key: ${error.message}`, 'error');
        } finally {
            // Restore original API key
            this.aiConfig.apiKey = originalApiKey;
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
        }
    }

    // AI API Methods
    async callOpenAI(prompt, maxTokens = 500) {
        if (!this.aiConfig.apiKey) {
            this.showNotification('Please configure your OpenAI API key in Settings first.', 'error');
            return null;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.aiConfig.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant that helps with journal analysis and insights.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error);
            this.showNotification(`AI request failed: ${error.message}`, 'error');
            return null;
        }
    }

    // Test API Connection
    async testApiConnection() {
        if (!this.aiConfig.apiKey) {
            this.showNotification('Please configure your OpenAI API key in Settings first.', 'error');
            return false;
        }

        try {
            console.log('Testing API connection...');
            console.log('API Key:', this.aiConfig.apiKey.substring(0, 10) + '...');
            console.log('Model:', this.aiConfig.model);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.aiConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.aiConfig.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello, this is a test message. Please respond with "API connection successful!"'
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.7
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            this.showNotification('✅ API connection successful!', 'success');
            return true;
        } catch (error) {
            console.error('API Connection Test Failed:', error);
            this.showNotification(`❌ API connection failed: ${error.message}`, 'error');
            return false;
        }
    }

    // Summarization Methods
    async summarizeSelectedEntries() {
        if (this.selectedEntries.length === 0) {
            this.showNotification('Please select entries to summarize first.', 'error');
            return;
        }

        const entriesToSummarize = this.entries.filter(entry => 
            this.selectedEntries.includes(entry.id)
        );

        await this.performSummarization(entriesToSummarize, 'Selected Entries');
    }

    async summarizeAllEntries() {
        if (this.entries.length === 0) {
            this.showNotification('No entries to summarize.', 'error');
            return;
        }

        await this.performSummarization(this.entries, 'All Entries');
    }

    async performSummarization(entries, title) {
        const output = document.getElementById('summaryOutput');
        output.innerHTML = '<div class="ai-loading">Generating summary...</div>';

        const entryTexts = entries.map(entry => 
            `Title: ${entry.title}\nDate: ${entry.date}\nContent: ${entry.content}\nTags: ${entry.tags.join(', ')}`
        ).join('\n\n---\n\n');

        const prompt = `Please provide a concise summary of the following journal entries. Focus on the main themes, emotions, and key events mentioned:

${entryTexts}

Please provide:
1. A brief overview (2-3 sentences)
2. Main themes and topics
3. Emotional patterns or moods
4. Any notable insights or reflections

Keep the summary clear and well-structured.`;

        const summary = await this.callOpenAI(prompt, 800);
        
        if (summary) {
            output.innerHTML = `
                <div class="ai-result">
                    <h5>Summary of ${title} (${entries.length} entries)</h5>
                    <div>${summary.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        } else {
            output.innerHTML = '<p class="ai-placeholder">Failed to generate summary. Please try again.</p>';
        }
    }

    // Tag Suggestion Methods
    async suggestTags() {
        if (!this.editingEntry) {
            this.showNotification('Please open an entry to edit first.', 'error');
            return;
        }

        const entry = this.entries.find(e => e.id === this.editingEntry);
        if (!entry) return;

        const output = document.getElementById('tagOutput');
        output.innerHTML = '<div class="ai-loading">Analyzing entry for tag suggestions...</div>';

        const prompt = `Based on the following journal entry, suggest 3-5 relevant tags that would help categorize and organize this content. Tags should be:
- Single words or short phrases
- Relevant to the main topics and themes
- Useful for future searching and organization

Journal Entry:
Title: ${entry.title}
Content: ${entry.content}

Current tags: ${entry.tags.join(', ')}

Please provide only the suggested tags, separated by commas, without any additional text.`;

        const suggestedTags = await this.callOpenAI(prompt, 100);
        
        if (suggestedTags) {
            const tags = suggestedTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            output.innerHTML = `
                <div class="ai-result">
                    <h5>Suggested Tags:</h5>
                    <div class="ai-tags">
                        ${tags.map(tag => `<span class="ai-tag" onclick="journalApp.applySuggestedTag('${tag}')">${tag}</span>`).join('')}
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-muted);">
                        Click on a tag to add it to your entry.
                    </p>
                </div>
            `;
        } else {
            output.innerHTML = '<p class="ai-placeholder">Failed to generate tag suggestions. Please try again.</p>';
        }
    }

    applySuggestedTag(tag) {
        const currentTags = document.getElementById('editEntryTags').value;
        const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(t => t) : [];
        
        if (!tagsArray.includes(tag)) {
            tagsArray.push(tag);
            document.getElementById('editEntryTags').value = tagsArray.join(', ');
            this.showNotification(`Tag "${tag}" added!`, 'success');
        } else {
            this.showNotification(`Tag "${tag}" is already added.`, 'info');
        }
    }

    // Insights Methods
    async generateInsights() {
        if (this.entries.length === 0) {
            this.showNotification('No entries available for analysis.', 'error');
            return;
        }

        const output = document.getElementById('insightsOutput');
        output.innerHTML = '<div class="ai-loading">Analyzing your journaling patterns...</div>';

        // Get recent entries (last 10) for analysis
        const recentEntries = this.entries.slice(0, 10);
        const entryData = recentEntries.map(entry => ({
            date: entry.date,
            title: entry.title,
            content: entry.content.substring(0, 200) + '...',
            tags: entry.tags,
            wordCount: entry.wordCount
        }));

        const prompt = `Analyze the following journal entries and provide insights about the user's writing patterns, themes, and personal growth. Focus on:

1. Writing patterns and frequency
2. Common themes and topics
3. Emotional patterns and mood trends
4. Personal growth indicators
5. Suggestions for future journaling

Recent entries data:
${JSON.stringify(entryData, null, 2)}

Please provide thoughtful insights that would help the user understand their journaling journey better.`;

        const insights = await this.callOpenAI(prompt, 1000);
        
        if (insights) {
            output.innerHTML = `
                <div class="ai-result">
                    <h5>Your Journaling Insights</h5>
                    <div>${insights.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        } else {
            output.innerHTML = '<p class="ai-placeholder">Failed to generate insights. Please try again.</p>';
        }
    }

    // Entry Selection Methods
    toggleEntrySelection(entryId) {
        const index = this.selectedEntries.indexOf(entryId);
        if (index > -1) {
            this.selectedEntries.splice(index, 1);
        } else {
            this.selectedEntries.push(entryId);
        }
        
        
        this.updateEntrySelection();
        this.updateSelectionUI();
    }

    updateEntrySelection() {
        document.querySelectorAll('.entry-card').forEach(card => {
            const entryId = card.dataset.entryId;
            if (this.selectedEntries.includes(entryId)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    updateSelectionUI() {
        const selectedCount = this.selectedEntries.length;
        const summarizeBtn = document.getElementById('summarizeSelected');
        const batchDeleteBtn = document.getElementById('batchDeleteSelected');
        
        
        // Update AI panel summarize button
        if (selectedCount > 0) {
            summarizeBtn.textContent = `Summarize Selected (${selectedCount})`;
            summarizeBtn.disabled = false;
        } else {
            summarizeBtn.innerHTML = '<i class="fas fa-list"></i> Summarize Selected';
            summarizeBtn.disabled = true;
        }
        
        // Update batch delete button in entries view header
        if (batchDeleteBtn) {
            if (selectedCount > 0) {
                batchDeleteBtn.textContent = `Delete Selected (${selectedCount})`;
                batchDeleteBtn.disabled = false;
            } else {
                batchDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Selected';
                batchDeleteBtn.disabled = true;
            }
        }
    }

    clearSelection() {
        this.selectedEntries = [];
        this.updateEntrySelection();
        this.updateSelectionUI();
    }

    // Trash System Methods
    saveTrashToLocalStorage() {
        localStorage.setItem('journalTrash', JSON.stringify(this.trashEntries));
    }

    loadTrashEntries() {
        const trashGrid = document.getElementById('trashGrid');
        
        // Clean up expired entries
        this.cleanupExpiredTrash();
        
        if (this.trashEntries.length === 0) {
            trashGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trash" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Trash is empty</h3>
                    <p style="color: var(--text-muted);">Deleted entries will appear here for 30 days.</p>
                </div>
            `;
            return;
        }

        trashGrid.innerHTML = this.trashEntries.map(entry => `
            <div class="trash-entry-card fade-in">
                <div class="trash-delete-date">
                    Deleted ${this.formatDate(entry.deletedAt)}
                </div>
                
                <div class="trash-entry-header">
                    <div>
                        <h3 class="trash-entry-title">${this.escapeHtml(entry.title)}</h3>
                        <div class="trash-entry-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(entry.date)}
                        </div>
                    </div>
                </div>
                
                <div class="trash-entry-content">${this.escapeHtml(entry.content)}</div>
                
                <div class="trash-entry-tags">
                    ${entry.tags.map(tag => `<span class="entry-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                
                <div class="trash-entry-actions">
                    <button class="trash-restore-btn" onclick="journalApp.restoreEntry('${entry.id}')">
                        <i class="fas fa-undo"></i>
                        Restore
                    </button>
                    <button class="trash-delete-permanent-btn" onclick="journalApp.deletePermanently('${entry.id}')">
                        <i class="fas fa-trash"></i>
                        Delete Forever
                    </button>
                </div>
            </div>
        `).join('');
    }

    restoreEntry(entryId) {
        const trashEntry = this.trashEntries.find(e => e.id === entryId);
        if (trashEntry) {
            // Remove from trash
            this.trashEntries = this.trashEntries.filter(entry => entry.id !== entryId);
            
            // Add back to entries (remove trash-specific properties)
            const { deletedAt, deleteAfter, ...restoredEntry } = trashEntry;
            this.entries.unshift(restoredEntry);
            
            this.saveToLocalStorage();
            this.saveTrashToLocalStorage();
            this.loadTrashEntries();
            this.showNotification('Entry restored successfully!', 'success');
        }
    }

    deletePermanently(entryId) {
        if (confirm('Are you sure you want to permanently delete this entry? This action cannot be undone.')) {
            this.trashEntries = this.trashEntries.filter(entry => entry.id !== entryId);
            this.saveTrashToLocalStorage();
            this.loadTrashEntries();
            this.showNotification('Entry permanently deleted!', 'success');
        }
    }

    clearTrash() {
        if (this.trashEntries.length === 0) {
            this.showNotification('Trash is already empty!', 'info');
            return;
        }

        if (confirm(`Are you sure you want to permanently delete all ${this.trashEntries.length} entries in trash? This action cannot be undone.`)) {
            this.trashEntries = [];
            this.saveTrashToLocalStorage();
            this.loadTrashEntries();
            this.showNotification('Trash emptied successfully!', 'success');
        }
    }

    cleanupExpiredTrash() {
        const now = new Date();
        const expiredEntries = this.trashEntries.filter(entry => 
            new Date(entry.deleteAfter) < now
        );
        
        if (expiredEntries.length > 0) {
            this.trashEntries = this.trashEntries.filter(entry => 
                new Date(entry.deleteAfter) >= now
            );
            this.saveTrashToLocalStorage();
            console.log(`Cleaned up ${expiredEntries.length} expired trash entries`);
        }
    }

    // Auto-cleanup on app start
    initializeTrashCleanup() {
        this.cleanupExpiredTrash();
        // Schedule cleanup every 24 hours
        setInterval(() => {
            this.cleanupExpiredTrash();
        }, 24 * 60 * 60 * 1000);
    }

    // Markdown Support Methods
    switchMarkdownTab(mode) {
        const isEdit = mode.includes('edit');
        const writeTab = document.getElementById(isEdit ? 'editWriteTab' : 'writeTab');
        const previewTab = document.getElementById(isEdit ? 'editPreviewTab' : 'previewTab');
        const textarea = document.getElementById(isEdit ? 'editEntryContent' : 'entryContent');
        const preview = document.getElementById(isEdit ? 'editMarkdownPreview' : 'markdownPreview');
        
        // Check if elements exist before manipulating them
        if (!writeTab || !previewTab || !textarea || !preview) {
            console.warn('Markdown tab elements not found for mode:', mode);
            return;
        }
        
        if (mode === 'write' || mode === 'editWrite') {
            writeTab.classList.add('active');
            previewTab.classList.remove('active');
            textarea.classList.remove('hidden');
            preview.classList.add('hidden');
        } else {
            writeTab.classList.remove('active');
            previewTab.classList.add('active');
            textarea.classList.add('hidden');
            preview.classList.remove('hidden');
            
            // Update preview content
            this.updateMarkdownPreview(isEdit);
        }
    }

    updateMarkdownPreview(isEdit = false) {
        const textarea = document.getElementById(isEdit ? 'editEntryContent' : 'entryContent');
        const preview = document.getElementById(isEdit ? 'editMarkdownPreview' : 'markdownPreview');
        
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: false
            });
            
            // Process photo references before parsing
            const processedContent = this.processPhotoReferences(textarea.value);
            const html = marked.parse(processedContent);
            preview.innerHTML = html;
        } else {
            preview.innerHTML = '<p>Markdown preview not available. Please refresh the page.</p>';
        }
    }

    // Export Methods
    exportEntries(format, scope, customEntries = null) {
        let entriesToExport;
        
        if (customEntries) {
            entriesToExport = customEntries;
        } else if (scope === 'all') {
            entriesToExport = this.entries;
        } else if (scope === 'selected') {
            entriesToExport = this.entries.filter(entry => 
                this.selectedEntries.includes(entry.id)
            );
            
            if (entriesToExport.length === 0) {
                this.showNotification('Please select entries to export first.', 'error');
                return;
            }
        }

        if (entriesToExport.length === 0) {
            this.showNotification('No entries to export.', 'error');
            return;
        }

        if (format === 'pdf') {
            this.exportToPDF(entriesToExport);
        } else if (format === 'markdown') {
            this.exportToMarkdown(entriesToExport);
        }
    }

    exportToPDF(entries) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set up fonts and styles
            doc.setFont('helvetica');
            
            // Add title
            doc.setFontSize(20);
            doc.text('My Journal Entries', 20, 30);
            
            // Add export date
            doc.setFontSize(10);
            doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 40);
            
            let yPosition = 60;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const lineHeight = 7;
            
            entries.forEach((entry, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Entry title
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(entry.title, margin, yPosition);
                yPosition += lineHeight * 2;
                
                // Entry date
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Date: ${this.formatDate(entry.date)}`, margin, yPosition);
                yPosition += lineHeight;
                
                // Tags
                if (entry.tags.length > 0) {
                    doc.text(`Tags: ${entry.tags.join(', ')}`, margin, yPosition);
                    yPosition += lineHeight;
                }
                
                yPosition += lineHeight;
                
                // Entry content (convert markdown to plain text)
                const content = this.markdownToPlainText(entry.content);
                const lines = doc.splitTextToSize(content, 170);
                
                doc.setFontSize(12);
                doc.text(lines, margin, yPosition);
                yPosition += lines.length * lineHeight + 20;
                
                // Add separator line between entries (except for last entry)
                if (index < entries.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margin, yPosition, 190, yPosition);
                    yPosition += 10;
                }
            });
            
            // Save the PDF
            const fileName = `journal-entries-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            this.showNotification(`PDF exported successfully! (${entries.length} entries)`, 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showNotification('Failed to export PDF. Please try again.', 'error');
        }
    }

    exportToMarkdown(entries) {
        try {
            let markdownContent = `# My Journal Entries\n\n`;
            markdownContent += `*Exported on: ${new Date().toLocaleDateString()}*\n\n`;
            markdownContent += `---\n\n`;
            
            entries.forEach((entry, index) => {
                markdownContent += `## ${entry.title}\n\n`;
                markdownContent += `**Date:** ${this.formatDate(entry.date)}\n\n`;
                
                if (entry.tags.length > 0) {
                    markdownContent += `**Tags:** ${entry.tags.join(', ')}\n\n`;
                }
                
                markdownContent += `${entry.content}\n\n`;
                markdownContent += `---\n\n`;
            });
            
            // Create and download the file
            const blob = new Blob([markdownContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`Markdown exported successfully! (${entries.length} entries)`, 'success');
        } catch (error) {
            console.error('Markdown export error:', error);
            this.showNotification('Failed to export Markdown. Please try again.', 'error');
        }
    }

    markdownToPlainText(markdown) {
        if (typeof marked !== 'undefined') {
            // Convert markdown to HTML first, then strip HTML tags
            const html = marked.parse(markdown);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.textContent || tempDiv.innerText || '';
        }
        return markdown;
    }

    renderMarkdownPreview(markdown) {
        if (typeof marked !== 'undefined') {
            // Configure marked to preserve formatting
            marked.setOptions({
                breaks: true, // Convert \n to <br>
                gfm: true,    // GitHub Flavored Markdown
                sanitize: false // Allow HTML (for our use case)
            });
            
            // Process photo references before parsing
            const processedMarkdown = this.processPhotoReferences(markdown);
            
            // Parse markdown to HTML
            const html = marked.parse(processedMarkdown);
            
            // Truncate for card display while preserving HTML structure
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Get text content for length check
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            
            if (textContent.length > 200) {
                // Truncate HTML content while preserving structure
                const truncatedHtml = this.truncateHtml(html, 200);
                return truncatedHtml + '...';
            }
            
            return html;
        }
        return this.escapeHtml(markdown);
    }

    processPhotoReferences(markdown) {
        // Replace photo references with actual base64 data
        return markdown.replace(/!\[Photo: ([^\]]+)\]\(photo:([^)]+)\)/g, (match, filename, photoId) => {
            const photo = this.currentPhotos.find(p => p.id === photoId);
            if (photo) {
                return `![${filename}](${photo.data})`;
            }
            return match; // Return original if photo not found
        });
    }

    processPhotoReferencesForEntry(markdown, entryPhotos) {
        // Replace photo references with actual base64 data for saved entries
        return markdown.replace(/!\[Photo: ([^\]]+)\]\(photo:([^)]+)\)/g, (match, filename, photoId) => {
            const photo = entryPhotos.find(p => p.id === photoId);
            if (photo) {
                return `![${filename}](${photo.data})`;
            }
            return match; // Return original if photo not found
        });
    }

    truncateHtml(html, maxLength) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        let textLength = 0;
        let truncatedHtml = '';
        
        const walker = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent;
            if (textLength + text.length <= maxLength) {
                textLength += text.length;
                truncatedHtml += text;
            } else {
                const remaining = maxLength - textLength;
                truncatedHtml += text.substring(0, remaining);
                break;
            }
        }
        
        return truncatedHtml;
    }

    // Download individual entry
    downloadEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) {
            this.showNotification('Entry not found.', 'error');
            return;
        }

        // Show download options
        const format = confirm('Click OK for PDF download, Cancel for Markdown download') ? 'pdf' : 'markdown';
        this.exportEntries(format, 'single', [entry]);
    }

    // Photo Upload Methods
    handlePhotoUpload(event, containerId) {
        const files = Array.from(event.target.files);
        const container = document.getElementById(containerId);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const photoData = {
                        id: this.generateId(),
                        data: e.target.result,
                        name: file.name,
                        size: file.size
                    };
                    
                    this.currentPhotos.push(photoData);
                    this.addPhotoPreview(photoData, container);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Clear the input
        event.target.value = '';
    }

    addPhotoPreview(photoData, container) {
        const preview = document.createElement('div');
        preview.className = 'photo-preview';
        preview.innerHTML = `
            <img src="${photoData.data}" alt="${photoData.name}">
            <button class="photo-remove" onclick="journalApp.removePhoto('${photoData.id}', this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(preview);
    }

    removePhoto(photoId, buttonElement) {
        // Remove from current photos array
        this.currentPhotos = this.currentPhotos.filter(photo => photo.id !== photoId);
        
        // Remove from DOM
        buttonElement.closest('.photo-preview').remove();
    }

    loadPhotosForEdit(photos) {
        this.currentPhotos = photos || [];
        const container = document.getElementById('editPhotoPreviewContainer');
        container.innerHTML = '';
        
        this.currentPhotos.forEach(photo => {
            this.addPhotoPreview(photo, container);
        });
    }

    // Geolocation Methods
    getCurrentLocation(fieldId) {
        const locationField = document.getElementById(fieldId);
        const locationBtn = fieldId === 'entryLocation' ? 
            document.getElementById('getLocationBtn') : 
            document.getElementById('getEditLocationBtn');
        
        if (!navigator.geolocation) {
            this.showNotification('Geolocation is not supported by this browser.', 'error');
            return;
        }

        // Disable button and show loading
        locationBtn.disabled = true;
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.reverseGeocode(latitude, longitude, locationField, locationBtn);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to retrieve your location.';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                
                this.showNotification(errorMessage, 'error');
                this.resetLocationButton(locationBtn);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    async reverseGeocode(lat, lng, locationField, locationBtn) {
        try {
            // Use a free geocoding service (Nominatim)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
                // Extract a more readable address
                const address = this.formatAddress(data);
                locationField.value = address;
                this.currentLocation = address;
                this.showNotification('Location detected and added!', 'success');
            } else {
                locationField.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                this.currentLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                this.showNotification('Coordinates added!', 'success');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Fallback to coordinates
            locationField.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            this.currentLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            this.showNotification('Coordinates added!', 'success');
        }
        
        this.resetLocationButton(locationBtn);
    }

    formatAddress(data) {
        const parts = [];
        
        if (data.address) {
            if (data.address.house_number && data.address.road) {
                parts.push(`${data.address.house_number} ${data.address.road}`);
            } else if (data.address.road) {
                parts.push(data.address.road);
            }
            
            if (data.address.city || data.address.town || data.address.village) {
                parts.push(data.address.city || data.address.town || data.address.village);
            }
            
            if (data.address.state) {
                parts.push(data.address.state);
            }
            
            if (data.address.country) {
                parts.push(data.address.country);
            }
        }
        
        return parts.length > 0 ? parts.join(', ') : data.display_name;
    }

    resetLocationButton(locationBtn) {
        locationBtn.disabled = false;
        locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
    }

    // Inline Photo Insertion Methods
    insertInlinePhoto(textareaId) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = false;
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const photoData = {
                        id: this.generateId(),
                        data: e.target.result,
                        name: file.name,
                        size: file.size
                    };
                    
                    // Add to current photos
                    this.currentPhotos.push(photoData);
                    
                    // Insert a clean markdown image reference at cursor position
                    const textarea = document.getElementById(textareaId);
                    const cursorPos = textarea.selectionStart;
                    const textBefore = textarea.value.substring(0, cursorPos);
                    const textAfter = textarea.value.substring(textarea.selectionEnd);
                    
                    // Use a short reference instead of full base64
                    const imageMarkdown = `![Photo: ${photoData.name}](photo:${photoData.id})\n`;
                    textarea.value = textBefore + imageMarkdown + textAfter;
                    
                    // Move cursor after the inserted image
                    const newCursorPos = cursorPos + imageMarkdown.length;
                    textarea.setSelectionRange(newCursorPos, newCursorPos);
                    textarea.focus();
                    
                    this.showNotification('Photo inserted inline!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
        
        fileInput.click();
    }

    // Batch Delete Methods
    showBatchDeleteModal() {
        const selectedCount = this.selectedEntries.length;
        if (selectedCount === 0) return;

        const modal = document.getElementById('batchDeleteModal');
        const countElement = document.getElementById('batchDeleteCount');
        
        if (countElement) {
            countElement.textContent = selectedCount;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideBatchDeleteModal() {
        const modal = document.getElementById('batchDeleteModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    confirmBatchDelete() {
        const selectedCount = this.selectedEntries.length;
        if (selectedCount === 0) return;

        // Move selected entries to trash
        const entriesToTrash = this.selectedEntries.map(entryId => {
            const entry = this.entries.find(e => e.id === entryId);
            return entry ? { ...entry, deletedAt: Date.now() } : null;
        }).filter(entry => entry !== null);

        // Add to trash
        const trash = JSON.parse(localStorage.getItem('journalTrash')) || [];
        trash.push(...entriesToTrash);
        localStorage.setItem('journalTrash', JSON.stringify(trash));

        // Remove from main entries
        this.entries = this.entries.filter(entry => !this.selectedEntries.includes(entry.id));
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));

        // Clear selection and refresh UI
        this.selectedEntries = [];
        this.hideBatchDeleteModal();
        this.loadEntries();
        this.updateStats();
        this.updateSelectionUI();

        // Show success notification
        this.showNotification(`Successfully moved ${selectedCount} entries to trash`, 'success');
    }

}

// Additional CSS for search results and charts
const additionalStyles = `
    .search-result-item {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: var(--transition);
    }

    .search-result-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--border-hover);
    }

    .search-result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .search-result-header h4 {
        color: var(--text-primary);
        font-weight: 600;
    }

    .search-result-date {
        color: var(--text-muted);
        font-size: 0.875rem;
    }

    .search-result-content {
        color: var(--text-secondary);
        margin-bottom: 1rem;
        line-height: 1.5;
    }

    .search-result-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .simple-bar-chart {
        display: flex;
        align-items: end;
        gap: 0.25rem;
        height: 200px;
        padding: 1rem 0;
    }

    .bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }

    .bar {
        width: 100%;
        background: linear-gradient(to top, var(--primary-color), var(--accent-color));
        border-radius: 2px 2px 0 0;
        min-height: 4px;
        transition: var(--transition);
    }

    .bar:hover {
        opacity: 0.8;
    }

    .bar-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 0.5rem;
    }

    .tag-cloud-item {
        display: inline-block;
        margin: 0.25rem 0.5rem;
        padding: 0.5rem 1rem;
        background-color: var(--primary-color);
        color: white;
        border-radius: var(--radius-lg);
        font-weight: 500;
        transition: var(--transition);
    }

    .tag-cloud-item:hover {
        transform: scale(1.05);
        background-color: var(--primary-hover);
    }

    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-muted);
    }

    .notification {
        animation: slideIn 0.3s ease-in-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;

// Add additional styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.journalApp = new JournalApp();
});

// Load draft when switching to new entry view
document.addEventListener('click', (e) => {
    if (e.target.closest('[data-view="new"]')) {
        setTimeout(() => {
            window.journalApp.loadDraft();
        }, 100);
    }
});

// Clear draft when saving entry
document.addEventListener('click', (e) => {
    if (e.target.id === 'saveEntryBtn') {
        localStorage.removeItem('journalDraft');
    }
});
