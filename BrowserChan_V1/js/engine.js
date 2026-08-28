// Engine with Roles, Banners, Themes, and Customizable Options

const Imageboard = {
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('ib_current_user') || '{"username": "Admin", "role": "owner"}');
    },
    setCurrentUser(username, role) {
        localStorage.setItem('ib_current_user', JSON.stringify({ username, role }));
    },
    getUsers() {
        return JSON.parse(localStorage.getItem('ib_users') || '[{"username":"Admin","role":"owner"}]');
    },
    saveUsers(users) {
        localStorage.setItem('ib_users', JSON.stringify(users));
    },
    promoteUser(username, newRole) {
        let users = this.getUsers();
        let target = users.find(u => u.username === username);
        if (target) {
            target.role = newRole;
        } else {
            users.push({ username, role: newRole });
        }
        this.saveUsers(users);
    },
    transferOwnership(newOwnerUsername) {
        let users = this.getUsers();
        users.forEach(u => {
            if (u.role === 'owner') u.role = 'janitor';
            if (u.username === newOwnerUsername) u.role = 'owner';
        });
        this.saveUsers(users);
        this.setCurrentUser(newOwnerUsername, 'owner');
    },
    getBoards() {
        return JSON.parse(localStorage.getItem('ib_boards') || '[]');
    },
    saveBoards(boards) {
        localStorage.setItem('ib_boards', JSON.stringify(boards));
    },
    getThreads(boardUri) {
        return JSON.parse(localStorage.getItem('ib_threads_' + boardUri) || '[]');
    },
    saveThreads(boardUri, threads) {
        localStorage.setItem('ib_threads_' + boardUri, JSON.stringify(threads));
    },
    createBoard(title, uri, description) {
        const boards = this.getBoards();
        const cleanUri = uri.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (boards.some(b => b.uri === cleanUri)) return false;
        boards.push({ title, uri: cleanUri, description });
        this.saveBoards(boards);
        return true;
    },
    deleteBoard(uri) {
        let boards = this.getBoards();
        boards = boards.filter(b => b.uri !== uri);
        this.saveBoards(boards);
        localStorage.removeItem('ib_threads_' + uri);
    },
    createThread(boardUri, { name, email, subject, comment, image }) {
        const threads = this.getThreads(boardUri);
        const settings = this.getSettings();
        const defaultName = settings.defaultPosterName || 'Anonymous';
        const newThread = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            name: name || defaultName,
            email: email || '',
            subject: subject || 'Untitled',
            comment,
            image: image || null
        };
        threads.unshift(newThread);
        this.saveThreads(boardUri, threads);
        return newThread;
    },
    deleteThread(boardUri, threadId) {
        let threads = this.getThreads(boardUri);
        threads = threads.filter(t => t.id !== threadId);
        this.saveThreads(boardUri, threads);
    },
    getBanners() {
        return JSON.parse(localStorage.getItem('ib_banners') || '[]');
    },
    addBanner(dataUrl) {
        const banners = this.getBanners();
        banners.push(dataUrl);
        localStorage.setItem('ib_banners', JSON.stringify(banners));
    },
    clearBanners() {
        localStorage.removeItem('ib_banners');
    },
    getAllPosts() {
        const boards = this.getBoards();
        let allPosts = [];
        boards.forEach(b => {
            const threads = this.getThreads(b.uri);
            threads.forEach(t => allPosts.push({ ...t, boardUri: b.uri }));
        });
        return allPosts;
    },
    getSettings() {
        return JSON.parse(localStorage.getItem('ib_settings') || '{"theme": "theme-yotsuba-b", "defaultPosterName": "Anonymous", "fontFamily": "Trebuchet MS"}');
    },
    saveSettings(settings) {
        localStorage.setItem('ib_settings', JSON.stringify(settings));
        this.applySettings();
    },
    applySettings() {
        const settings = this.getSettings();
        document.body.className = settings.theme || 'theme-yotsuba-b';
        if (settings.fontFamily) {
            document.documentElement.style.setProperty('--font-family', settings.fontFamily);
        }
    }
};

function renderBanner() {
    const bannerBox = document.getElementById('bannerBox');
    if (!bannerBox) return;
    const banners = Imageboard.getBanners();
    if (banners.length > 0) {
        const randomIndex = Math.floor(Math.random() * banners.length);
        bannerBox.innerHTML = `<img src="${banners[randomIndex]}" alt="Random Banner">`;
    } else {
        bannerBox.innerHTML = `
            <div style="text-align:center; color:#555;">
                <strong>Default Banner</strong><br>
                <span style="color:#44cc11; font-size:20px; font-weight:bold;">browserchan 1.0</span>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Imageboard.applySettings();
});
