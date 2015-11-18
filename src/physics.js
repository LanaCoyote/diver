var Vector = require( './vector' );

function physicsLoop( dt ) {
  G_PhysicsObjects.forEach( function( phys ) {
    var newvel = phys.velocity.scalar_mul( dt );
    var newpos = phys.transform.pos.add( newvel );
    phys.transform.setPos( newpos );

    //phys.transform.velocity = 
  } );
}

var G_PhysicsObjects = [];
function PhysObject( gameObj ) {
  this.transform = gameObj.aabb || gameObj.transform || null;
  if ( !this.transform ) return console.error( "Tried to create a physics object with no transform" );

  this.parent = gameObj;
  gameObj.physics = this;

  this.velocity = new Vector( 0, 0 );

  G_PhysicsObjects.push( this );
}

PhysObject.prototype.force = function( vec ) {
  this.velocity = this.velocity.add( vec );
} 

/******************************************************************************
                                Transform
******************************************************************************/
function Transform( gameObj, x, y ) {
  this.setPos( x, y );
  this.velocity = new Vector( 0,0 );

  this.parent = gameObj;
  if ( gameObj ) gameObj.transform = this;
}

Transform.prototype.setPos = function( x, y ) {
  if ( x.__proto__ && x.__proto__.constructor === Vector ) {
    this.pos = x;
  } else {
    this.pos = new Vector( x, y );
  }
}

Transform.prototype.move = function( x, y ) {
  if ( x.__proto__ && x.__proto__.constructor === Vector ) {
    this.pos = this.pos.add( x );
  } else {
    this.pos = this.pos.add( new Vector( x, y ) );
  }
}


/******************************************************************************
                                  AABB
******************************************************************************/
function AABB( gameObj, topleft, botright ) {
  this.diagonal = topleft.sub( botright );
  this.half_diagonal = this.diagonal.scalar_mul( 0.5 );
  var midpoint = topleft.add( this.half_diagonal );
  Transform.call( this, gameObj, midpoint );

  if ( gameObj ) gameObj.aabb = this;
}

AABB.prototype = Object.create( Transform.prototype );
AABB.prototype.constructor = AABB;

AABB.prototype.topleft = function() {
  return this.pos.sub( this.half_diagonal );
}

AABB.prototype.botright = function() {
  return this.pos.add( this.half_diagonal );
}

module.exports = {
  physicsLoop: physicsLoop,
  PhysObject: PhysObject,
  Transform: Transform,
  AABB: AABB
}
