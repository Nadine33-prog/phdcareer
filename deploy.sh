#!/bin/bash
set -e
echo "========================================"
echo " 学术之外 · 部署脚本"
echo "========================================"

# ── 1. 安装 MySQL ──
echo "[1/7] 安装 MySQL..."
if ! systemctl is-active --quiet mysql; then
  apt install -y mysql-server-8.0
  systemctl start mysql
  systemctl enable mysql
fi

# 创建数据库和用户
mysql -e "CREATE DATABASE IF NOT EXISTS phd_career CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '482023'; FLUSH PRIVILEGES;" 2>/dev/null
echo "  MySQL OK"

# ── 2. 安装 PM2 ──
echo "[2/7] 安装 PM2..."
npm install -g pm2 2>/dev/null
echo "  PM2 OK"

# ── 3. 部署代码 ──
echo "[3/7] 部署代码..."
cd /root
if [ -d "/root/server" ]; then rm -rf /root/server.bak; mv /root/server /root/server.bak 2>/dev/null; fi
if [ -d "/root/dist" ]; then rm -rf /root/dist.bak; mv /root/dist /root/dist.bak 2>/dev/null; fi
tar -xzf deploy.tar.gz
echo "  代码解压完成"

# ── 4. 安装后端依赖 ──
echo "[4/7] 安装后端依赖..."
cd /root/server
npm install --production
echo "  依赖安装完成"

# ── 5. 生成 Prisma Client ──
echo "[5/7] 生成 Prisma Client..."
npx prisma generate
echo "  Prisma OK"

# ── 6. 执行数据库迁移 ──
echo "[6/7] 执行数据库迁移..."
npx prisma migrate deploy
echo "  迁移完成"

# ── 7. 初始化种子数据 ──
echo "[7/7] 初始化数据..."
npx tsx prisma/seed.ts
echo "  种子数据完成"

# ── 配置环境变量 ──
cp .env.production .env

# ── 配置 Nginx ──
echo "[+] 配置 Nginx..."
apt install -y nginx 2>/dev/null
cat > /etc/nginx/sites-available/phd-career << 'NGINX'
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /root/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/phd-career /etc/nginx/sites-enabled/phd-career
systemctl restart nginx
echo "  Nginx OK"

# ── 启动后端 ──
echo "[+] 启动服务..."
pm2 delete all 2>/dev/null
cd /root/server
pm2 start "npx tsx src/index.ts" --name api --restart-delay=3000
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "========================================"
echo " 部署完成！"
echo " 访问: http://$(curl -s ifconfig.me 2>/dev/null || echo '121.41.98.33')"
echo " 管理员: admin / admin123"
echo "========================================"
