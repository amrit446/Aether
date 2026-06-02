# Stage 1: Build Dependencies
FROM python:3.12-slim as builder

WORKDIR /app

# Install system compilation packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install python dependencies to user directory for easy copying
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production Runtime
FROM python:3.12-slim as runner

WORKDIR /app

# Install libpq for PostgreSQL connectivity
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python dependencies and app files
COPY --from=builder /root/.local /root/.local
COPY . .

# Set up paths and environments
ENV PATH=/root/.local/bin:$PATH
ENV FLASK_ENV=production
ENV FLASK_APP=run.py
ENV PORT=5000

EXPOSE 5000

# Start server using Gunicorn WSGI
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "run:app"]
