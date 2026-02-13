document.addEventListener('DOMContentLoaded', () => {
    const listView = document.getElementById('list-view');
    const addView = document.getElementById('add-view');
    const promptsContainer = document.getElementById('prompts-container');
    const categoryList = document.getElementById('category-list');
    
    // Inputs
    const categoryInput = document.getElementById('category-input');
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');

    // Load prompts on start
    loadPrompts();

    // Toggle Views
    document.getElementById('show-add-view-btn').addEventListener('click', () => {
        listView.classList.add('hidden');
        addView.classList.remove('hidden');
        document.getElementById('show-add-view-btn').classList.add('hidden');
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetForm();
    });

    // Save Logic
    document.getElementById('save-btn').addEventListener('click', () => {
        const category = categoryInput.value.trim() || "Uncategorized";
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert("Title and Content are required!");
            return;
        }

        savePrompt(category, title, content);
    });

    function savePrompt(category, title, content) {
        chrome.storage.local.get(['prompts'], (result) => {
            const prompts = result.prompts || {};
            
            if (!prompts[category]) {
                prompts[category] = [];
            }

            prompts[category].push({
                id: Date.now(),
                title: title,
                content: content
            });

            chrome.storage.local.set({ prompts }, () => {
                resetForm();
                loadPrompts();
            });
        });
    }

    function resetForm() {
        categoryInput.value = '';
        titleInput.value = '';
        contentInput.value = '';
        addView.classList.add('hidden');
        listView.classList.remove('hidden');
        document.getElementById('show-add-view-btn').classList.remove('hidden');
    }

    function loadPrompts() {
        chrome.storage.local.get(['prompts'], (result) => {
            const prompts = result.prompts || {};
            promptsContainer.innerHTML = '';
            categoryList.innerHTML = ''; // Reset datalist

            const categories = Object.keys(prompts).sort();

            if (categories.length === 0) {
                promptsContainer.innerHTML = '<p class="empty-state">No prompts saved yet.</p>';
                return;
            }

            categories.forEach(cat => {
                // Add to datalist for autocomplete
                const option = document.createElement('option');
                option.value = cat;
                categoryList.appendChild(option);

                // Create UI Section
                const section = document.createElement('div');
                section.className = 'category-block';
                
                const heading = document.createElement('div');
                heading.className = 'category-title';
                heading.textContent = cat;
                section.appendChild(heading);

                prompts[cat].forEach((p, index) => {
                    const item = document.createElement('div');
                    item.className = 'prompt-item';
                    item.innerHTML = `
                        <div class="prompt-info">
                            <strong>${p.title}</strong>
                            <span>${p.content}</span>
                        </div>
                        <div class="actions">
                            <button class="action-btn paste-btn" data-cat="${cat}" data-idx="${index}">📋 Paste</button>
                            <button class="action-btn run-btn" data-cat="${cat}" data-idx="${index}">🚀 Run</button>
                            <button class="action-btn delete-btn" data-cat="${cat}" data-idx="${index}">✖</button>
                        </div>
                    `;
                    section.appendChild(item);
                });

                promptsContainer.appendChild(section);
            });

            // Add Event Listeners for buttons
            document.querySelectorAll('.paste-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleAction(e, 'paste'));
            });
            document.querySelectorAll('.run-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleAction(e, 'run'));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDelete);
            });
        });
    }

    function handleAction(e, type) {
        const cat = e.target.getAttribute('data-cat');
        const idx = e.target.getAttribute('data-idx');
        
        chrome.storage.local.get(['prompts'], (result) => {
            const text = result.prompts[cat][idx].content;
            
            // Send message to active tab
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs.length === 0) return;
                
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "insertText",
                    text: text,
                    autoSubmit: type === 'run'
                });
            });
        });
    }

    function handleDelete(e) {
        if(!confirm("Delete this prompt?")) return;
        const cat = e.target.getAttribute('data-cat');
        const idx = parseInt(e.target.getAttribute('data-idx'));

        chrome.storage.local.get(['prompts'], (result) => {
            const prompts = result.prompts;
            prompts[cat].splice(idx, 1);
            
            if (prompts[cat].length === 0) delete prompts[cat]; // Remove empty category

            chrome.storage.local.set({ prompts }, loadPrompts);
        });
    }
});