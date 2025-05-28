#!/bin/sh
sed -i "s|http://localhost:5000|http://server:5000|g" /var/www/dist/assets/*.js
exec nginx -g "daemon off;"
