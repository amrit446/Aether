# AETHER | Enterprise Inventory & Order Management System

Aether is a full-stack enterprise inventory and order management platform designed to manage products, customers, sales orders, and inventory transactions in real time. The application combines a modern React frontend with a robust Flask REST API and PostgreSQL database.

## Features

### Inventory Management

* Create, update, and delete products
* SKU-based inventory tracking
* Real-time stock monitoring
* Low-stock alerts on dashboard

### Customer Management

* Customer profile creation and management
* Email uniqueness validation
* Customer order history tracking

### Order Management

* Multi-item order creation
* Automatic inventory deduction
* Transaction-safe order processing
* Order history and receipt management

### Dashboard Analytics

* Product statistics
* Customer statistics
* Order metrics
* Low-stock inventory alerts

### User Experience

* Modern Dark Mode Glassmorphism UI
* Responsive design
* Real-time notifications
* Dynamic order creation wizard
* Success animations with Canvas Confetti

---

## Technology Stack

### Backend

* Python 3.12
* Flask
* Flask-SQLAlchemy
* Flask-Migrate
* Marshmallow
* PostgreSQL

### Frontend

* React 18
* Vite
* React Router
* Axios
* Material UI (MUI)

### DevOps

* Docker
* Docker Compose
* Nginx

---

## Architecture

Frontend (React)
↓
REST API (Flask)
↓
PostgreSQL Database

---

## Environment Variables

### Backend (.env)

```env
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=your-secret-key

DATABASE_URL=postgresql://username:password@host/database

DATABASE_URL=<postgresql-database-url>

ALLOWED_ORIGINS=https://incredible-marzipan-734f77.netlify.app
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

## Local Setup

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

python run.py
```

Backend will be available at:

```text
http://localhost:5000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

## Docker Setup

Build and run the complete application:

```bash
docker-compose up --build
```

Services:

| Service    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:5000 |
| PostgreSQL | localhost:5432        |

---

## API Endpoints

### Products

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /products      |
| GET    | /products/<id> |
| POST   | /products      |
| PUT    | /products/<id> |
| DELETE | /products/<id> |

### Customers

| Method | Endpoint        |
| ------ | --------------- |
| GET    | /customers      |
| GET    | /customers/<id> |
| POST   | /customers      |
| DELETE | /customers/<id> |

### Orders

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /orders      |
| GET    | /orders/<id> |
| POST   | /orders      |
| DELETE | /orders/<id> |

### Dashboard

| Method | Endpoint   |
| ------ | ---------- |
| GET    | /dashboard |

---


---


## Deployment

### Backend

* Render


### Frontend

* Netlify

---


## Author

Amrit Bharti

Full Stack Developer

Tech Stack:
Python • Flask • React • PostgreSQL • Docker 
