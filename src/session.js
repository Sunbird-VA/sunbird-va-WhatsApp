const session = require('express-session');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
});

module.exports=session({
    store: new (require('connect-redis')(session))({
      client: redisClient,
    }),
    secret: '12345', 
    resave: false,
    saveUninitialized: true,
  })