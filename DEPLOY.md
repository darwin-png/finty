# Finty — Instrucciones de Deploy en VPS

## Requisitos del servidor
- Ubuntu 22+ o Debian 12
- Docker + Docker Compose
- Nginx
- Certbot (SSL)
- Puertos 80 y 443 abiertos
- Dominio apuntando al VPS (registro A)

## Pasos de instalación

### 1. Instalar Docker
```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Descomprimir proyecto
```bash
unzip finty-deploy.zip -d /opt/finty
cd /opt/finty
```

### 3. Crear archivo de variables de entorno
```bash
cp .env.production.example .env.production
nano .env.production
```

Completar con estos valores:

```env
DATABASE_URL="postgresql://neondb_owner:npg_0l3VEFaRnsMI@ep-wandering-cloud-a4jwok03-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgresql://neondb_owner:npg_0l3VEFaRnsMI@ep-wandering-cloud-a4jwok03.us-east-1.aws.neon.tech/neondb?sslmode=require"

NEXTAUTH_SECRET="CAMBIAR-POR-STRING-RANDOM-DE-32-CARACTERES"
NEXTAUTH_URL="https://DOMINIO-AQUI.cl"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=correo@empresa.cl
SMTP_PASS=contraseña-de-app
SMTP_FROM="Finty <correo@empresa.cl>"
```

**IMPORTANTE:**
- Cambiar `NEXTAUTH_URL` por el dominio real (con https)
- Generar un `NEXTAUTH_SECRET` nuevo: `openssl rand -base64 32`
- Los datos de SMTP los proporciona el cliente

### 4. Construir y levantar
```bash
chmod +x deploy.sh
./deploy.sh
```

O manualmente:
```bash
docker compose build
docker compose up -d
```

### 5. Verificar que corre
```bash
curl http://localhost:3000/login
# Debe devolver HTML
```

### 6. Configurar Nginx

Crear archivo `/etc/nginx/sites-available/finty`:

```nginx
server {
    listen 80;
    server_name DOMINIO-AQUI.cl;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/finty /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d DOMINIO-AQUI.cl
```

### 8. Verificar
Abrir `https://DOMINIO-AQUI.cl` en el navegador. Debe mostrar el login de Finty.

---

## Comandos útiles

```bash
# Ver logs
docker compose logs -f finty

# Reiniciar
docker compose restart

# Rebuild después de cambios
docker compose build && docker compose up -d

# Ver estado
docker compose ps
```

## Stack
- Next.js 16 (Node 20)
- PostgreSQL (Neon - cloud, ya configurado)
- Puerto interno: 3000
