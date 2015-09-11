var http = require("http");
var chalk = require("chalk");
var settings = require("./settings");
var socket = require("./socket");
var webapp = require("./web/app");

// Errors handling
process.on('uncaughtException', function(err) {
  console.error(err.stack);
});

// Launch HTTP Server
var httpServer = http.createServer(webapp);

// Listen to configured port
httpServer.listen(settings.server.port, function() {
  console.log(chalk.green("Server listening at port " + settings.server.port));
});

// Error handling for server launch
httpServer.on("error", function(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      console.error("Port " + settings.server.port + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error("Port " + settings.server.port + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Launch Socket.io server
socket(httpServer);
