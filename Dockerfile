FROM nginx:alpine

COPY build/ /user/share/nginx/html
COPY nginx.conf /etc/nginx/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]