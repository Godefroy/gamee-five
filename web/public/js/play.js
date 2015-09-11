// Socket connection and start Play
var socket = io("/play");
socket.once("connect", function() {
  console.log("Connected to " + document.location.host);

  // Handle disconnect event
  socket.on("disconnect", function() {
    console.log("Disconnected from " + document.location.host);
    Play.stop();
  });

  // Start game
  Play.start();
});
socket.on("reconnecting", function(message) {
  console.log("Reconnecting...");
});
socket.on("reconnect", function(message) {
  console.log("Reconnected");
  Play.start();
});


var Play = {
  delay: 100,
  active: false,
  timeout: null,
  orientation: {
    x: 0,
    y: 0
  },
  start: function() {
    document.getElementById("warning-connection").style.display = "none";
    if (!this.active) return Play.delayStart();
    socket.emit("orientation", this.orientation, function() {
      Play.delayStart();
    });
  },
  delayStart: function() {
    clearInterval(this.timeout);
    this.timeout = setTimeout(function() {
      Play.start();
    }, this.delay);
  },
  stop: function() {
    document.getElementById("warning-connection").style.display = "block";
    clearInterval(this.timeout);
  }
};


// Device Orientation
// See https://developer.mozilla.org/fr/docs/WebAPI/Detecting_device_orientation

window.addEventListener("deviceorientation", function(event) {
  var x = event.beta, // In degrees [-180,180]
    y = event.gamma; // In degrees [-90,90]

  if (x == null) {
    return showIncompatibleWarning();
  }

  // We want values between -45 and 45
  if (x > 45) x = 45;
  if (x < -45) x = -45;
  if (y > 45) y = 45;
  if (y < -45) y = -45;

  Play.orientation.x = x;
  Play.orientation.y = y;
  Play.active = true;
});


if (!window.DeviceOrientationEvent) {
  showIncompatibleWarning();
}

function showIncompatibleWarning(){
  document.getElementById("warning-incompatible").style.display = "block";
};