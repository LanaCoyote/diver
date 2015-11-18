function clearCtx( ctx ) {
  ctx.fillStyle = "black";
  ctx.fillRect( 0,0, ctx.canvas.width, ctx.canvas.height );
}

function drawLoop( ctx ) {
  clearCtx( ctx );
  G_SpriteList.forEach( function( sprite ) {
    sprite.draw( ctx );
  } );
}

/******************************************************************************
                              Sprite
******************************************************************************/
var G_SpriteList = [];

function Sprite( gameObj,src ) {
  this.transform = gameObj.transform || gameObj.aabb || null
  if ( !this.transform ) return console.error( "Attempted to initialize a sprite without a transform property" );
  this.parent = gameObj;
  gameObj.sprite = this;

  this.ready = false;

  this.image = new Image();
  this.image.onload = (function() {
    this.ready = true;
  }).bind( this );
  this.image.src = src;
  if ( this.transform.diagonal ) {
    this.image.width = this.transform.diagonal.x;
    this.image.height = this.transform.diagonal.y;
  }

  G_SpriteList.push( this );
}

Sprite.prototype.draw = function( ctx ) {
  if ( this.ready ) {
    var posvec = this.transform.topleft ? this.transform.topleft() : this.transform.pos;
    ctx.drawImage( this.image, posvec.x, posvec.y, this.image.width, this.image.height );
    return true;
  }
  return false;
}

module.exports = {
  drawLoop: drawLoop,
  Sprite: Sprite
}
