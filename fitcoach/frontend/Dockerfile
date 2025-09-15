# build stage
ARG TARGETPLATFORM
ARG TARGETARCH
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --no-audit --prefer-offline
COPY . .
RUN npm run build

# nginx serve
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
