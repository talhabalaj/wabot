FROM node:16-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add git ffmpeg python3 cairo-dev pango-dev jpeg-dev make gcc g++ 
RUN npm install -g pnpm
RUN pnpm i 
COPY . .

CMD ["pnpm","start"]
