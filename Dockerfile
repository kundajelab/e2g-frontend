FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf

COPY .htpasswd /etc/apache2/.htpasswd

COPY apps/platform/bundle-platform /usr/share/nginx/html

COPY ./ssl /etc/nginx/ssl