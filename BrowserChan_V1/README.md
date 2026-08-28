# Browserchan Imageboard (html Theme)

A zero-backend, fully browser-based imageboard platform styled after classic imageboards like Tinyboard. Everything runs completely in the client's browser using HTML5, CSS3, JavaScript, and `localStorage`.

---

## 🚀 Quick Setup & Installation

Since Browserchan operates entirely client-side, setup is instant and requires no database or server configuration (such as PHP, MySQL, or Node.js).

### Option 1: Local Setup (Quickest)
1. Extract the contents of the ZIP archive to a folder on your computer.
2. Double-click `index.html` to open the site directly in any web browser (Chrome, Firefox, Edge, Safari, etc.).

### Option 2: Hosting on Netlify (Free Web Hosting)
1. Log in to [Netlify](https://www.netlify.com/).
2. Drag and drop the extracted `imageboard_site` directory directly into the Netlify Sites deployment page.
3. Your site will be live instantly with automated SSL and custom domain options.

---

## 📖 How to Use

### 1. Security Check / Verification
- Upon first loading any page, you will be prompted with a math security check.
- Complete the verification to unlock posting and administration features across your browser session.

### 2. Custom Themes & Display Settings
Navigate to **Settings & Customization** (`settings.html`) to configure:
- **Built-in Themes**:
  - `Yotsuba B` (Default Light Blue)
  - `Yotsuba` (Classic Warm Yellow)
  - `Tomorrow` (Dark Mode)
  - `Cyberpunk` (Neon Dark)
- **Custom Fonts**: Choose between Trebuchet MS, Arial, Courier New, or Georgia.
- **Default Poster Name**: Custom fallback name (e.g., `Anonymous`).

### 3. Banner Management
1. Go to **Settings & Customization** (`settings.html`).
2. Upload image files (PNG, JPG, GIF).
3. Banners automatically rotate randomly on every page refresh across all pages.

### 4. Default Roles & Permissions
- **Owner / Admin**: Full permissions to create/delete boards, delete any post, manage site banners, and promote/demote other users.
- **Janitors**: Permissions to delete threads and posts.
- **Users**: Ability to view boards and create new threads/posts.

### 5. Managing Users & Roles
1. Go to **Dashboard** -> **Manage Users & Promote Janitors / Owner** (`users.html`).
2. Promote users to **Janitor** status for content moderation.
3. Transfer full ownership to a new user if you wish to step down.

---

## 💾 Data Persistence Note
All content (boards, posts, images, banners, theme settings, and user accounts) is saved in your browser's `localStorage`. Clearing browser data or using Incognito mode will reset the state back to default.
