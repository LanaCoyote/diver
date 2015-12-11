var physics = require('./physics');
var Sprite = require('./graphics').Sprite;
var Vector = require('./vector');

function Boat( startPos ) {
  new physics.Circle( this, startPos, 24 );
  new Sprite( this, "static/images/boat.png" );
}

module.exports = Boat;