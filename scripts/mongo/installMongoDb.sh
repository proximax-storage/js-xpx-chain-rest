wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
apt-get update
apt-get install -y mongodb-org --allow-unauthenticated

cat ./scripts/mongo/mongodb.service > /etc/systemd/system/mongodb.service
systemctl daemon-reload
systemctl start mongodb
systemctl enable mongodb
bash -c "/bin/bash ./scripts/mongo/mongoPrepare/mongors.sh"
systemctl status mongodb