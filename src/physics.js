var Vector = require( './vector' );

function friction( vec, amt ) {
  var newx = vec.x > 0 ? Math.max(0, vec.x - amt) : Math.min(0, vec.x + amt);
  var newy = vec.y > 0 ? Math.max(0, vec.y - amt) : Math.min(0, vec.y + amt);
  return new Vector( newx, newy );
}

function physicsLoop( dt ) {
  G_PhysicsObjects.forEach( function( phys ) {
    var newvel = phys.velocity.scalar_mul( dt );
    var newpos = phys.transform.pos.add( newvel );
    phys.transform.setPos( newpos );

    //phys.velocity = friction( phys.velocity, 1 );
    //phys.transform.velocity = 
  } );
}

function getObjsWithin( point, radius ) {
  return G_PhysicsObjects.filter( function( obj ) {
    return ( obj.transform.pos.distance_sq( point ) <= radius * radius );
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

function clearPhysObjects() {
  G_PhysicsObjects = [];
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
  this.diagonal = botright.sub( topleft );
  this.half_diagonal = this.diagonal.scalar_mul( 0.5 );
  this.midpoint = topleft.add( this.half_diagonal );
  Transform.call( this, gameObj, this.midpoint );

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

AABB.prototype.isColliding = function( rhs ) {
  if ( rhs.constructor === Vector || rhs.constructor === Transform ) {
    if ( rhs.constructor === Transform ) rhs = rhs.pos;
    // console.log( rhs );
    return ( rhs.x > this.topleft().x && rhs.y > this.topleft().y 
          && rhs.x < this.botright().x && rhs.y < this.botright().y );
  } else if ( rhs.constructor === AABB ) {
    // BAD VERY BAD
    return false;
  } else if ( rhs.constructor === Circle ) {
    return rhs.isColliding( this );
  }
}

/******************************************************************************
                                Circle
******************************************************************************/
function Circle( gameObj, center, radius ) {
  Transform.call( this, gameObj, center );
  this.radius = radius;

  if ( gameObj ) gameObj.circle = this;
}

Circle.prototype = Object.create( Transform.prototype );
Circle.prototype.constructor = Circle;

Circle.prototype.isColliding = function( rhs ) {
  if ( rhs.constructor === Vector || rhs.constructor === Transform ) {
    if ( rhs.constructor === Transform ) rhs = rhs.pos;
    return ( this.radius * this.radius >= this.pos.distance_sq( rhs ) );
  } else if ( rhs.constructor === AABB ) {
    var closest_point = rhs.midpoint.sub( this.pos ).set_magnitude( this.radius ).add( this.pos );
    return rhs.isColliding( closest_point );
  } else if ( rhs.constructor === Circle ) {
    var sum_radii = this.radius + rhs.radius;
    return ( sum_radii * sum_radii >= this.pos.distance_sq( rhs.pos ) );
  } else {
    throw new Error( "Could not compute collisions with unknown type " + rhs.constructor.name );
  }
}

module.exports = {
  physicsLoop: physicsLoop,
  PhysObject: PhysObject,
  clearPhysObjects: clearPhysObjects,
  Transform: Transform,
  AABB: AABB,
  Circle: Circle
}
