# You need to install  yarnm npm and nodejs before. You can do this with installDependencies.sh
./yarn_setup.sh

(cd ./rest && yarn run rebuild)

docker build -trest -f ./scripts/RestDockerImage/Dockerfile .
