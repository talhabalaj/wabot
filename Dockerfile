FROM node:16-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add git
RUN npm isntall -g pnpm
RUN pnpm i 
COPY . .

CMD ["pnpm","start"]
