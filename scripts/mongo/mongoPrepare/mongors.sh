sleep 1
set -e

while true;
do
        mongo --eval "db.runCommand( { serverStatus: 1 } )" local > /dev/null 2>&1
        if [ $? -eq 0 ]; then
                break;
        fi
        echo "waiting for mongod start..."
        sleep 1
done

echo " [+] Preparing db"
mongo catapult < mongoDbPrepare.js
echo " [.] (exit code: $?)"

echo " [+] db prepared, checking account indexes"
mongo --eval 'db.accounts.getIndexes()' catapult

trap 'echo "successful; exiting"; exit 0' SIGTERM
