FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/default.conf
COPY build/ /user/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]