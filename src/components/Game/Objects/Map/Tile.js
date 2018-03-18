import Sprites from '../Sprite';

class Tile {

  constructor(xI, yI, offX, offY, MapData, animate = false, layers, canvas, context, getOriginX, getOriginY) {

    this.canvas = canvas;
    this.context = context;

    this.xI = xI;
    this.yI = yI;
    this.offX = offX;
    this.offY = offY;

    this.animationThreshold = 0;
    this.MapData = MapData;
    this.baseTileSprite = Sprites.getTile(MapData.map[xI][yI]);
    if (this.baseTileSprite.src.indexOf('water_waves') !== -1) {
      this.animationThreshold = Math.random() * 20;
    }
    this.currentAnimationIncVal = this.animationThreshold;
    this.speed = 0.5;
    this.animate = animate;
    this.layers = layers;

    this.getOriginX = getOriginX;
    this.getOriginY = getOriginY;
  }

  draw = (selected = false) => {
    if (selected === true) {
      this.context.fillStyle = 'white';
    } else {
      this.context.fillStyle = 'green';
    }

    let isOnScreen = false;
    if (this.getOriginX() + this.offX >= -150 &&
      this.getOriginX() + this.offX <= this.canvas.width &&
      this.getOriginY() + this.offY >= -150 &&
      this.getOriginY() + this.offY <= this.canvas.height) {
        isOnScreen = true;
    }
  /*  context.moveTo(offX, offY + tileDiagonalHeight / 2);
    context.lineTo(offX + tileDiagonalWidth / 2, offY, offX + tileDiagonalWidth, offY + tileDiagonalHeight / 2);
    context.lineTo(offX + tileDiagonalWidth, offY + tileDiagonalHeight / 2, offX + tileDiagonalWidth / 2, offY + tileDiagonalHeight);
    context.lineTo(offX + tileDiagonalWidth / 2, offY + tileDiagonalHeight, offX, offY + tileDiagonalHeight / 2);
    context.closePath();
    context.fill();*/

    if (this.animate === true) {
      if (this.currentAnimationIncVal > this.animationThreshold) {
        this.speed = this.speed * -1;
      } else if (this.currentAnimationIncVal <= 0) {
        this.speed = this.speed * -1;
      }
      this.currentAnimationIncVal = this.currentAnimationIncVal + this.speed;
    }

    if (isOnScreen === true) {
      this.context.drawImage(this.baseTileSprite, this.offX, this.offY, this.baseTileSprite.width, this.baseTileSprite.height - this.currentAnimationIncVal);
    }

    if (isOnScreen === true && this.layers !== null) {
      let layer = null;
      let layerTile = null;
      for (let layer of this.layers) {
        layerTile = Sprites.getTile(layer.tileId);
        this.context.drawImage(
          layerTile,
          (layerTile.width < 150 ? this.offX + layer.offsetX : this.offX),
          this.offY - layer.offsetY,
          layerTile.width,
          layerTile.height
        );
      }
    }

    /*let color = '#fff';
    this.drawOutline(this.offX, this.offY + this.MapData.tileDiagonalHeight / 2, this.offX + this.MapData.tileDiagonalWidth / 2, this.offY, color);
    this.drawOutline(this.offX + this.MapData.tileDiagonalWidth / 2, this.offY, this.offX + this.MapData.tileDiagonalWidth, this.offY + this.MapData.tileDiagonalHeight / 2, color);
    this.drawOutline(this.offX + this.MapData.tileDiagonalWidth, this.offY + this.MapData.tileDiagonalHeight / 2, this.offX + this.MapData.tileDiagonalWidth / 2, this.offY + this.MapData.tileDiagonalHeight, color);
    this.drawOutline(this.offX + this.MapData.tileDiagonalWidth / 2, this.offY + this.MapData.tileDiagonalHeight, this.offX, this.offY + this.MapData.tileDiagonalHeight / 2, color);
    */
    //context.fillStyle = 'white';
    this.context.fillText(this.xI + ", " + this.yI, this.offX + this.MapData.tileDiagonalWidth/2 - 9, this.offY + this.MapData.tileDiagonalHeight/2 + 3);

    return true;
  }

  drawOutline = (x1, y1, x2, y2, color) => {
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }

}

export {Tile};
