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
    this.playerObject = null;
    this.enemies = [];
    this.points = 0;

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
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeCanvas, false);
    window.removeEventListener('mousedown', this.endGame, false);
    window.removeEventListener('keyup', this.endGame, false);
    this.canvas.removeEventListener('mouseleave', this.handleMouseOut, false);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove, false);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.gameState === C.RUN && this.props.gameState === C.RUN) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.gameState === C.RUN && prevProps.gameState === C.STOP) {
      this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
      this.canvas.addEventListener('mouseleave', this.handleMouseOut, false);
      window.addEventListener('keyup', this.endGame, false);
      this.startGame();
    } else if (this.props.gameState === C.STOP && prevProps.gameState === C.RUN) {
      window.removeEventListener('mousedown', this.endGame, false);
      window.removeEventListener('keyup', this.endGame, false);
      this.canvas.removeEventListener('mouseleave', this.handleMouseOut, false);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove, false);
    }
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
    let selectedTileID = this.getTileCoordIndexes(e.pageX, e.pageY);
    let selectedXi = selectedTileID.selectedXTile;
    let selectedYi = selectedTileID.selectedYTile;

    // for scroll ->
    if (selectedXi !== null && selectedYi !== null && selectedXi >= 0 && selectedXi <= 23 && selectedYi >= 0 && selectedYi <= 23) {
      this.mousePointY = e.pageY;
      this.mousePointX = e.pageX;
    } else {
      this.mousePointY = null;
      this.mousePointX = null;
    }
  }

  handleMouseOut= (e) => {
    this.mousePointY = null;
    this.mousePointX = null;
  }

  resizeCanvas = (e) => {
    this.resetGame();
    this.props.setGameState(C.STOP);
  }

  getOriginX = () => {
    return this.originX;
  }

  getOriginY = () => {
    return this.originY;
  }

  getTileCoordIndexes = (x = null, y = null) => {
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
    this.initPlayerObject();
    this.parrot = new Parrot(
      this.context,
      this.canvas,
      60,
      49,
      0,
      12,
      this.getTileCoordinates);
    this.initEnemies();
    this.points = 0;
    this.GAME_OVER = false;
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

  initPlayerObject = () => {
    let initialPosCoords = this.getTileCoordinates(13, 10);
    this.playerObject = new Player(
      this.context,
      this.canvas,
      40,
      40,
      initialPosCoords.tileX + MapData.tileDiagonalWidth/2,
      initialPosCoords.tileY + MapData.tileDiagonalHeight/2,
      this.getOriginX,
      this.getOriginY,
      this.allowedTilesOnLandMapYX,
      this.getTileCoordinates,
      this.getTileCoordIndexes,
      this.getFPS);
  }

  initEnemies = () => {
    this.enemies = [];
    for (let i = 0; i < this.getNumberOfEnemies(); i++) {
      this.enemies.push(
        new EnemyShip(
          this.context,
          this.canvas,
          60,
          49,
          this.allowedTilesOnWaterMapYX,
          this.allowedTilesOnWaterMapXY,
          this.getTileCoordinates,
          this.gameOver,
          i * 5)
      );
    }
  }

  getNumberOfEnemies = () => {
    let value = 1;
    if (window.localStorage) {
      value = localStorage.getItem('number_of_enemies');
    }
    return (value && value !== null ? value : 1);
  }

  getNightmode = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('nightmode');
    }
    return (value !== null && value == 'true' ? true : false);
  }

  getFPSMode = () => {
    let value = false;
    if (window.localStorage) {
      value = localStorage.getItem('fpsmode');
    }
    return (value !== null && value == 'true' ? true : false);
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

    if (this.props.gameState === C.RUN && this.getFPSMode() === true) {
      this.debugFPSREF.updateFPS(this.fps);
    }
  }

  getFPS = () => {
    return this.fps;
  }

  /*
    Basic draw order deciding function for enemy ships.
    Not perfect as the ships are ghost ships, so no need ...

    @returns {array} arranged enemy ship objects in 'back to front' order
  */
  getEnemyDrawOrder = () => {
    let enemyDrawOrder = [];
    for (let enemy of this.enemies) {
      if (enemyDrawOrder.length === 0) {
        enemyDrawOrder.push(enemy);
      } else {
        let index = -1;
        for (let i = enemyDrawOrder.length - 1; i >= 0 ; i--) {
          if (enemy.yI <= enemyDrawOrder[i].yI) {
            index = i;
          }
        }
        if (index === -1) {
           enemyDrawOrder.push(enemy);
        } else {
          enemyDrawOrder.splice(index, 0, enemy);
        }
      }
    }

    return enemyDrawOrder;
  }

  drawFrame = () => {
    // reset
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Map scroll ->
    let tileId = this.getTileCoordIndexes(this.mousePointX, this.mousePointY);
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
    this.playerObject.draw();

    // Draw enemies
    let enemyDrawOrder = this.getEnemyDrawOrder();
    for (let enemy of enemyDrawOrder) {
      if (enemy.initialLoadDone === true && MapData.areTileLayersNextTo(enemy.xI, enemy.yI) === true) {
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
    for (let enemy of enemyDrawOrder) {
      if (enemy.initialLoadDone === true && MapData.areTileLayersNextTo(enemy.xI, enemy.yI) === false) {
        enemy.draw();
      }
    }

    // Draw cannon balls
    this.playerObject.drawCannonBalls();

    // Draw flying parrot on top of everything
    this.parrot.draw();

    // Enemy hits
    for (let enemy of this.enemies) {
      if(enemy.initialLoadDone === true && enemy.destroyed === false) {
        // did player's cannon balls hit the enemy?
        let cannonBalls = this.playerObject.getActiveCannonBalls();
        for (let cannonBall of cannonBalls) {
          if(cannonBall.active === true && cannonBall.didCollideWith(enemy) === true) {
            enemy.destroy();
            cannonBall.active = false; // cannon ball is used now
            this.points++;
            break;
          }
        }
      }
    }

    if (this.GAME_OVER === true) {
      this.drawEndScreen();
    }

    return true;
  }

  drawEndScreen = () => {
    let fontSize = (this.canvas.width/2 >= 960 ? 140 : ((this.canvas.width/2)/960) * 140);
    let textRatio = this.canvas.width/2 >= 960 ? 1 : ((this.canvas.width/2)/960);

    this.context.beginPath();
    this.context.font = fontSize + 'px TreasureMap,Arial';
    this.context.shadowOffsetX = -8 * textRatio;
    this.context.shadowColor = "#002e4f";
    this.context.fillStyle = '#ffffff';
    this.context.textAlign = "center";
    this.context.fillText("GAME OVER!", this.canvas.width/2 - this.originX, ((this.canvas.height/2) * 0.15) - this.originY + 70);
    this.context.fillText("Your score: " + this.points, this.canvas.width/2 - this.originX, this.canvas.height/2 - this.originY);
    this.context.font = '25px TreasureMap,Arial';
    this.context.shadowOffsetX = -4 * textRatio;
    this.context.fillText("Press esc or click on the screen to return to main menu", this.canvas.width/2 - this.originX, (this.canvas.height - this.originY) - 70);
    this.context.closePath();
    this.canvas.style = 'cursor: pointer;' ;
  }

  clearCanvas = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    let canvasWidth = (window.innerWidth > 1024 ? window.innerWidth * 0.8 : window.innerWidth);
    let canvasHeight = (window.innerHeight > 768 ? window.innerHeight * 0.8 : window.innerHeight);
    let canvasVisibility = null;

    if (this.props.gameState === C.RUN) {
      canvasVisibility = {'display': 'block'};
    } else {
      canvasVisibility = {'display': 'none'};
    }

    return <div className={'game_wrapper' + (this.props.gameState === C.RUN && this.getNightmode() === true ? ' night_mode' : '')}>
      <canvas
        ref={this.getCanvasRef}
        id='canvas'
        width={(canvasWidth > 1920 ? 1920 : (canvasWidth > 800 ? canvasWidth : 800))}
        height={(canvasHeight > 1080 ? 1080 : (canvasHeight > 600 ? canvasHeight : 600))}
        style={canvasVisibility}>
          Your browser doesn't support HTML5 canvas API. Please update your browser.
      </canvas>
      {(this.props.gameState === C.RUN && this.getFPSMode() === true ? <DebugFPS ref={this.getDebugFPSRef} /> : null)}
    </div>
  }
}

export default Game;
