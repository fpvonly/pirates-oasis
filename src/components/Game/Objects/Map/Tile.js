class Tile {

  constructor(x, y, offX, offY, MapData, animate = false, layers, context) {
    this.x = x;
    this.y = y;
    this.offX = offX;
    this.offY = offY;
    this.context = context;
    this.subtr = 0;
    this.MapData = MapData;
    this.baseTileSprite = MapData.tiles[MapData.map[x][y]];
    if (this.baseTileSprite.src.indexOf('water_waves') !== -1) {
      this.subtr = Math.random() * 20;
    }
    this.curretnSubtr = this.subtr;
    this.speed = 0.5;
    this.animate = animate;
    this.layers = layers;

// TODO use preloaded sprites
    this.img = new Image();
  }

  draw = (selected = false) => {
    this.img.src = this.baseTileSprite.src;

    if (selected === true) {
      this.context.fillStyle = 'white';
    } else {
      this.context.fillStyle = 'green';
    }
  /*  context.moveTo(offX, offY + tileDiagonalHeight / 2);
    context.lineTo(offX + tileDiagonalWidth / 2, offY, offX + tileDiagonalWidth, offY + tileDiagonalHeight / 2);
    context.lineTo(offX + tileDiagonalWidth, offY + tileDiagonalHeight / 2, offX + tileDiagonalWidth / 2, offY + tileDiagonalHeight);
    context.lineTo(offX + tileDiagonalWidth / 2, offY + tileDiagonalHeight, offX, offY + tileDiagonalHeight / 2);
    context.closePath();
    context.fill();*/

    if (this.animate === true) {
      if (this.curretnSubtr > this.subtr) {
        this.speed = this.speed * -1;
      } else if (this.curretnSubtr <= 0) {
        this.speed = this.speed * -1;
      }
      this.curretnSubtr = this.curretnSubtr + this.speed;
    }

    this.context.drawImage(this.img, this.offX, this.offY, this.baseTileSprite.width, this.baseTileSprite.height - this.curretnSubtr);

    if (this.layers !== null) {
      let layer = null;
      let layerTile = null;
      for (let layer of this.layers) {
        layerTile = this.MapData.tiles[layer.tileId];
    //TODO preload sprites
        let img = new Image();
        img.src = layerTile.src;
        this.context.drawImage(
          img,
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
    this.context.fillText(this.x + ", " + this.y, this.offX + this.MapData.tileDiagonalWidth/2 - 9, this.offY + this.MapData.tileDiagonalHeight/2 + 3);

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
