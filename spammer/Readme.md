To run spammer:
```
cd spammer
npm run build && npm run start
```
You can configure it:

 * spammer/src/utils/spammerOptions.js - here you can change parameters of connection and spam.
 * spammer/src/model/transactionFactory.js - here you can change token, which you need to use in transactions.

You can change parameters of spammer via command line arguments. To check all available parameters run the follow command:

```
node src/index.js -h
info:
Catapult spammer

  Tool to spam a rest server with random transactions.

Options

  -s, --sameTransaction         Spammer will use the same transaction each time                    
  -m, --mode                    Available spamming modes: transfer (default), aggregate            
  -d, --predefinedRecipients    The number of predefined recipients or 0 for random recipients.    
  -a, --address                 The host ip address.                                               
  -p, --port                    The port on which to connect.                                      
  -r, --rate                    The desired transaction rate (tx / s).                             
  -t, --total                   The total number of transactions.                                  
  -k, --privateKeys             The private keys of accounts with tokens to generate transactions.
```

Example how to pass private keys to spammer:
```
node src/index.js --privateKeys=F4035D9C877CDE902857ABCDF64E5645C0BFD5A1A061D3BB99AA9E3DD05EB01E 30F2C2CDB5AD62D1DD9E8EC3E8E685EC49E5563BD81C5439D327181116184C48 --sameTransaction --total=10000 --address=127.0.0.1 --rate=0
```
