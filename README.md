# Gamee Five

This is a demo project for the Game Jam "Gamee Five" organized by [Atlangames](http://www.atlangames.com/) on September 2015.

* Developped in 6 hours (a typical Game Jam lasts 48 hours)
* Game for a crowd: ideally with one large screen and dozens of players on their smartphones
* Using [Node.js](https://nodejs.org/), [Socket.io](https://www.npmjs.com/), [Express.js](http://expressjs.com/), [Jade](http://jade-lang.com/), [Paper.js](http://paperjs.org/) and [Device orientation detection](https://developer.mozilla.org/fr/docs/WebAPI/Detecting_device_orientation)

# Install

* Clone this project
* Make sure Node and NPM are installed
* Install node packages in project's folder: ``npm install``
* Launch server: ``npm start``

# Access

You can now access the two main parts of the app:
* "Play" page for smartphone: ``http://locahost/play``
* "Show" page for large screen (eg: projector): ``http://locahost/show``

Host and port can be configured in ``settings.js``.

When ``settings.debug = false``, host is checked and a redirection is made if a user try to access the app with a wrong host.

# Play

Each player (on "Play" page) has a ball moving on the "Show" page.
The player can move his smartphone to move his ball and try to find which ball he's controlling.

# License

See the file [LICENSE](https://github.com/Godefroy/gamee-five/blob/master/LICENSE.txt)

Author: [Godefroy de Compreignac](https://github.com/Godefroy)
