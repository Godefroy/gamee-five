var socketio = require("socket.io");
var _ = require("underscore");
var chalk = require("chalk");
var settings = require("./settings");

module.exports = function(httpServer) {

  // Socket.io server
  var socketioServer = socketio(httpServer);

  // Contexts of connected users
  var contexts = [];

  var socketioPlay = socketioServer.of("play");
  var socketioShow = socketioServer.of("show");

  // Player connection
  socketioPlay.on("connection", function(socket) {
    // Context passed to controllers
    var context = {
      socket: socket,
      orientation: null,
      emit: function(name, data, callback) {
        context.socket.emit(name, data, callback);
        if (settings.debug) {
          console.log(chalk.yellow("[" + this.socket.id + "]") + chalk.magenta(" <= ") + name + (!_.isEmpty(data) ? chalk.gray(" " + JSON.stringify(data)) : ""));
        }
      }
    };
    contexts.push(context);

    // Orientation event
    socket.on("orientation", function(data, reply) {
      if (settings.debug) {
        console.log(chalk.yellow("[" + socket.id + "]") + chalk.blue(" => ") + "Orientation" + (!_.isEmpty(data) ? chalk.gray(" " + JSON.stringify(data)) : ""));
      }
      context.orientation = data;
      reply();
    });

    // User disconnection
    socket.on("disconnect", function() {
      // Remove user's context from contexts list
      contexts.splice(contexts.indexOf(context), 1);

      if (settings.debug) {
        console.log(chalk.yellow("[" + socket.id + "]") + chalk.magenta(" Disconnection") + chalk.gray(" (" + contexts.length + " online)"));
      }
    });

    if (settings.debug) {
      console.log(chalk.yellow("[" + socket.id + "]") + chalk.green(" Connection") + chalk.gray(" (" + contexts.length + " online)"));
    }

  });


  // Show screen connection
  socketioShow.on("connection", function(socket) {

    // User disconnection
    socket.on("disconnect", function() {
      if (settings.debug) {
        console.log(chalk.yellow("[" + socket.id + "]") + chalk.magenta(" Show Screen Disconnection"));
      }
    });

    if (settings.debug) {
      console.log(chalk.yellow("[" + socket.id + "]") + chalk.green(" Show Screen Connection"));
    }

  });

  // Periodically send data of all players to Show screens
  setInterval(function() {
    var data = _.chain(contexts)
      .filter(function(context) {
        return !!context.orientation;
      })
      .map(function(context) {
        return {
          id: context.socket.id,
          orientation: context.orientation
        };
      }).value();
    socketioShow.emit("players", data);
  }, settings.showDelay);


  // Socket server helpers
  GLOBAL.socketHelper = {
    getContextById: function(id) {
      return _.find(contexts, function(context) {
        return context.socket.id == id;
      });
    },

    emitById: function(id, name, data, callback) {
      var context = this.getContextById(id);
      if (context) context.emit(name, data, callback);
    },

    emitByUsersIds: function(ids, name, data) {
      _.each(contexts, function(context) {
        if (ids.indexOf(context.socket.id) != -1) {
          context.emit(name, data);
        }
      });
    },

    emitAll: function(name, data) {
      _.each(contexts, function(context) {
        context.emit(name, data);
      });
    }
  };
};