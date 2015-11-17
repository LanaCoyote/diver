function drawLoop( ctx ) {
  G_SpriteList.forEach( function( sprite ) {
    sprite.draw( ctx );
  } );
}

/******************************************************************************
                              Sprite
******************************************************************************/
var G_SpriteList = [];

function Sprite( src, gameObj ) {
  if ( !gameObj.pos ) return console.error( "Attempted to initialize a sprite without a transform property" );
  this.gameObj = gameObj;

  this.ready = false;

  this.image = new Image();
  this.image.onload = (function() {
    this.ready = true;
  }).bind( this );
  this.image.src = src;

  G_SpriteList.push( this );
}

Sprite.prototype.draw = function( ctx ) {
  if ( this.ready ) {
    var posvec = this.gameObj.pos();
    ctx.drawImage( this.image, posvec.x, posvec.y );
    return true;
  }
  return false;
}

module.exports = {
  drawLoop: drawLoop,
  Sprite: Sprite
}
