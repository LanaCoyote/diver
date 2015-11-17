var graphics = require('./graphics');
var physics = require('./physics');
var Vector = require('./vector');

var testObject = {}
testObject.aabb = new physics.AABB( new Vector( 5,5 ), new Vector( 10,10 ) );
testObject.pos = function() { return this.aabb.topleft() };
testObject.sprite = new graphics.Sprite( "static/images/diver.png", testObject );

var ctx = null;
window.onload = function() {
  var canvas = document.createElement("canvas");
  ctx = canvas.getContext( "2d" );
  canvas.width = 512;
  canvas.height = 480;
  document.body.appendChild( canvas );

  main();
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

function main() {
  testObject.aabb.move( new Vector( 1,0 ) );
  graphics.drawLoop( ctx );

  requestAnimationFrame( main );
}
