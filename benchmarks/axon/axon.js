const axon = require("@axonlabs/core")
var app = axon.Axon();
let router = axon.Router();

// number of middleware

var n = parseInt(process.env.MW || '1', 10);
console.log('  %s middleware', n);

while (n--) {
  app.globalMiddleware(function(req, res, next){
    next();
  });
}

router.get('/', function(req, res){
  res.status(200).body('Hello World')
});

app.loadRoute(router);

app.listen("127.0.0.1", 3333);
