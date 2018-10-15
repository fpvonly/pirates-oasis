import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import PF from 'pathfinding';

import DebugFPS from './DebugFPS.jsx';
import Sprites from './Objects/Sprite';
import {MapData} from './Objects/Map/Map_L1.js' // for now we have only L1
import {Tile} from './Objects/Tile.js';
import Parrot from './Objects/Parrot.js';
import EnemyShip from './Objects/EnemyShip.js';
import Player from './Objects/Player.js';
import * as C from './Constants';

const DEBUG = (process.env.NODE_ENV === 'development' ? true : false);

class Game extends React.Component {

  constructor(props) {
    super(props);

    this.canvas = null;
    this.context = null;
    this.debugFPSREF = null;

    this.canvasOffsetTop = 0;
    this.canvasOffsetLeft = 0;

    this.GAME_OVER = false;
    this.animation = null; // the requested animation frame
    this.scrollSpeed = 50;
    this.scrollY = 0;
    this.scrollX = 0;
    this.playerObjects = []; // all player controlled units
    this.enemies = [];

    this.minXSpan = 0;
    this.maxXSpan = 0;
    this.minYSpan = 0;
    this.maxYSpan = 0;
    this.originX = 0;
    this.originY = 0;
    this.tileImages = []; // loaded sprite images for map, empty for this example
    this.generatedTileObjects = [];
    this.allowedTilesOnLandMapYX = [];
    this.allowedTilesOnWaterMapYX = [];

    this.selectedXTile = null;
    this.selectedYTile = null;
    this.mousePointY = null;
    this.mousePointX = null;

    this.fps = 0;
    this.previousFrameTime = 0;
    this.framesThisSecond = 0;
    this.lastFpsUpdate = 0;
  }

  static defaultProps = {
    gameState: '',
    setGameState: () => {}
  };

  static propTypes = {
    gameState: PropTypes.string,
    setGameState: PropTypes.func
  };

