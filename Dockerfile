# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
# Install deps first to leverage Docker cache
COPY package*.json ./
RUN npm ci
# Copy the rest and build
COPY . .
# If your build script is different, adjust accordingly
RUN npm run build

# ---------- run stage ----------
FROM nginx:stable-alpine
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx template that uses $PORT and does SPA fallback (added below)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Cloud Run sets $PORT (defaults to 8080). We’ll render the template with it.
ENV PORT=8080
EXPOSE 8080

# Render template -> final conf, then start nginx
CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

