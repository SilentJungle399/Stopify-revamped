#!/bin/ash
git clone https://github.com/SilentJungle399/Stopify-revamped /home/container/stopify
cd /home/container/stopify

npm install
pip install -r requirements.txt
npm run build

npm install -g pm2
pm2 start pm2.config.js

echo "Server Started"