  componentWillMount() {
    window.requestAnimFrame = (function(){
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
          window.setTimeout(callback, 1000/60);
        };
      })();
    window.cancelAnimRequestFrame = (function() {
      return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout
    })();
    window.addEventListener('resize', this.resizeCanvas, false);
    window.addEventListener('keyup', this.gameOver, false);
  }

  componentDidMount () {
    this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
    this.canvas.addEventListener('mouseleave', function(e) {
      this.mousePointY = null;
      this.mousePointX = null;
    }.bind(this), false);

// TODO remove eventually
    this.startGame();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeCanvas, false);
    window.removeEventListener('mousedown', this.endGame, false);
    window.removeEventListener('mousemove', this.endGame, false);
    window.removeEventListener('mouseleave', this.endGame, false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.gameState === C.RUN && this.props.gameState === C.RUN) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    //TODO
    /*if(this.props.gameState === C.RUN && prevProps.gameState === C.STOP) {
      this.startGame();
    }*/
  }

  getCanvasRef = (c) => {
    this.canvas = c;
    this.context = c.getContext("2d");
  }

  getDebugFPSRef = (c) => {
    this.debugFPSREF = c;
  }

  handleMouseMove = (e) => {
    // which tile????? ->
    let selectedTileID = this.getTileCoordId(e.pageX, e.pageY);

    // for scroll ->
    if (selectedTileID.selectedXTile >= 0 && selectedTileID.selectedXTile <= 23 && selectedTileID.selectedYTile >= 0 && selectedTileID.selectedYTile <= 23) {
      this.mousePointY = e.pageY;
      this.mousePointX = e.pageX;
    } else {
      this.mousePointY = null;
      this.mousePointX = null;
    }
  }

  resizeCanvas = (e) => {
    //this.canvas.width = window.innerWidth;
    //  this.canvas.height = window.innerHeight;
    //  this.resetGame();
    //  this.props.setGameState(C.STOP);
  }

  getOriginX = () => {
    return this.originX;
  }

  getOriginY = () => {
    return this.originY;
  }

  getTileCoordId = (x = null, y = null) => {
    if (x === null || y === null) {
      return {selectedXTile: null, selectedYTile: null};
    }

    x = x - this.originX - MapData.tileDiagonalWidth/2 -this.canvasOffsetLeft;
    y = y - this.originY - MapData.tileDiagonalHeight/2 - this.canvasOffsetTop;
    let tileX = Math.round(x / MapData.tileDiagonalWidth - y / MapData.tileDiagonalHeight);
    let tileY = Math.round(x / MapData.tileDiagonalWidth + y / MapData.tileDiagonalHeight);

    if (tileX >= 0 && tileX <= 23 && tileY >= 0 && tileY <= 23) {
      this.selectedYTile = tileY;
      this.selectedXTile = tileX;
    } else {
      this.selectedYTile = null;
      this.selectedXTile = null;
    }

    return {selectedXTile: this.selectedXTile, selectedYTile: this.selectedYTile};
  }

  getTileCoordinates = (x, y) => {
    let xCoord = this.generatedTileObjects[x][y].x;
    let yCoord = this.generatedTileObjects[x][y].y;
    return {tileX: xCoord, tileY: yCoord};
  }

  endGame = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27 || e.type === 'mousedown') {
      this.resetGame();
      this.props.setGameState(C.STOP);
    }
  }

  startGame = () => {
    this.resetGame();
    this.animate();
  }

  resetGame = () => {
    this.context = this.canvas.getContext('2d');
    this.clearCanvas();
    cancelAnimRequestFrame(this.animation);
    this.canvasOffsetTop = this.canvas.getBoundingClientRect().top;
    this.canvasOffsetLeft = this.canvas.getBoundingClientRect().left;
    this.originX = this.canvas.width / 2 - MapData.cols * MapData.tileDiagonalWidth / 2; // tile coord is 0,0 (left tip of the map)
    this.originY = this.canvas.height / 2;
    this.minXSpan = this.originX - MapData.tileDiagonalWidth * MapData.cols/2 + 200;
    this.maxXSpan = this.originX + MapData.tileDiagonalWidth * MapData.cols/2 - 200;
    this.minYSpan = this.originY - MapData.tileDiagonalHeight * MapData.rows/2 + 200;
    this.maxYSpan = this.originY + MapData.tileDiagonalHeight * MapData.rows/2 - 200;

    this.initMapTiles();
    this.initPlayerObjects();
    this.parrot = new Parrot(
      this.context,
      this.canvas,
      60,
      49,
      0,
      12,
      this.getTileCoordinates);
    this.initEnemies();
  }

  gameOver = () => {
    if (this.GAME_OVER === false) {
      window.addEventListener('mousedown', this.endGame, false);
    }
    this.GAME_OVER = true;
  }

  initMapTiles = () => {
    this.generatedTileObjects = [];
    for (let xI = 0; xI < MapData.cols; xI++) {
      this.generatedTileObjects.push([]);
      for (let yI = 0; yI < MapData.rows; yI++) {
        let layers = MapData.mapLayers[xI][yI];
        let offX = xI * MapData.tileDiagonalWidth / 2 + yI * MapData.tileDiagonalWidth / 2;
        let offY = yI * MapData.tileDiagonalHeight / 2 - xI * MapData.tileDiagonalHeight / 2;
        let tile = new Tile(
          xI,
          yI,
          offX,
          offY,
          MapData,
          layers,
          this.canvas,
          this.context,
          this.getOriginX,
          this.getOriginY
        );
        this.generatedTileObjects[xI].push(tile);
      }
    }

    let allowedTilesOnLand = this.createMovableMapBase('land');
    let allowedTilesOnWater = this.createMovableMapBase('water');

    this.allowedTilesOnLandMapYX = allowedTilesOnLand.yx;
    this.allowedTilesOnWaterMapYX = allowedTilesOnWater.yx;
    this.allowedTilesOnLandMapXY = allowedTilesOnLand.xy;
    this.allowedTilesOnWaterMapXY = allowedTilesOnWater.xy;
  }

  initPlayerObjects = () => {
    this.playerObjects = [];
    this.playerObjects.push(new Player(
      this.context,
      this.canvas,
      40,
      40,
      24*75,
      1,
      this.getOriginX,
      this.getOriginY,
      this.allowedTilesOnLandMapYX,
      this.getTileCoordinates,
      this.getFPS));
  }

  initEnemies = () => {
    this.enemies = [];
    let xI = 0;
    let yI = 0;

    for (let i = 0; i < 1; i++) { // TODO
      let mapSide = this.getRndMapSide();

      if (mapSide === 'top') {
        xI = this.getRndInteger(0, 18);
        yI = 0;
      } else if (mapSide === 'bottom') {
        xI = this.getRndInteger(0, 16);
        yI = 23;
      } else if (mapSide === 'left') {
        xI = 0;
        yI = this.getRndInteger(0, 23);
      } else if (mapSide === 'right') {
        xI = 23;
        yI = this.getRndInteger(5, 23);
      }

      this.enemies.push(
        new EnemyShip(
          this.context,
          this.canvas,
          60,
          49,
          xI,
          yI,
          this.allowedTilesOnWaterMapYX,
          this.allowedTilesOnWaterMapXY,
          this.getTileCoordinates,
          this.gameOver)
      );
    }
  }

  createMovableMapBase = (on = 'land') => {
    let movableMap = [];
    let allowedTiles = (on === 'land' ? MapData.allowedTilesOnLand : MapData.allowedTilesOnWater);

    for (let diagonalXToTopRight in MapData.map) {
      let layers = MapData.mapLayers[diagonalXToTopRight];
      movableMap[diagonalXToTopRight] = MapData.map[diagonalXToTopRight].map((tileId, diagonalYToBottomRight) => {
        let allowed = true;

        if (on === 'water') {
          for (let enemyWinTargetsAllowed of MapData.enemyWinTargetPositions) {
            if (enemyWinTargetsAllowed[0] == diagonalXToTopRight && enemyWinTargetsAllowed[1] == diagonalYToBottomRight) {
              return 0; // allowed tower tile for enemy win
            }
          }
          for (let disallowed of MapData.forcedDisallowedTilesOnWater) {
            if (disallowed[0] == diagonalXToTopRight && disallowed[1] == diagonalYToBottomRight) {
              return 1; // disallowed tile
            }
          }
        }

        if (allowedTiles.indexOf(tileId) !== -1) {
          let tileLayers = layers[diagonalYToBottomRight];
          if (Array.isArray(tileLayers) === true) {
            for (let layer of tileLayers) {
              if (allowedTiles.indexOf(layer.tileId) === -1) {
                allowed = false;
              }
            }
          }
        } else {
          allowed = false;
        }

        if (allowed === true) {
          return 0; // reverse logic notation is for pathfinding.js
        } else {
          return 1;
        }
      });
    }

    // We have to convert allowed tiles x,y map to y,x map for Pathfinding.js to work
    let movableMapInYXCoordinates = [];
    for (let yI = 0; yI < MapData.rows; yI++) {
      for (let xI in movableMap) {
        let tiles = movableMap[xI][yI];
        if (typeof movableMapInYXCoordinates[yI] === 'undefined') {
          movableMapInYXCoordinates[yI] = [];
        }
        movableMapInYXCoordinates[yI].push(tiles);
      }
    }

    return {yx: movableMapInYXCoordinates, xy: movableMap};
  }

  animate = (time) => {
    if (time > this.lastFpsUpdate + 1000) { // update fps every second
      this.fps = this.framesThisSecond;
      this.lastFpsUpdate = time;
      this.framesThisSecond = 0;
    }
    this.framesThisSecond++;
    this.animation = requestAnimFrame(this.animate);
    this.drawFrame();

    if (DEBUG === true) {
      this.debugFPSREF.updateFPS(this.fps);
    }
  }

  getFPS = () => {
    return this.fps;
  }

  drawFrame = () => {
    if (this.GAME_OVER === false) {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Map scroll ->
      let tileId = this.getTileCoordId(this.mousePointX, this.mousePointY);
      if (tileId.selectedXTile !== null && tileId.selectedYTile !== null) {
        if (this.mousePointY < window.innerHeight*0.2 && this.originY <= this.maxYSpan) {
          this.originY += this.scrollSpeed;
        } else if (this.mousePointY > window.innerHeight*0.8 && this.originY >= this.minYSpan) {
          this.originY -= this.scrollSpeed;
        }
        if (this.mousePointX < this.canvas.width*0.2 && this.originX <= this.maxXSpan) {
          this.originX += this.scrollSpeed;
        } else if (this.mousePointX > this.canvas.width*0.8 && this.originX >= this.minXSpan) {
          this.originX -= this.scrollSpeed;
        }
      }
      this.context.setTransform(1, 0, 0, 1, this.originX, this.originY); // move origo

      // Draw base tile graphics
      for(let x = this.generatedTileObjects.length - 1; x >= 0; x--) {
        for (let y = 0; y < this.generatedTileObjects[x].length; y++) {
          let done = this.generatedTileObjects[x][y].drawBaseTile((this.selectedXTile === x && this.selectedYTile === y ? true : false));
        }
      }

      // Draw only one player object in this game version
      this.playerObjects[0].draw();

      // Draw enemies
      for (let enemy of this.enemies) {
        if (enemy.xI >= MapData.drawTileLayersBehindEnemyThreshold) {
          enemy.draw();
        }
      }

      // Draw tile layer graphics
      for(let x = this.generatedTileObjects.length - 1; x >= 0; x--) {
        for (let y = 0; y < this.generatedTileObjects[x].length; y++) {
          let done = this.generatedTileObjects[x][y].drawTileLayers((this.selectedXTile === x && this.selectedYTile === y ? true : false));
        }
      }

      // Draw enemies
      for (let enemy of this.enemies) {
        if (enemy.xI < MapData.drawTileLayersBehindEnemyThreshold) {
          enemy.draw();
        }
      }

      // Draw cannon balls
      this.playerObjects[0].drawCannonBalls();

      // Draw flying parrot on top of everything
      this.parrot.draw();
    } else {
      this.drawEndScreen();
    }

    return true;
  }

  drawEndScreen = () => {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    cancelAnimRequestFrame(this.animation);

    let fontSize = (this.canvas.width/2 >= 960 ? 140 : ((this.canvas.width/2)/960) * 140);
    let textRatio = this.canvas.width/2 >= 960 ? 1 : ((this.canvas.width/2)/960);

    this.context.font = fontSize + 'px TreasureMap,Arial';
    this.context.shadowOffsetX = -8 * textRatio;
    this.context.shadowColor = "#002e4f";
    this.context.fillStyle = '#ffffff';
    this.context.textAlign = "center";
    this.context.fillText("GAME OVER!", this.canvas.width/2, ((this.canvas.height/2) * 0.15) + 70);
    this.context.fillText("Your points: " + this.points, this.canvas.width/2, this.canvas.height/2);

    this.context.font = '25px TreasureMap,Arial';
    this.context.shadowOffsetX = -4 * textRatio;
    this.context.fillText("Press esc or click on the screen to return to main menu", this.canvas.width/2, (this.canvas.height) - 70);

    this.canvas.style = 'cursor: pointer;' ;
  }

  clearCanvas = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  getRndMapSide = () => {
    let rnd = this.getRndInteger(1, 4);
    let mapSide = 'top';

    switch (rnd) {
      case 1:
        mapSide = 'top';
        break;
      case 2:
        mapSide = 'right';
        break;
      case 3:
        mapSide = 'bottom';
        break;
      case 4:
        mapSide = 'left';
        break;
    }

    return mapSide;
  }

  getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  render() {
    let canvasWidth = (window.innerWidth > 1024 ? window.innerWidth * 0.8 : window.innerWidth);
    let canvasHeight = (window.innerHeight > 768 ? window.innerHeight * 0.8 : window.innerHeight);

    return <div className='container'>
      <div className={'bg'} />
      <canvas
        ref={this.getCanvasRef}
        id='canvas'
        width={(canvasWidth > 1920 ? 1920 : canvasWidth)}
        height={(canvasHeight > 1080 ? 1080 : canvasHeight)}>
          Your browser doesn't support HTML5 canvas API. Please update your browser.
      </canvas>
      {(DEBUG === true ? <DebugFPS ref={this.getDebugFPSRef} /> : null)}
    </div>
  }
}

export default Game;
