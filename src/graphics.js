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
