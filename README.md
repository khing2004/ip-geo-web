# 🎨 Frontend: React Application — `ip-geo-web`

A modern, interactive frontend designed to visualize geolocation data through an immersive map interface.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS v4 |
| Maps | React-Leaflet (OpenStreetMap) |
| HTTP Client | Axios |

---

## ⚙️ Installation

### 1. Navigate to the folder
```bash
cd ip-geo-web
```

### 2. Install packages
```bash
npm install
```

### 3. Environment setup

Create a `.env` file in the root of the project directory and add your IPInfo token:

```env
VITE_IPINFO_TOKEN=your_ipinfo_token_here
```

> You can get a free token at [ipinfo.io](https://ipinfo.io)

### 4. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 🌟 Key Features

**Automatic Detection**
Automatically fetches the public IP address and geolocation of the user upon login.

**Interactive Map**
Dynamic map that re-centers and drops a pin on a location upon search or when a history entry is selected.

**History Management**
Sidebar dashboard for viewing previous searches with support for bulk deletion.

**Professional UI**
Split-screen dashboard layout with a clean, responsive design built with Tailwind CSS.
