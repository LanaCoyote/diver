(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


function drawBackground( ctx ) {
  drawSky( ctx, 60 );
  drawOcean( ctx, 60, 560 );
  drawSeabed( ctx, 560 );
}

function drawSky( ctx, endy ) {
  ctx.fillStyle = '#0093D1';
  ctx.fillRect( 0, 0, ctx.canvas.width, endy );
}

function drawOcean( ctx, starty, endy ) {
  var gradient = ctx.createLinearGradient( 0, 0, 0, endy - starty );
  gradient.addColorStop( 0, '#006495' );
  gradient.addColorStop( 1, '#004C70' );

  ctx.fillStyle = gradient;
  ctx.fillRect( 0, starty, ctx.canvas.width, endy );
}

function drawSeabed( ctx, starty ) {
  ctx.fillStyle = '#E0A025';
  ctx.fillRect( 0, starty, ctx.canvas.width, ctx.canvas.height );
}

module.exports.drawBackground = drawBackground;


},{}],2:[function(require,module,exports){
var physics = require('./physics');
var Sprite = require('./graphics').Sprite;
var Vector = require('./vector');

function Boat( startPos ) {
  new physics.Circle( this, startPos, 24 );
  new Sprite( this, "static/images/boat.png" );
}

module.exports = Boat;
},{"./graphics":4,"./physics":6,"./vector":10}],3:[function(require,module,exports){
var graphics = require('./graphics');
var bg = require('./background');
var physics = require('./physics');
var Vector = require('./vector');
var Input = require('./input');
var Player = require('./player');
var Shark = require('./shark');
var Treasure = require('./treasure');
var Boat = require('./boat');

//var testObject = {}
//new physics.AABB( testObject, new Vector( 5,5 ), new Vector( 10,10 ) );
//new physics.PhysObject( testObject );
//new graphics.Sprite( testObject, "static/images/diver.png" );

var ctx = null,
    then = 0,
    input;
window.onload = function() {

  var canvas = document.createElement("canvas");
  ctx = canvas.getContext( "2d" );
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild( canvas );

  title( ctx );

}

function title( ctx ) {

  input = new Input( window );

  bg.drawBackground( ctx );

  ctx.fillStyle = "white";
  ctx.font = "48pt sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText( "Diver", 400, 150 );

  ctx.font = "14pt sans-serif";
  ctx.fillText( "Use the arrow keys to move. Collect the treasure and bring it to your boat.", 400, 300 );
  ctx.fillText( "Touching sharks will cause you to lose time. When time runs out, you lose!", 400, 330 );
  ctx.fillText( "Press space to begin.", 400, 360 );

  input.addBindOnRelease( 32, function() {

    input.clearBinds();
    startGame( ctx );
  
  } )

}

function startGame( ctx ) {

  var player = new Player( input );
  var boat = new Boat( new Vector( 376, 50 ) );
  var treasure = new Treasure( new Vector( 400, 560 ) );
  var sharks = [
    new Shark( new Vector( 100, 500 ), 24, 60 ),
    new Shark( new Vector( 700, 500 ), 24, 60 )
  ]
  var sharkSize = 30;

  var sharkSpawnTimer = setInterval( function() {
    var xpos = Math.random() < 0.5 ? -sharkSize : 800 + sharkSize;
    var shark = new Shark( new Vector( xpos, 100 + Math.random() * 400 ),
                           sharkSize,
                           40 + ( Math.random() * 100 ) );
    sharkSize += Math.round( Math.random() * 7 );
    sharks.push( shark );
  }, 15000 );

  then = performance.now();
  var timeleft = { value: 180, color: "black" };
  var score = { value: 0 };

  var G_RAFLoop;
  function endGame() {

    cancelAnimationFrame( G_RAFLoop );

    input.clearBinds();
    graphics.clearSprites();
    physics.clearPhysObjects();
      
    title( ctx );

  }

  function main( now ) {
    G_RAFLoop = requestAnimationFrame( main );

    timeleft.color = "black";

    //var now = Date.now();
    var dt = (now - then) / 1000;
    //if ( dt < 0.017 ) createNewObject();

    if (player) player.onUpdate( dt );
    sharks.forEach( function( shark ) {
      shark.onUpdate( dt, player );

      sharks.forEach( function( otherShark ) {
        if ( otherShark === shark ) return;
        if ( shark.circle.isColliding( otherShark.circle ) ) {
          var sharkDist = shark.transform.pos.sub( otherShark.transform.pos );
          shark.physics.velocity = sharkDist.scalar_mul( -1 );
          shark.physics.velocity = sharkDist;
        }
      })
    });

    physics.physicsLoop( dt );

    if (player) player.onUpdatePostPhysics( dt );
    treasure.onUpdatePostPhysics( player );
    sharks.forEach( function( shark ) {
      shark.onUpdatePostPhysics( dt, player, timeleft );
    })

    if ( boat.circle.isColliding( treasure.circle ) ) {
      treasure.attachedTo = null;
      treasure.transform.setPos( new Vector( Math.random() * 800, 540 ) );

      score.value += 100;
    }

    graphics.drawLoop( ctx );

    var fps = "fps: " + (1/dt).toString();

    ctx.fillStyle = "black";
    // ctx.font = "12pt monospace";
    // ctx.textAlign = "left";
    // ctx.textBaseline = "top";
    // ctx.fillText( fps, 0, 0 );

    if ( timeleft.value < 0 ) {
      if ( player ) {
        player.sprite.ready = false;
        player = null;

        clearInterval( sharkSpawnTimer );
        
        input.addBindOnRelease( 32, function() {

          endGame();
        
        } )
      
      }

      ctx.fillStyle = "white";
      ctx.font = "36pt sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText( "Game Over!", 400, 240 );

      ctx.font = "24pt sans-serif";
      ctx.fillText( "Final Score: " + score.value, 400, 300 );

      ctx.font = "14pt sans-serif"; 
      ctx.fillText( "Press space to restart", 400, 330 );
    
    } else {

      ctx.font = "24pt sans-serif";
      ctx.textBaseline = "bottom";
      
      ctx.textAlign = "left";
      ctx.fillText( "Score: " + score.value, 20, 600 );

      ctx.fillStyle = timeleft.color;
      ctx.textAlign = "right";
      ctx.fillText( "Time: " + Math.round( timeleft.value ), 780, 600 );

    }

    timeleft.value -= dt;
    then = now;
  }

  main( then );
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
cancelAnimationFrame = w.cancelAnimationFrame || w.webkitCancelAnimationFrame || w.msRequestAnimationFrame || w.mozCancelAnimationFrame;

},{"./background":1,"./boat":2,"./graphics":4,"./input":5,"./physics":6,"./player":7,"./shark":8,"./treasure":9,"./vector":10}],4:[function(require,module,exports){
var Vector = require( './vector' );
var bg = require( './background' );

function clearCtx( ctx ) {
  ctx.fillStyle = "black";
  ctx.fillRect( 0,0, ctx.canvas.width, ctx.canvas.height );
}

function drawLoop( ctx ) {
  clearCtx( ctx );
  bg.drawBackground( ctx );

  G_SpriteList.forEach( function( sprite ) {
    sprite.draw( ctx );
  } );
}

/******************************************************************************
                              Sprite
******************************************************************************/
var G_SpriteList = [];

function clearSprites() {
  G_SpriteList = [];
}

function Sprite( gameObj,src ) {
  this.transform = gameObj.transform || gameObj.aabb || gameObj.circle || null
  if ( !this.transform ) return console.error( "Attempted to initialize a sprite without a transform property" );
  this.parent = gameObj;
  gameObj.sprite = this;

  this.ready = false;

  this.angle = 0;
  this.flipped = false;

  this.image = new Image();
  this.image.onload = (function() {
    this.ready = true;
  }).bind( this );
  this.image.src = src;
  if ( this.transform.diagonal ) {
    this.image.width = this.transform.diagonal.x;
    this.image.height = this.transform.diagonal.y;
  } else if ( this.transform.radius ) {
    this.image.width = this.image.height = this.transform.radius * 2;
  }

  G_SpriteList.push( this );
}

Sprite.prototype.draw = function( ctx ) {
  if ( this.ready ) {
    var posvec;
    if ( this.transform.topleft ) {
      posvec = this.transform.topleft();
    } else if ( this.parent.circle ) {
      posvec = this.parent.circle.pos.sub( new Vector( this.parent.circle.radius, this.parent.circle.radius ) );
    } else {
      posvec = this.transform.pos;
    }

    ctx.save();
    ctx.translate( posvec.x + this.image.width/2, posvec.y + this.image.height/2 )
    ctx.rotate( this.angle );
    ctx.scale( 1, this.flipped ? -1 : 1 );
    ctx.drawImage( this.image, this.image.width/-2, this.image.height/-2, this.image.width, this.image.height );
    ctx.restore();
    // console.log( this.angle );
    return true;
  }
  return false;
}

module.exports = {
  drawLoop: drawLoop,
  clearSprites: clearSprites,
  Sprite: Sprite
}

},{"./background":1,"./vector":10}],5:[function(require,module,exports){

/******************************************************************************
                            InputManager
******************************************************************************/
function InputManager( w ) {
  this.keyspressed = {};
  this.bindsOnPress = {};
  this.bindsOnRelease = {};

  w.addEventListener( "keydown", this.pressKey.bind( this ), false );
  w.addEventListener( "keyup", this.releaseKey.bind( this ), false );

}

InputManager.prototype.pressKey = function( key ) {
  key = key.keyCode;
  this.keyspressed[key] = true;

  if ( this.bindsOnPress[key] ) this.bindsOnPress[key].forEach( function( bind ) {
    bind.call( null, this );
  } );
}

InputManager.prototype.releaseKey = function( key ) {
  key = key.keyCode;
  delete this.keyspressed[key];

  if ( this.bindsOnRelease[key] ) this.bindsOnRelease[key].forEach( function( bind ) {
    bind.call( null, this );
  } );
}

InputManager.prototype.addBindOnPress = function( key, bind ) {
  this.bindsOnPress[key] ? this.bindsOnPress[key].push( bind ) : this.bindsOnPress[key] = [bind];
}

InputManager.prototype.addBindOnRelease = function( key, bind ) {
  this.bindsOnRelease[key] ? this.bindsOnRelease[key].push( bind ) : this.bindsOnRelease[key] = [bind];
}

InputManager.prototype.clearBinds = function() {
  this.bindsOnPress = {};
  this.bindsOnRelease = {};
}

InputManager.prototype.isKeyDown = function( key, bind ) {
  return !!this.keyspressed[key];
}

module.exports = InputManager;

},{}],6:[function(require,module,exports){
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

},{"./vector":10}],7:[function(require,module,exports){
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

},{"./graphics":4,"./physics":6,"./vector":10}],8:[function(require,module,exports){
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

},{"./graphics":4,"./physics":6,"./vector":10}],9:[function(require,module,exports){
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
},{"./graphics":4,"./physics":6,"./vector":10}],10:[function(require,module,exports){
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

Vector.prototype.distance_sq = function( rhs ) {
  return this.sub( rhs ).magnitude_sq();
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
Vector.prototype.angle = function() {
  return Math.atan2( this.y, this.x );
}


module.exports = Vector;

},{}]},{},[3]);
