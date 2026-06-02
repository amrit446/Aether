# AETHER | Enterprise Inventory & Order Management System

Aether is a production-ready, full-stack monorepo application designed to manage catalog products, customer profiles, atomic transactional sales orders, and real-time inventory adjustments. It features a premium, modern **Dark Mode Glassmorphic interface** using React and Material UI, combined with a highly robust Python/Flask REST API backed by PostgreSQL.

---

## 🏛️ System Architecture

The following diagram illustrates Aether's monorepo structure, network topography, and transactional flow:

```mermaid
graph TD
    subgraph Client ["🖥️ Frontend Client (React / Vite)"]
        UI["🎨 Responsive MUI Layout"]
        AC["🔌 Centralized Axios Client"]
        NC["🔔 Notification Provider"]
        UI --> AC
        NC -.-> UI
    end

    subgraph Server ["🐍 Backend API (Flask / Gunicorn)"]
        App["🧪 Flask App Factory"]
        Routes["🛣️ Blueprints (API Routes)"]
        Service["⚙️ Transactional Order Service"]
        Schema["📝 Marshmallow Validation"]
        Model["🗄️ SQLAlchemy DB Models"]
        
        App --> Routes
        Routes --> Schema
        Routes --> Service
        Service --> Model
    end

    subgraph Data ["🗃️ Database Layer"]
        DB[("🐘 Hosted PostgreSQL")]
    end

    AC -- "HTTPS Requests (Port 80/5000)" --> Routes
    Model -- "SQLAlchemy ORM Connection" --> DB
```

---

## ✨ Design & Premium Features

1. **Dark Mode Glassmorphism**: Tailored deep navy backgrounds (`#0B0F19`), translucent sidebar drawer grids (`#131924` with `backdrop-filter`), neon blue interactive hover glow styles, and Outfit header typography.
2. **Order Placement Wizard**: Build sales invoices by choosing customer accounts, dynamically adding multiple product lines, viewing real-time subtotals, validating stock levels before submission, and celebrating transactions with canvas-confetti!
3. **Transaction Safety**: Uses PostgreSQL row-locking (`with_for_update`) to prevent concurrent race conditions on product sales. If stock is insufficient for *any* item, the whole database transaction rolls back automatically.
4. **Resilience & CORS Policies**: Integrates globally configured JSON error handlers (400, 404, 409, 500) and allowed origin settings to manage cross-origin web access.

---

## 🛠️ Tech Stack

* **Backend**: Python 3.12, Flask, Flask-SQLAlchemy (ORM), Flask-Migrate, flask-marshmallow (validation)
* **Frontend**: React 18, Vite, React Router, Axios, Material UI (MUI 5), Canvas-Confetti
* **Database**: PostgreSQL (Production) / SQLite (Test)
* **Containerization**: Docker, Docker Compose, Nginx
* **Deployments**: Render (Backend / Postgres), Vercel (Frontend)

---

## ⚙️ Environment Configurations

### Backend Settings (`backend/.env`)
Create a `.env` file under `backend/` with the following variables:
```ini
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=super-secret-system-key-change-in-production

# Using external PostgreSQL URL for local execution
DATABASE_URL=postgresql://inventatory_user:G475cpEaYb3vbERN1fTqanx234Kj3trB@dpg-d8f9agt53gjs739s27tg-a.oregon-postgres.render.com/inventatory

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend Settings (`frontend/.env`)
Create a `.env` file under `frontend/` containing:
```ini
VITE_API_URL=http://localhost:5000
```

---

## 🐳 Running with Docker Compose

Running Aether via Docker Compose spins up three containers: `aether_postgres`, `aether_backend`, and `aether_frontend` (serving static React code via a reverse-proxy SPA Nginx server).

### Start Command:
Run this command from the monorepo root:
```bash
docker-compose up --build
```

* **Frontend Client**: Accessible at [http://localhost:80](http://localhost:80)
* **Backend API**: Running at [http://localhost:5000](http://localhost:5000)
* **Postgres Instance**: Binding on local port `5432`

---

## 💻 Local Developer Installation

If you prefer to run the application components individually outside of Docker:

### 1. Backend Server Setup
Ensure Python 3.12 is installed, then execute:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
*The database tables will auto-initialize inside the database linked in your `.env`.*

### 2. Frontend React Client Setup
Ensure Node.js v20+ is installed:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development client will start at [http://localhost:3000](http://localhost:3000).*

---

## 🧪 Testing and Verification

Pytest is used to run unit tests against model constraints, schema validations, and transactional integrity:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python -m pytest
```
*Tests are executed against a safe, isolated in-memory SQLite instance.*

