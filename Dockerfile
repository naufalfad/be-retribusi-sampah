# Pakai Node versi Slim (Ringan tapi support install Chrome)
FROM node:20-slim

# 1. Install Library Google Chrome (Wajib buat Puppeteer)
RUN apt-get update && apt-get install -y \
    wget gnupg \
    ca-certificates procps libxss1 \
    libgbm-dev libxshmfence-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Google Chrome Stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 3. Setting Environment Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# 4. Install Dependencies
COPY package*.json ./
RUN npm install

# 5. Copy Seluruh Codingan
COPY . .

# 6. Expose Port
EXPOSE 3000

# 7. Jalankan App
CMD ["node", "app.js"]
