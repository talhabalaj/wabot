FROM node:16

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apt update && apt install git ffmpeg python3 -y
RUN npm install -g pnpm
RUN pnpm i 
COPY . .

CMD ["pnpm","start"]
