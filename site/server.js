(function() {
  var app, express;

  express = require('express');

  app = express();

  app.use(express["static"](__dirname + '/public'));

  app.listen("8001");

  console.log('Server started at http://localhost:8080');

}).call(this);
