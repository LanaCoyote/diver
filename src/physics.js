var Vector = require( './vector' );

/******************************************************************************
                                Transform
******************************************************************************/
function Transform( x, y ) {
  this.setPos( x, y );
}

Transform.prototype.setPos = function( x, y ) {
  if ( x.__proto__ && x.__proto__ .constructor === Vector ) {
    this.pos = x;
  } else {
    this.pos = new Vector( x, y );
  }
}

Transform.prototype.move = function( x, y ) {
  if ( x.__proto__ && x.__proto__ .constructor === Vector ) {
    this.pos = this.pos.add( x );
  } else {
    this.pos = this.pos.add( new Vector( x, y ) );
  }
}


/******************************************************************************
                                  AABB
******************************************************************************/
function AABB( topleft, botright ) {
  this.diagonal = topleft.sub( botright );
  this.half_diagonal = this.diagonal.scalar_mul( 0.5 );
  var midpoint = topleft.add( this.half_diagonal );
  Transform.call( this, midpoint );
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
  Transform: Transform,
  AABB: AABB
}
