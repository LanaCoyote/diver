

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

