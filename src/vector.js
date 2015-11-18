// Vector
// a vector is (for our sake) a 2D array with an x and y position and magnitude
function Vector ( x, y, z ) {
  this.x = x;
  this.y = y;
  this.z = z ? z : 1; // if z is 1, it's a vector, else it's a point
}

// Vector.prototype.add
// adds two vectors and returns a new vector with the sum of their parts.
Vector.prototype.add = function( rhs ) {
  var new_vec = new Vector(
    this.x + rhs.x,
    this.y + rhs.y,
    1
  );
  return new_vec;
}

// Vector.prototype.sub
// subtracts two vectors and returns a new vector with the sum of their parts.
// used to compute distance between two vectors.
Vector.prototype.sub = function( rhs ) {
  var new_vec = new Vector(
    this.x - rhs.x,
    this.y - rhs.y,
    1
  );
  return new_vec;
}

// Vector.prototype.scalar_mul
// multiplies the x and y values of a vector by some scalar.
Vector.prototype.scalar_mul = function( s ) {
  var new_vec = new Vector(
    this.x * s,
    this.y * s,
    this.z
  );
  return new_vec;
}

// Vector.prototype.distance
// computes the distance between two vectors. can be run in fast mode to get an
// approximate distance instead.
Vector.prototype.distance = function( rhs, fast ) {
  if ( fast ) return this.sub( rhs ).magnitude_fast();
  return this.sub( rhs ).magnitude();
}

// Vector.prototype.magnitude
// computes the magnitude of a vector.
Vector.prototype.magnitude = function() {
  return Math.sqrt( this.magnitude_sq() );
}

// Vector.prototype.magnitude_fast
// inaccurately (but quickly) computes the magnitude of a vector.
Vector.prototype.magnitude_fast = function( turbo ) {
  // see also http://www.claysturner.com/dsp/FastMagnitude.pdf
  // in turbo mode, an even greater margin of error is used
  var alpha = turbo ? 1 : 0.947543;
  var beta = turbo ? 0.25 : 0.392485;
  var r = alpha * Math.max( Math.abs( this.x ), Math.abs( this.y ) ) 
    + beta * Math.min( Math.abs( this.x ), Math.abs( this.y ) );
  return r;
}

Vector.prototype.magnitude_sq = function() {
  if ( this.z === 0 ) return 0;
  return this.x * this.x + this.y * this.y;
}

// Vector.prototype.normalize
// normalizes a vector (sets its magnitude to 1). 
Vector.prototype.normalize = function() {
  var mag = this.magnitude();
  var new_vec = new Vector(
    this.x / mag,
    this.y / mag,
    1
  );
  return new_vec;
}

// Vector.prototype.set_magnitude
// sets the magnitude of a vector. this is really expensive pls don't do it.
Vector.prototype.set_magnitude = function( mag ) {
  var new_vec = this.normalize();
  return new_vec.scalar_mul( mag );
}

// Vector.prototype.midpoint
// returns a new vector with its x and y at the midpoint of a vector.
Vector.prototype.midpoint = function() {
  var new_vec = this.scalar_mul( 0.5 );
  return new_vec;
}

// Vector.prototype.angle
// returns the angle of a vector
// TODO: write this function



module.exports = Vector;
