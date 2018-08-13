apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
apt-get update
apt-get install -y mongodb-org --allow-unauthenticated

cat ./scripts/mongo/mongodb.service > /etc/systemd/system/mongodb.service
systemctl daemon-reload
systemctl start mongodb
systemctl enable mongodb
bash -c "/bin/bash ./scripts/mongo/mongoPrepare/mongors.sh"
systemctl status mongodb