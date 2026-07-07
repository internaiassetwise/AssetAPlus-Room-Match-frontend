# 🏠 Room Match — Frontend

React 18 + Vite + Tailwind CSS 3 SPA for the Asset A Plus rental matching platform.

- **Theme** — Asset Plus navy + ember, chunky bold borders, playful sparkles
- **Stack** — React 18, Vite 5, Tailwind 3, react-router-dom 6
- **Admin** — Login + rooms CRUD behind session cookie auth
- **Deploy** — Netlify (see `netlify.toml`)

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Set the API base (only needed for production builds; in dev Vite proxies /api)
cp .env.example .env
# edit .env → VITE_API_BASE=https://your-api.example.com

# 3. Run dev server (http://localhost:5173)
npm run dev

# 4. Production build
npm run build          # → dist/
npm run preview        # serve dist/ locally
```

The dev server proxies `/api/*` to `http://localhost:4000` (configured in `vite.config.js`).
Run the API repo (`assetaplus-room-match-backend`) on port 4000 in another terminal.

---

## 📁 Project Structure

```
.
├── public/                # favicon, robots.txt
├── src/
│   ├── components/        # 13 sections + Modal/ConfirmDialog + ErrorBoundary
│   ├── components/admin/  # AdminLogin, AdminLayout, AdminRoomsList, AdminRoomForm
│   ├── contexts/          # AuthContext (admin session)
│   ├── hooks/useApi.js
│   ├── api/client.js      # fetch wrapper w/ timeout + retry
│   ├── App.jsx            # router (public + /admin)
│   └── main.jsx
├── index.html
├── vite.config.js         # /api proxy → localhost:4000
├── tailwind.config.js
├── postcss.config.js
└── netlify.toml           # Netlify deploy config
```

---

## 🎨 Theme (Asset Plus brand)

| Token            | Color     | Used for                                |
|------------------|-----------|-----------------------------------------|
| `navy-600`       | `#1E3A8A` | Primary brand, headlines, borders       |
| `navy-700`       | `#172E70` | Hover state                             |
| `ember-500`      | `#F97316` | CTAs, accents, badges                   |
| `ember-600`      | `#EA580C` | Hover state                             |
| `cream-100`      | `#FEF3C7` | Page background (with stripes)          |
| `white`          | `#FFFFFF` | Cards, surfaces                         |

Tailwind's `shadow-pop*` utilities give the chunky offset-shadow look from the brief.

---

## 🔐 Admin Panel

Visit `/admin/login` and sign in. Admin auth is currently local username/password;
a future update will replace it with Azure AD SSO.

Public read endpoints stay anonymous; only `/admin/*` requires the `admin_session`
cookie. The server creates one `admins` row from `ADMIN_USERNAME` / `ADMIN_PASSWORD`
on first boot.

---

## 🚢 Deploy (Netlify)

The repo ships with `netlify.toml`. Connect the repo in Netlify:

1. New site → Import from Git → pick this repo.
2. Netlify auto-detects the build command from `netlify.toml`. Confirm:
   - Base: *(leave empty — repo root is the project root)*
   - Build command: `npm run build`
   - Publish: `dist`
3. Add env var `VITE_API_BASE` → your API's public URL.
4. Deploy.

---

## 📞 Contact

- ☎️ **02-168-0000**
- 💬 **LINE @assetaplus**

Built for Asset Wise — let us take care of your room. 🏠