import Sprites from './Sprite';

class Tile {

  constructor(xI, yI, x, y, MapData, layers, canvas, context, getOriginX, getOriginY) {

    this.canvas = canvas;
    this.context = context;
    this.xI = xI;
    this.yI = yI;
    this.x = x;
    this.y = y;

    this.MapData = MapData;
    this.baseTileSprite = Sprites.getTile(MapData.map[xI][yI]);
    this.layers = layers;
    this.allowPlayerMovement = layers === null ? false : true; // if there are layers on the tile, no player movement allowed
    this.speed = 0.2;
    this.animate = false;
    if (this.baseTileSprite.src.indexOf('water_waves') !== -1) {
      this.animate = true;
      this.animationThreshold = Math.random() * 20;
      this.currentAnimationIncVal = this.animationThreshold;
    }
    this.getOriginX = getOriginX; // get canvas origo x
    this.getOriginY = getOriginY; // get canvas origo y

    this.shouldBeDrawn = false;
  }

  drawBaseTile = (selected = false) => {
    if (selected === true) {
      this.context.fillStyle = 'white';
    } else {
      this.context.fillStyle = 'green';
    }

    this.shouldBeDrawn = false; // do not draw all tiles that are off canvas visible area
    if (this.getOriginX() + this.x >= -150 &&
      this.getOriginX() + this.x <= this.canvas.width &&
      this.getOriginY() + this.y >= -150 &&
      this.getOriginY() + this.y <= this.canvas.height) {
        this.shouldBeDrawn = true;
    }
    /*this.context.moveTo(this.x, this.y + this.MapData.tileDiagonalHeight / 2);
    this.context.lineTo(this.x + this.MapData.tileDiagonalWidth / 2, this.y, this.x + this.MapData.tileDiagonalWidth, this.y + this.MapData.tileDiagonalHeight / 2);
    this.context.lineTo(this.x + this.MapData.tileDiagonalWidth, this.y +this. MapData.tileDiagonalHeight / 2, this.x + this.MapData.tileDiagonalWidth / 2, this.y + this.MapData.tileDiagonalHeight);
    this.context.lineTo(this.x + this.MapData.tileDiagonalWidth / 2, this.y + this.MapData.tileDiagonalHeight, this.x, this.y + this.MapData.tileDiagonalHeight / 2);
    this.context.closePath();
    this.context.fill();*/

    if (this.shouldBeDrawn === true) {
      if (this.animate === true) {
        if (this.currentAnimationIncVal > this.animationThreshold) {
          this.speed = this.speed * -1;
        } else if (this.currentAnimationIncVal <= 0) {
          this.speed = this.speed * -1;
        }
        this.currentAnimationIncVal = this.currentAnimationIncVal + this.speed;
        this.context.drawImage(this.baseTileSprite, this.x, this.y, this.baseTileSprite.width, this.baseTileSprite.height - this.currentAnimationIncVal);
      } else {
        this.context.drawImage(this.baseTileSprite, this.x, this.y, this.baseTileSprite.width, this.baseTileSprite.height);
      }
    }

    if (this.shouldBeDrawn === true && this.layers !== null) {
      let layer = null;
      let layerTile = null;
      for (let layer of this.layers) {
        layerTile = Sprites.getTile(layer.tileId);
        this.context.drawImage(
          layerTile,
          this.x + layer.offsetX,
          this.y - layer.offsetY,
          layerTile.width,
          layerTile.height
        );
      }
    }

    /*let color = '#fff';
    this.drawOutline(this.x, this.y + this.MapData.tileDiagonalHeight / 2, this.x + this.MapData.tileDiagonalWidth / 2, this.y, color);
    this.drawOutline(this.x + this.MapData.tileDiagonalWidth / 2, this.y, this.x + this.MapData.tileDiagonalWidth, this.y + this.MapData.tileDiagonalHeight / 2, color);
    this.drawOutline(this.x + this.MapData.tileDiagonalWidth, this.y + this.MapData.tileDiagonalHeight / 2, this.x + this.MapData.tileDiagonalWidth / 2, this.y + this.MapData.tileDiagonalHeight, color);
    this.drawOutline(this.x + this.MapData.tileDiagonalWidth / 2, this.y + this.MapData.tileDiagonalHeight, this.x, this.y + this.MapData.tileDiagonalHeight / 2, color);
*/
    this.context.beginPath();
    this.context.shadowOffsetX = 0;
    this.context.fillText(this.xI + ", " + this.yI, this.x + this.MapData.tileDiagonalWidth/2 - 9, this.y + this.MapData.tileDiagonalHeight/2 + 3);
    this.context.closePath();

    return true;
  }

  drawTileLayers = (selected = false) => {
    if (this.shouldBeDrawn === true && this.layers !== null) {
      let layer = null;
      let layerTile = null;
      for (let layer of this.layers) {
        layerTile = Sprites.getTile(layer.tileId);
        this.context.drawImage(
          layerTile,
          this.x + layer.offsetX,
          this.y - layer.offsetY,
          layerTile.width,
          layerTile.height
        );
      }
    }


    return true;
  }

  drawOutline = (x1, y1, x2, y2, color) => {
    this.context.strokeStyle = color;
    this.context.shadowOffsetX = 0;
    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
    this.context.closePath();
  }

}

export {Tile};
