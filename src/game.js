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
