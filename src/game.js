var graphics = require('./graphics');
var physics = require('./physics');
var Vector = require('./vector');
var Input = require('./input');

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

  input = new Input( window );

  then = performance.now();
  //testObject.physics.force( new Vector( 100, 0 ) );

  var testObjects = [];
  function createNewObject() {
    var testObject = {};
    var startx = Math.random() * 800;
    var starty = Math.random() * 600;
    var size = 16 + Math.random() * 64;
    new physics.AABB( testObject, new Vector( startx, starty ), new Vector( startx + size, starty + size ) );
    new physics.PhysObject( testObject );
    new graphics.Sprite( testObject, "static/images/diver.png" );
    testObjects.push( testObject );
  }


  var G_RAFLoop;
  function main( now ) {
    G_RAFLoop = requestAnimationFrame( main );

    //var now = Date.now();
    var dt = (now - then) / 1000;
    if ( dt < 0.016 ) createNewObject();

    testObjects.forEach( function( obj ) {

      if ( obj.aabb.pos.x > 800 || obj.aabb.pos.x < 0 ) {
        obj.aabb.pos.x = obj.aabb.pos.x > 800 ? 799 : 1;
        obj.physics.velocity.x *= -1;
      }
      else if ( obj.aabb.pos.y > 800 || obj.aabb.pos.y < 0 ) {
        obj.aabb.pos.y = obj.aabb.pos.y > 800 ? 799 : 1;
        obj.physics.velocity.y *= -1;
      } else 
      obj.physics.force( new Vector( 5 - Math.random() * 10, 5 - Math.random() * 10 ) );
    } );

    //if( input.isKeyDown( 40 ) ) {
      //testObject.physics.force( new Vector( 0, 5 ) );
    //}

    //if( input.isKeyDown( 38 ) ) {
      //testObject.physics.force( new Vector( 0, -5 ) );
    //}

    //if( input.isKeyDown( 39 ) ) {
      //testObject.physics.force( new Vector( 5, 0 ) );
    //}

    //if( input.isKeyDown( 37 ) ) {
      //testObject.physics.force( new Vector( -5, 0 ) );
    //}

    //if( testObject.physics.velocity.magnitude_sq() > 75 * 75 ) {
      //testObject.physics.velocity = testObject.physics.velocity.set_magnitude( 75 );
    //}
  
    //testObject.aabb.move( new Vector( 1,0 ) );
    physics.physicsLoop( dt );
    graphics.drawLoop( ctx );

    var fps = "fps: " + (1/dt).toString();
    var objs = "objs: " + (testObjects.length).toString();

    ctx.fillStyle = "red";
    ctx.font = "24px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.boxShadow = "5px 5px 5px black";
    ctx.fillText( fps, 0, 0 );
    ctx.fillText( objs, 0, 32 ); 



    then = now;
  }

  main( then );
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

