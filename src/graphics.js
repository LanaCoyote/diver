var Vector = require( './vector' );
var bg = require( './background' );

function clearCtx( ctx ) {
  ctx.fillStyle = "black";
  ctx.fillRect( 0,0, ctx.canvas.width, ctx.canvas.height );
}

function drawLoop( ctx ) {
  // clearCtx( ctx ); // not necessary if we redraw the background every frame
  bg.drawBackground( ctx );

  // draw each sprite
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

  // find the first valid transform object attached to our parent
  this.transform = gameObj.transform || gameObj.aabb || gameObj.circle || null
  if ( !this.transform ) return console.error( "Attempted to initialize a sprite without a transform property" );

  // associate our objects together
  this.parent = gameObj;
  gameObj.sprite = this;

  // don't draw until loaded
  this.ready = false;

  // set the sprite's angle and flipped to defaults
  this.angle = 0;
  this.flipped = false;

  // initialize our image object
  this.image = new Image();
  this.image.onload = (function() {
    this.ready = true;
  }).bind( this );
  this.image.src = src;

  // set the size based on the parent's collision model
  if ( this.transform.diagonal ) {

    this.image.width = this.transform.diagonal.x;
    this.image.height = this.transform.diagonal.y;

  } else if ( this.transform.radius ) {
    
    this.image.width = this.image.height = this.transform.radius * 2;
  
  }

  // add this sprite to the sprite list
  G_SpriteList.push( this );

}

Sprite.prototype.draw = function( ctx ) {

  // only draw if you're ready
  if ( this.ready ) {

    // find out where to draw our sprite
    var posvec;
    if ( this.transform.topleft ) {
      posvec = this.transform.topleft();
    } else if ( this.parent.circle ) {
      posvec = this.parent.circle.pos.sub( new Vector( this.parent.circle.radius, this.parent.circle.radius ) );
    } else {
      posvec = this.transform.pos;
    }

    // save the canvas context
    ctx.save();

    // set up our transform matrix
    ctx.translate( posvec.x + this.image.width/2, posvec.y + this.image.height/2 )
    ctx.rotate( this.angle );
    ctx.scale( this.image.width, this.flipped ? -this.image.height : this.image.height );

    // draw the image at the center of our matrix
    ctx.drawImage( this.image, this.image.width/-2, this.image.height/-2 );

    // restore the canvas context to its earlier state
    ctx.restore();

    return true;
  
  }
  
  return false;

}

module.exports = {
  drawLoop: drawLoop,
  clearSprites: clearSprites,
  Sprite: Sprite
}
