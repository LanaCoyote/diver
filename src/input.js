
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

InputManager.prototype.isKeyDown = function( key, bind ) {
  return !!this.keyspressed[key];
}

module.exports = InputManager;
