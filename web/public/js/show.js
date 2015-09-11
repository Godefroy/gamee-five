// Socket connection and start Show
var socket = io("/show");
socket.once("connect", function() {
  console.log("Connected to " + document.location.host);

  // Receive players data
  socket.on("players", function(players) {
    Show.updatePlayers(players);
  });

  // Handle disconnect event
  socket.on("disconnect", function() {
    console.log("Disconnected from " + document.location.host);
  });
});
socket.on("reconnecting", function(message) {
  console.log("Reconnecting...");
});
socket.on("reconnect", function(message) {
  console.log("Reconnected");
});


// Show players balls
var Show = {
  maxChangeSpeed: 3,
  maxSpeed: 5,
  balls: [],

  updatePlayers: function(players) {
    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      // Already existing ball?
      var ball = _.find(this.balls, function(ball) {
        return ball.id == player.id;
      });

      if (ball) {
        var vector = new Point(player.orientation.y, player.orientation.x);
        if (vector.length > this.maxChangeSpeed) {
          vector = vector.normalize(this.maxChangeSpeed);
        }
        vector = ball.vector + vector;
        if (vector.length > this.maxSpeed) {
          vector = vector.normalize(this.maxSpeed);
        }
        ball.vector = vector;

      } else {
        // Add new Ball with random position
        var position = Point.random() * view.size;
        var vector = new Point({
          angle: 360 * Math.random(),
          length: Math.random() * 10
        });
        var radius = Math.random() * 15 + 50;
        ball = new Ball(player.id, radius, position, vector);
        this.balls.push(ball);
      }

      ball.updated = true;
    }

    for (var i = this.balls.length - 1; i >= 0; i--) {
      // Player still connected
      if (this.balls[i].updated) {
        this.balls[i].updated = false;
      }
      // Player not connected anymore
      else {
        // Remove ball from Canvas
        this.balls[i].remove();
        // Remove ball from balls list
        this.balls.splice(i, 1);
      }
    }
  }
};

onFrame = function() {
  for (var i = 0; i < Show.balls.length - 1; i++) {
    for (var j = i + 1; j < Show.balls.length; j++) {
      Show.balls[i].react(Show.balls[j]);
    }
  }
  for (var i = 0, l = Show.balls.length; i < l; i++) {
    Show.balls[i].iterate();
  }
};


// From Paper.js example: http://paperjs.org/examples/candy-crash/

function Ball(id, r, p, v) {
  this.id = id;
  this.radius = r;
  this.point = p;
  this.vector = v;
  this.maxVec = 15;
  this.numSegment = Math.floor(r / 3 + 2);
  this.boundOffset = [];
  this.boundOffsetBuff = [];
  this.sidePoints = [];
  this.path = new Path({
    fillColor: {
      hue: Math.random() * 360,
      saturation: 0.7,
      brightness: 0.6
    },
    blendMode: 'screen'
  });

  for (var i = 0; i < this.numSegment; i++) {
    this.boundOffset.push(this.radius);
    this.boundOffsetBuff.push(this.radius);
    this.path.add(new Point());
    this.sidePoints.push(new Point({
      angle: 360 / this.numSegment * i,
      length: 1
    }));
  }
}

Ball.prototype = {
  remove: function() {
    this.path.remove();
  },
  iterate: function() {
    this.checkBorders();
    if (this.vector.length > this.maxVec)
      this.vector.length = this.maxVec;
    this.point += this.vector;
    this.updateShape();
  },

  checkBorders: function() {
    var size = view.size;
    if (this.point.x < -this.radius)
      this.point.x = size.width + this.radius;
    if (this.point.x > size.width + this.radius)
      this.point.x = -this.radius;
    if (this.point.y < -this.radius)
      this.point.y = size.height + this.radius;
    if (this.point.y > size.height + this.radius)
      this.point.y = -this.radius;
  },

  updateShape: function() {
    var segments = this.path.segments;
    for (var i = 0; i < this.numSegment; i++)
      segments[i].point = this.getSidePoint(i);

    this.path.smooth();
    for (var i = 0; i < this.numSegment; i++) {
      if (this.boundOffset[i] < this.radius / 4)
        this.boundOffset[i] = this.radius / 4;
      var next = (i + 1) % this.numSegment;
      var prev = (i > 0) ? i - 1 : this.numSegment - 1;
      var offset = this.boundOffset[i];
      offset += (this.radius - offset) / 15;
      offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
      this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
    }
  },

  react: function(b) {
    var dist = this.point.getDistance(b.point);
    if (dist < this.radius + b.radius && dist != 0) {
      var overlap = this.radius + b.radius - dist;
      var direc = (this.point - b.point).normalize(overlap * 0.015);
      this.vector += direc;
      b.vector -= direc;

      this.calcBounds(b);
      b.calcBounds(this);
      this.updateBounds();
      b.updateBounds();
    }
  },

  getBoundOffset: function(b) {
    var diff = this.point - b;
    var angle = (diff.angle + 180) % 360;
    return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)];
  },

  calcBounds: function(b) {
    for (var i = 0; i < this.numSegment; i++) {
      var tp = this.getSidePoint(i);
      var bLen = b.getBoundOffset(tp);
      var td = tp.getDistance(b.point);
      if (td < bLen) {
        this.boundOffsetBuff[i] -= (bLen - td) / 2;
      }
    }
  },

  getSidePoint: function(index) {
    return this.point + this.sidePoints[index] * this.boundOffset[index];
  },

  updateBounds: function() {
    for (var i = 0; i < this.numSegment; i++)
      this.boundOffset[i] = this.boundOffsetBuff[i];
  }
};