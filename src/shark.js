var physics = require('./physics');
var Sprite = require('./graphics').Sprite;
var Vector = require('./vector');

var sharkSpeed = 60;

function Shark( startPos, radius, speed ) {

  new physics.Circle( this, startPos, radius );
  new physics.PhysObject( this );
  new Sprite( this, "static/images/shark.png" );

  this.speed = speed;

}

Shark.prototype.onUpdate = function( dt, player ) {

  var requestedMotion;
  if ( player ) {

    var vectorToPlayer = player.transform.pos.sub( this.transform.pos );
    requestedMotion = vectorToPlayer.normalize();
    this.sprite.angle = requestedMotion.angle();

  } else {

    requestedMotion = new Vector( 0.5 - Math.random(), 0.5 - Math.random() );
    this.sprite.angle = this.physics.velocity.angle();

  }

  this.physics.force( requestedMotion.scalar_mul( this.speed ) );

  if ( this.physics.velocity.magnitude_sq() > this.speed * this.speed ) {
    this.physics.velocity = this.physics.velocity.set_magnitude( this.speed );
  }

  this.sprite.flipped = ( this.sprite.angle > Math.PI*1/2 ||
                          this.sprite.angle < Math.PI*-1/2 );

}

Shark.prototype.onUpdatePostPhysics = function( dt, player, timeleft ) {

  //var sum_radii = this.circle.radius + player.circle.radius;
  // console.log( sum_radii * sum_radii, this.transform.pos.distance_sq( player.circle.pos ));
  if( player && this.circle.isColliding( player.circle ) ) {
    timeleft.value -= 30 * dt;
    timeleft.color = 'red';
  }

}


module.exports = Shark;