---

## 📖 API Documentation

All request payloads and responses use standard JSON formatting.

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/dashboard` | Returns system KPIs and low-stock product arrays | `200`, `500` |
| **POST** | `/products` | Creates a new product catalog item (requires unique SKU) | `201`, `400`, `409` |
| **GET** | `/products` | Lists all products sorted by newest first | `200` |
| **GET** | `/products/<id>`| Retrieves specific product details | `200`, `404` |
| **PUT** | `/products/<id>`| Modifies an existing product (SKUs are immutable) | `200`, `400`, `404` |
| **DELETE**| `/products/<id>`| Removes a product (fails if sold in historical orders) | `200`, `409`, `404` |
| **POST** | `/customers` | Registers a new customer profile (requires unique email) | `201`, `400`, `409` |
| **GET** | `/customers` | Lists all active customer directory cards | `200` |
| **GET** | `/customers/<id>`| Retrieves contact details for a customer | `200`, `404` |
| **DELETE**| `/customers/<id>`| Removes customer profile (cascades and deletes invoices) | `200`, `404` |
| **POST** | `/orders` | Places a new order (checks stock, decrements inventory) | `201`, `400` |
| **GET** | `/orders` | Retrieves history logs of all invoice transactions | `200` |
| **GET** | `/orders/<id>` | Retrieves specific invoice receipt items | `200`, `404` |
| **DELETE**| `/orders/<id>` | Deletes an order history receipt | `200`, `404` |

---

## 🚀 Cloud Deployment Guide

Aether is pre-configured to build on Render (backend services) and Vercel (frontend static apps).

### 1. Render Deployment (Backend & Database)
1. Commit the monorepo to GitHub.
2. Sign in to Render and create a **Managed PostgreSQL Database** named `aether-db`.
3. Create a new **Web Service** targeting your monorepo.
4. Apply these configuration values in the Render Dashboard:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --chdir backend run:app`
5. Inject the environment variables:
   - `DATABASE_URL`: *(Automatically linked from your Render Database)*
   - `SECRET_KEY`: *(Generate a secure string)*
   - `FLASK_ENV`: `production`
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app`

### 2. Vercel Deployment (Frontend React App)
1. Sign in to Vercel and import your monorepo repository.
2. Configure these parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add the Environmental Variable:
   - `VITE_API_URL`: `https://aether-backend.onrender.com` *(Use your deployed Render service URL)*
4. Click **Deploy**. Vercel will process the build and serve it globally with auto-configured rewrites.

---

## 📦 Docker Hub Publishing

To build, tag, and publish the container images to Docker Hub for remote server pull deployments:

```bash
# 1. Login to Docker Hub
docker login

# 2. Build and Tag Backend Container
docker build -t <your-username>/aether-backend:latest ./backend
docker push <your-username>/aether-backend:latest

# 3. Build and Tag Frontend Container
docker build --build-arg VITE_API_URL=https://your-api-domain.com -t <your-username>/aether-frontend:latest ./frontend
docker push <your-username>/aether-frontend:latest
```

---

## 📸 Interface Preview

Aether's dark theme interface provides clear data access control across three main states:

* **Control Center**: Displays KPIs and glowing alert banners for products that are out of stock.
* **Order Creation Wizard**: A structured menu where users can select customers, dynamically add products, view live billing items, check stock levels, and place orders.
* **Product Catalog & Customer Directory**: Responsive datatables displaying inventory listings and customer records with easy edit/delete buttons.
