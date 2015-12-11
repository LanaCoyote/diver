var physics = require('./physics');
var Sprite = require('./graphics').Sprite;
var Vector = require('./vector');

var keyMoveUp = 38;
var keyMoveRight = 39;
var keyMoveDown = 40;
var keyMoveLeft = 37;

var maximumSpeed = 150;
var acceleration = 80;
var deceleration = 80;

function Player( input ) {

  this.input = input;

  new physics.Circle( this, new Vector( 400, 300 ), 24 );
  new physics.PhysObject( this );
  new Sprite( this, "static/images/diver_new.png" );

}


Player.prototype.onUpdate = function( dt ) {

  // apply physics force based on the player's input
  var motionThisTick = this.getMovementFromInput( dt, acceleration );
  this.physics.force( motionThisTick );

  // cap our velocity to the speed limit
  this.capVelocity( maximumSpeed );
  
  // if we received no input, apply some friction
  if ( motionThisTick.magnitude_sq() === 0 && 
    this.physics.velocity.magnitude_sq() > 0 ) {

    this.decelerate( dt, deceleration );
  }

  this.sprite.angle = this.physics.velocity.angle();
  this.sprite.flipped = ( this.sprite.angle > Math.PI*0.5 ||
                          this.sprite.angle <= Math.PI*-0.5 );

}


Player.prototype.onUpdatePostPhysics = function( dt ) {

  // keep the player within game bounds
  if ( this.transform.pos.y > 560 ) {
    this.transform.pos.y = 560;
    this.physics.velocity.y *= -0.25;
  } else if ( this.transform.pos.y < 60 ) {
    this.transform.pos.y = 60;
    this.physics.velocity.y = 0;
  }

  if ( this.transform.pos.x > 824 ) {
    this.transform.pos.x = -23;
  } else if ( this.transform.pos.x < -24 ) {
    this.transform.pos.x = 823;
  }

}


Player.prototype.getMovementFromInput = function( dt, acceleration ) {
  
  var movement = new Vector( 0, 0 );

  if ( this.input.isKeyDown( keyMoveUp ) ) {
    movement = movement.add( new Vector( 0, -acceleration * dt ) );
  }

  if ( this.input.isKeyDown( keyMoveDown ) ) {
    movement = movement.add( new Vector( 0, acceleration * dt ) );
  }

  if ( this.input.isKeyDown( keyMoveRight ) ) {
    movement = movement.add( new Vector( acceleration * dt, 0 ) );
  }

  if ( this.input.isKeyDown( keyMoveLeft ) ) {
    movement = movement.add( new Vector( -acceleration * dt, 0 ) );
  }

  return movement;

}


Player.prototype.capVelocity = function( maximumSpeed ) {

  // if the square magnitude of our velocity is greater than the square of the
  // speed limit, we will reset the magnitude
  if ( this.physics.velocity.magnitude_sq() > (maximumSpeed * maximumSpeed) ) {
    this.physics.velocity = this.physics.velocity.set_magnitude( maximumSpeed );
  }

}


Player.prototype.decelerate = function( dt, deceleration ) {

  // calculate our new velocity after deceleration
  var reduction = this.physics.velocity.set_magnitude( deceleration * dt );
  var newvel = this.physics.velocity.sub( reduction );

  // if our deceleration would reduce our speed past zero, just cap it at zero
  // instead to prevent "wobbling"
  if ( newvel.magnitude_sq() > this.physics.velocity.magnitude_sq() ) {
    this.physics.velocity = new Vector( 0, 0 );
  } else {
    this.physics.velocity = newvel;
  }

}

module.exports = Player;
