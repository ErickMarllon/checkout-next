CONFIGURAÇÕES PARA FUNCIONAR

AS IMAGENS DEVE FICAR DENTRO DA PASTA:
/var/www/assets/site-x/images/
/var/www/assets/site-y/images/

---

OS PRODUTOS DEVEM FICAR DENTRO DA PASTA:
/var/www/config/checkout/products/site-x/config.json
/var/www/config/checkout/products/site-y/config.json

---

OS PIXELS DEVEM FICAR DENTRO DA PASTA:
/var/www/config/checkout/pixels/site-x/config.json
/var/www/config/checkout/pixels/site-y/config.json

---

OS FOOTERS DEVEM FICAR DENTRO DA PASTA:
/var/www/config/checkout/footer/site-x.com.json
/var/www/config/checkout/footer/site-y.com.json

---

ADICIONAR CONFIG NO NGINX
server {
listen 80;
server_name site-x.com site-y.com;

    # =========================
    # IMAGENS MULTI-TENANT
    # =========================
    location /images/ {
        alias /var/www/assets/$host/images/;
        autoindex off;

        # performance
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # =========================
    # NEXT.JS APP
    # =========================
    location / {
        proxy_pass http://localhost:3001;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # websocket support (Next.js)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

}

chmod -R 755 /var/www/assets
chmod -R 755 /var/www/config

sudo nginx -t
sudo systemctl reload nginx
