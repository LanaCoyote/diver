var physics = require('./physics');
var Sprite = require('./graphics').Sprite;
var Vector = require('./vector');

function Treasure( startPos ) {
  new physics.Circle( this, startPos, 24 );
  new Sprite( this, "static/images/treasure.png" );

  this.attachedTo = null;
}

Treasure.prototype.onUpdatePostPhysics = function( player ) {

  if ( this.attachedTo ) {
    this.transform.setPos( this.attachedTo.transform.pos.add(
      new Vector( 0, -48 ) ) );


  } else if ( player && player.circle.isColliding( this.circle ) ) {
    this.attachedTo = player;
  }

} 

module.exports = Treasure;