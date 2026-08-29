// ============================================================
// BrowserChan Imageboard Engine
// Roles + First User Admin + Themes + Banners + GIF/WEBP/WEBM
// Video Support (No Audio Support)
// ============================================================

const Imageboard = {

    // ========================================================
    // ALLOWED FILE TYPES
    // ========================================================

    ALLOWED_IMAGE_TYPES: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ],

    ALLOWED_VIDEO_TYPES: [
        "video/webm",
        "video/mp4",
        "video/ogg",
        "video/quicktime" // .mov
    ],

    MAX_UPLOAD_SIZE: 25 * 1024 * 1024, // 25MB

    // ========================================================
    // FIRST USER ADMIN SYSTEM
    // ========================================================

    initializeFirstUser(username = "Admin") {
        let users = JSON.parse(localStorage.getItem("ib_users") || "[]");

        if (users.length === 0) {

            const firstUser = {
                username,
                role: "admin"
            };

            users.push(firstUser);

            localStorage.setItem("ib_users", JSON.stringify(users));
            localStorage.setItem(
                "ib_current_user",
                JSON.stringify(firstUser)
            );

            return firstUser;
        }

        return null;
    },

    registerUser(username) {

        if (!username || username.trim() === "") return false;

        let users = this.getUsers();

        if (
            users.some(
                u => u.username.toLowerCase() === username.toLowerCase()
            )
        ) {
            return false;
        }

        const role = users.length === 0 ? "admin" : "user";

        const newUser = {
            username: username.trim(),
            role
        };

        users.push(newUser);

        this.saveUsers(users);
        this.setCurrentUser(newUser.username, newUser.role);

        return newUser;
    },

    isAdmin() {
        return this.getCurrentUser().role === "admin";
    },

    // ========================================================
    // CURRENT USER
    // ========================================================

    getCurrentUser() {

        let current = localStorage.getItem("ib_current_user");

        if (!current) {
            this.initializeFirstUser();
            current = localStorage.getItem("ib_current_user");
        }

        return JSON.parse(
            current ||
            '{"username":"Admin","role":"admin"}'
        );
    },

    setCurrentUser(username, role) {
        localStorage.setItem(
            "ib_current_user",
            JSON.stringify({ username, role })
        );
    },

    // ========================================================
    // USERS
    // ========================================================

    getUsers() {

        let users = JSON.parse(localStorage.getItem("ib_users") || "[]");

        if (users.length === 0) {
            this.initializeFirstUser();
            users = JSON.parse(localStorage.getItem("ib_users") || "[]");
        }

        return users;
    },

    saveUsers(users) {
        localStorage.setItem("ib_users", JSON.stringify(users));
    },

    promoteUser(username, newRole) {

        let users = this.getUsers();

        let target = users.find(
            u => u.username === username
        );

        if (target) {
            target.role = newRole;
        } else {

            users.push({
                username,
                role: newRole
            });

        }

        this.saveUsers(users);
    },

    transferOwnership(newOwnerUsername) {

        let users = this.getUsers();

        users.forEach(user => {

            if (user.role === "admin") {
                user.role = "user";
            }

            if (user.username === newOwnerUsername) {
                user.role = "admin";
            }

        });

        this.saveUsers(users);
        this.setCurrentUser(newOwnerUsername, "admin");
    },

    // ========================================================
    // BOARDS
    // ========================================================

    getBoards() {
        return JSON.parse(
            localStorage.getItem("ib_boards") || "[]"
        );
    },

    saveBoards(boards) {
        localStorage.setItem(
            "ib_boards",
            JSON.stringify(boards)
        );
    },

    createBoard(title, uri, description) {

        const boards = this.getBoards();

        const cleanUri = uri
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        if (boards.some(b => b.uri === cleanUri)) {
            return false;
        }

        boards.push({
            title,
            uri: cleanUri,
            description
        });

        this.saveBoards(boards);

        return true;
    },

    deleteBoard(uri) {

        let boards = this.getBoards();

        boards = boards.filter(
            board => board.uri !== uri
        );

        this.saveBoards(boards);

        localStorage.removeItem("ib_threads_" + uri);
    },

    // ========================================================
    // THREADS
    // ========================================================

    getThreads(boardUri) {
        return JSON.parse(
            localStorage.getItem("ib_threads_" + boardUri) || "[]"
        );
    },

    saveThreads(boardUri, threads) {
        localStorage.setItem(
            "ib_threads_" + boardUri,
            JSON.stringify(threads)
        );
    },

    createThread(boardUri, data) {

        const threads = this.getThreads(boardUri);

        const settings = this.getSettings();

        const defaultName =
            settings.defaultPosterName || "Anonymous";

        const newThread = {

            id: Date.now(),

            date: new Date().toLocaleString(),

            name: data.name || defaultName,

            email: data.email || "",

            subject: data.subject || "Untitled",

            comment: data.comment || "",

            // MEDIA SUPPORT
            media: data.media || null,

            mediaType: data.mediaType || null,

            fileName: data.fileName || "",

            mimeType: data.mimeType || ""

        };

        threads.unshift(newThread);

        this.saveThreads(boardUri, threads);

        return newThread;
    },

    deleteThread(boardUri, threadId) {

        let threads = this.getThreads(boardUri);

        threads = threads.filter(
            thread => thread.id !== threadId
        );

        this.saveThreads(boardUri, threads);
    },

    // ========================================================
    // FILE VALIDATION
    // ========================================================

    validateFile(file) {

        if (!file) {
            return {
                success: true
            };
        }

        if (file.size > this.MAX_UPLOAD_SIZE) {
            return {
                success: false,
                message: "File exceeds 25MB limit."
            };
        }

        const type = file.type;

        if (
            this.ALLOWED_IMAGE_TYPES.includes(type)
        ) {

            return {
                success: true,
                mediaType: "image"
            };

        }

        if (
            this.ALLOWED_VIDEO_TYPES.includes(type)
        ) {

            return {
                success: true,
                mediaType: "video"
            };

        }

        // Reject audio and everything else
        if (type.startsWith("audio/")) {

            return {
                success: false,
                message: "Audio files are not allowed."
            };

        }

        return {
            success: false,
            message: "Unsupported file type."
        };

    },

    // ========================================================
    // CONVERT FILE TO DATA URL
    // ========================================================

    processMediaFile(file) {

        return new Promise((resolve, reject) => {

            const validation = this.validateFile(file);

            if (!validation.success) {
                reject(validation.message);
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {

                resolve({
                    media: reader.result,
                    mediaType: validation.mediaType,
                    fileName: file.name,
                    mimeType: file.type
                });

            };

            reader.onerror = () => reject("Failed to read file.");

            reader.readAsDataURL(file);

        });

    },

    // ========================================================
    // BANNERS
    // ========================================================

    getBanners() {
        return JSON.parse(
            localStorage.getItem("ib_banners") || "[]"
        );
    },

    addBanner(dataUrl) {

        const banners = this.getBanners();

        banners.push(dataUrl);

        localStorage.setItem(
            "ib_banners",
            JSON.stringify(banners)
        );
    },

    clearBanners() {
        localStorage.removeItem("ib_banners");
    },

    // ========================================================
    // POSTS
    // ========================================================

    getAllPosts() {

        const boards = this.getBoards();

        let posts = [];

        boards.forEach(board => {

            this.getThreads(board.uri).forEach(thread => {

                posts.push({
                    ...thread,
                    boardUri: board.uri
                });

            });

        });

        return posts;
    },

    // ========================================================
    // SETTINGS
    // ========================================================

    getSettings() {

        return JSON.parse(
            localStorage.getItem("ib_settings") ||
            JSON.stringify({
                theme: "theme-yotsuba-b",
                defaultPosterName: "Anonymous",
                fontFamily: "Trebuchet MS"
            })
        );

    },

    saveSettings(settings) {

        localStorage.setItem(
            "ib_settings",
            JSON.stringify(settings)
        );

        this.applySettings();
    },

    applySettings() {

        const settings = this.getSettings();

        document.body.className =
            settings.theme || "theme-yotsuba-b";

        document.documentElement.style.setProperty(
            "--font-family",
            settings.fontFamily || "Trebuchet MS"
        );

    }

};

// ============================================================
// RANDOM BANNER
// ============================================================

function renderBanner() {

    const bannerBox =
        document.getElementById("bannerBox");

    if (!bannerBox) return;

    const banners = Imageboard.getBanners();

    if (banners.length > 0) {

        const random =
            banners[Math.floor(Math.random() * banners.length)];

        bannerBox.innerHTML =
            `<img src="${random}" alt="Banner">`;

    } else {

        bannerBox.innerHTML = `
            <div style="text-align:center;color:#555">
                <strong>Default Banner</strong><br>
                <span style="color:#44cc11;font-size:20px;font-weight:bold">
                    browserchan 1.0
                </span>
            </div>
        `;

    }

}

// ============================================================
// STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    Imageboard.initializeFirstUser();

    Imageboard.applySettings();

    renderBanner();

});
