# ProximaX Sirius-Chain REST config description #

  - network Contains description of network. 
    - name - Contains type of network, for example "mijinTest"
    - description - Contains description of network
  - port - Port of server
  - crossDomainHttpMethods - Supported http methods
  - clientPrivateKey - Identifier of the rest server. It is need for connection with blockchain.
  - extensions - Supported plugins by the rest
  - db - Config DB connection
    - url - Connection IP
    - name - Database name
    - pageSizeMin - Minimum items from aggregate query
    - pageSizeMax - Maximum items from aggregate query
    - maxConnectionAttempts - Maximum connection to DB
    - baseRetryDelay - Retry connect to DB delay

  - apiNode - Config contains information about API node
    - host - Ip of blockchain node
    - port - Port of node
    - publicKey - Public key of node
    - timeout - Timeout connection to API node

  - transactionCache - When config contains this field, we cache transactions and periodically flush them to blockchain.
    - flushFrequency - How often we flush transaction from cache to blockchain

  - websocket Config of socket connection between blockchain and rest server. We use this socket to get notification from blockchain.
    - mq - ZeroMQ config
      - host - Ip of API node which will notify us
      - port - Port of API node
      - monitorInterval - How often check notifications from blockchain
      - connectTimeout - Connection timeout to blockchain
    - allowOptionalAddress - Get addresses from notification
  },
  
  - plugins Config for extensions
    - richlist - Config for richlist extension
      - throttling - Throttling config for richlist endpoint
        - burst - Max number of request allowed of per second
        - rate - Rate to fill in requests per second
  
  - logging - Logging config
