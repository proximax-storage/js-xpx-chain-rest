# install dependencies
apt-get update && apt-get install curl -y

# Install npm and node js
curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install -y nodejs

# Install yarn
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update && apt-get install yarn
