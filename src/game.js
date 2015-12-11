var graphics = require('./graphics');
var bg = require('./background');
var physics = require('./physics');
var Vector = require('./vector');
var Input = require('./input');
var Player = require('./player');
var Shark = require('./shark');
var Treasure = require('./treasure');
var Boat = require('./boat');



var ctx = null,
    then = 0,
    input;
window.onload = function() {

  // initialize the canvas
  var canvas = document.createElement("canvas");
  ctx = canvas.getContext( "2d" );
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild( canvas );

  // create our input manager
  input = new Input( window );

  // show the title screen
  title( ctx );

}

function title( ctx ) {

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

  // initialize game objects
  var player = new Player( input );
  var boat = new Boat( new Vector( 376, 50 ) );
  var treasure = new Treasure( new Vector( 400, 560 ) );
  var sharks = [
    new Shark( new Vector( 100, 500 ), 24, 60 ),
    new Shark( new Vector( 700, 500 ), 24, 60 )
  ];


  // inititialize shark spawning logic
  var sharkSize = 30;
  var sharkSpawnTimer = setInterval( spawnShark, 15000 );


  // inititialize game counters
  then = performance.now();
  var timeleft = { value: 180, color: "black" };
  var score = { value: 0 };


  function spawnShark() {

    // create a shark off screen at a random x position
    var xpos = Math.random() < 0.5 ? -sharkSize : 800 + sharkSize;
    var shark = new Shark( new Vector( xpos, 100 + Math.random() * 400 ),
                           sharkSize,
                           40 + ( Math.random() * 100 ) );

    // increase the size of the next shark
    sharkSize += Math.round( Math.random() * 7 );

    // push this shark to the shark list
    sharks.push( shark );

  }


  var G_RAFLoop;
  function endGame() {

    // stop the game loop from running
    cancelAnimationFrame( G_RAFLoop );

    // clear game state
    input.clearBinds();
    graphics.clearSprites();
    physics.clearPhysObjects();
      
    // return to the title screen
    title( ctx );

  }


  function main( now ) {

    // set the next game loop to run on the next animation frame
    G_RAFLoop = requestAnimationFrame( main );

    // reset the timer color
    timeleft.color = "black";

    // get our delta time (fractions of seconds since last game loop)
    var dt = (now - then) / 1000;


    // do pre-physics updates
    if (player) player.onUpdate( dt ); 
    sharks.forEach( function( shark ) {
      shark.onUpdate( dt, player );

      sharks.forEach( function( otherShark ) {
      
        // skip yourself  
        if ( otherShark === shark ) return;

        // bounce off the other shark
        if ( shark.circle.isColliding( otherShark.circle ) ) {
          var sharkDist = shark.transform.pos.sub( otherShark.transform.pos );
          shark.physics.velocity = sharkDist.scalar_mul( -1 );
          shark.physics.velocity = sharkDist;
        }
      
      });

    });


    // do physics
    physics.physicsLoop( dt );


    // do post-physics updates
    if (player) player.onUpdatePostPhysics( dt );
    treasure.onUpdatePostPhysics( player );
    sharks.forEach( function( shark ) {
      shark.onUpdatePostPhysics( dt, player, timeleft );
    })

    // check if the treasure has been scored
    if ( boat.circle.isColliding( treasure.circle ) ) {
      treasure.attachedTo = null;
      treasure.transform.setPos( new Vector( Math.random() * 800, 540 ) );

      score.value += 100;
    }


    // run the graphics loop
    graphics.drawLoop( ctx );


    // check if the timer has run out
    if ( timeleft.value < 0 ) {

      // if the player is still around and the timer expired, do some work
      if ( player ) {

        // hide the player's sprite and remove their object
        player.sprite.ready = false;
        player = null;

        // stop sharks from spawning
        clearInterval( sharkSpawnTimer );
        
        // bind space to end the game
        input.addBindOnRelease( 32, endGame );
      
      }

      // draw the GAME OVER text
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

      // draw the game HUD
      ctx.fillStyle = "black";
      ctx.font = "24pt sans-serif";
      ctx.textBaseline = "bottom";
      
      ctx.textAlign = "left";
      ctx.fillText( "Score: " + score.value, 20, 600 );

      ctx.fillStyle = timeleft.color;
      ctx.textAlign = "right";
      ctx.fillText( "Time: " + Math.round( timeleft.value ), 780, 600 );

    }

    // subtract the delta time from the game timer
    timeleft.value -= dt;

    // set then to now
    then = now;

  }

  // call the game loop
  main( then );

}


// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
cancelAnimationFrame = w.cancelAnimationFrame || w.webkitCancelAnimationFrame || w.msRequestAnimationFrame || w.mozCancelAnimationFrame;
