import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import PF from 'pathfinding';

import DebugFPS from './DebugFPS.jsx';
import Sprites from './Objects/Sprite';
import {MapData} from './Objects/Map/Map_L1.js'
import {Tile} from './Objects/Map/Tile.js';
import Parrot from './Objects/Parrot.js';
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
    this.scrollSpeed = 1;
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
    this.allowedTilesOnLandMap = [];
    this.allowedTilesOnWaterMap = [];

    this.selectedXTile = null;
    this.selectedYTile = null;
    this.mousePointY = null;
    this.mousePointX = null;

    this.fps = 0;
    this.previousFrameTime = 0;
    this.framesThisSecond = 0;
    this.lastFpsUpdate = 0;

    this.mouseOnCanvas = false;

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
    window.addEventListener('keyup', this.endGame, false);
    document.addEventListener("visibilitychange", this.handleDocumentVisibilityChange, false); // reset game if user changes tab
  }

  componentDidMount () {
    this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
    this.canvas.addEventListener('mouseleave', function(e) {
    //  this.canvas.removeEventListener('mousemove', this.handleMouseMove, false);
    //  this.canvas.addEventListener('mouseenter', this.handleMouseMove, false);
      this.mouseOnCanvas = false;
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

  handleDocumentVisibilityChange = () => {
    if (document.hidden === true) {
      this.resetGame();
      this.props.setGameState(C.STOP);
    }
  }

  resizeCanvas = (e) => {
    //this.canvas.width = window.innerWidth;
    //  this.canvas.height = window.innerHeight;
    //  this.resetGame();
    //  this.props.setGameState(C.STOP);
  }

  handleMouseMove = (e) => {
    // which tile????? ->
    this.mouseOnCanvas = true;
    let selectedX = e.pageX;
    let selectedY = e.pageY;
    selectedX = selectedX - this.originX - MapData.tileDiagonalWidth/2 -this.canvasOffsetLeft;
    selectedY = selectedY - this.originY - MapData.tileDiagonalHeight/2 - this.canvasOffsetTop;
    let tileX = Math.round(selectedX / MapData.tileDiagonalWidth - selectedY / MapData.tileDiagonalHeight);
    let tileY = Math.round(selectedX / MapData.tileDiagonalWidth + selectedY / MapData.tileDiagonalHeight);
    this.selectedXTile = tileX;
    this.selectedYTile = tileY;
    // for scroll ->
    if (this.mouseOnCanvas && this.selectedXTile >= 0 && this.selectedXTile <= 23 && this.selectedYTile >= 0 && this.selectedYTile <= 23) {
      this.mousePointY = e.pageY;
      this.mousePointX = e.pageX;
    } else {
      this.mousePointY = null;
      this.mousePointX = null;
    }

    //console.log('this.selectedXTile', this.selectedXTile, 'this.selectedYTile', this.selectedYTile);
  }

  getOriginX = () => {
    return this.originX;
  }

  getOriginY = () => {
    return this.originY;
  }

  getTargetTileCoordinates = (x, y) => {
    let xCoord = this.generatedTileObjects[x][y].offX;
    let yCoord = this.generatedTileObjects[x][y].offY;
//console.log('xCoord', xCoord, 'yCoord', yCoord);
    return {tileX: xCoord, tileY: yCoord}
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
    this.minXSpan = this.originX - MapData.tileDiagonalWidth * MapData.cols/2;
    this.maxXSpan = this.originX + MapData.tileDiagonalWidth * MapData.cols/2;
    this.minYSpan = this.originY - MapData.tileDiagonalHeight * MapData.rows/2;
    this.maxYSpan = this.originY + MapData.tileDiagonalHeight * MapData.rows/2;

    this.initMapTiles();
    this.initPlayerObjects();
    this.parrot = new Parrot(
      this.context,
      this.canvas,
      60,
      49,
      0,
      12,
      this.getTargetTileCoordinates);
  }

  gameOver = () => {
    let fontSize = (this.canvas.width/2 >= 960 ? 100 : ((this.canvas.width/2)/960) * 100);
    this.context.fillStyle = '#FFFFFF';
    this.context.textAlign = "center";
    this.context.fillText("Press esc or click on the screen to return to main menu", this.canvas.width/2, (this.canvas.height) - 70);
    this.canvas.style = 'cursor: pointer;' ;
    if (this.GAME_OVER === false) {
      window.addEventListener('mousedown', this.endGame, false);
    }
    this.GAME_OVER = true;
  }

  initMapTiles = () => {
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

    this.allowedTilesOnLandMap = this.createMovableMapBase('land');
    this.allowedTilesOnWaterMap = this.createMovableMapBase('water');
  }

  createMovableMapBase = (on = 'land') => {
    let movableMap = [];
    let allowedTiles = (on === 'land' ? MapData.allowedTilesOnLand : MapData.allowedTilesOnWater);
    for (let diagonalXToTopRight in MapData.map) {
      let layers = MapData.mapLayers[diagonalXToTopRight];
      movableMap[diagonalXToTopRight] = MapData.map[diagonalXToTopRight].map((tileId, diagonalYToBottomRight) => {
        let allowed = true;
        // exceptions for allowed tiles, even thought those have obstacle layers
      /*  if (diagonalXToTopRight == 11 && diagonalYToBottomRight == 11) {

          allowed = true
        } else {*/
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
        //}

        if (allowed === true) {
          return 0;
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

    return movableMapInYXCoordinates;
  }

  initPlayerObjects = () => {
    this.playerObjects.push(new Player(
      this.context,
      this.canvas,
      40,
      40,
      24*75,
      1,
      this.getOriginX,
      this.getOriginY,
      this.allowedTilesOnLandMap,
      this.getTargetTileCoordinates,
      this.getFPS));
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
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // scroll ->
    if (this.mousePointY !== null && this.mousePointY < window.innerHeight*0.2 && this.originY <= this.maxYSpan) {
      this.originY += 25;
    } else if (this.mousePointY !== null && this.mousePointY > window.innerHeight*0.8 && this.originY >= this.minYSpan) {
      this.originY -= 25;
    }
    if (this.mousePointX !== null && this.mousePointX < this.canvas.width*0.2 && this.originX <= this.maxXSpan) {
      this.originX += 25;
    } else if (this.mousePointX !== null && this.mousePointX > this.canvas.width*0.8 && this.originX >= this.minXSpan) {
      this.originX -= 25;
    }

    this.context.setTransform(1, 0, 0, 1, this.originX, this.originY); // move origo

    for(let x = this.generatedTileObjects.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.generatedTileObjects[x].length; y++) {
        let done = this.generatedTileObjects[x][y].drawBaseTile((this.selectedXTile === x && this.selectedYTile === y ? true : false));
      }
    }

    this.playerObjects[0].draw(); // only one player object in this game version

    for(let x = this.generatedTileObjects.length - 1; x >= 0; x--) {
      for (let y = 0; y < this.generatedTileObjects[x].length; y++) {
        let done = this.generatedTileObjects[x][y].drawTileLayers((this.selectedXTile === x && this.selectedYTile === y ? true : false));

      }
    }

    this.parrot.draw();

    return true;
  }

  clearCanvas = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  render() {
    let canvasWidth = (window.innerWidth > 1024 ? window.innerWidth * 0.8 : window.innerWidth);
    let canvasHeight = (window.innerHeight > 768 ? window.innerHeight * 0.8 : window.innerHeight);

    return <div className='container'>
      <div className={'bg'} />
      <canvas
        ref={this.getCanvasRef}
        id='canvas'
        width={canvasWidth}
        height={canvasHeight}>
          Your browser doesn't support HTML5 canvas API. Please update your browser.
      </canvas>
      {(DEBUG === true ? <DebugFPS ref={this.getDebugFPSRef} /> : null)}
    </div>
  }
}

export default Game;
