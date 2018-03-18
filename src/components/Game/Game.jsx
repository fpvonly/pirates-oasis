import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';

import DebugFPS from './DebugFPS.jsx';
//import Sprites from './Objects/Sprite';
import {MapData} from './Objects/Map/Map_L1.js'
import {Tile} from './Objects/Map/Tile.js';
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

    this.maxXSpan = 0;
    this.originX = 0;
    this.originY = 0;
    this.tileImages = []; // loaded sprite images for map, empty for this example
    this.generatedTileObjects = [];

    this.selectedX = null;
    this.selectedY = null;
    this.mousePointY = null;
    this.mousePointX = null;

    this.fps = 0;
    this.previousFrameTime = 0;
    this.framesThisSecond = 0;
    this.lastFpsUpdate = 0;

    this.touchControls = false;
    if ("ontouchstart" in document.documentElement) {
      this.touchControls = true;
    }
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
      this.mousePointY = null;
      this.mousePointX = null;
    }, false);

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
    let selectedX = e.pageX;
    let selectedY = e.pageY;
    selectedX = selectedX - this.originX - MapData.tileDiagonalWidth/2 -this.canvasOffsetLeft;
    selectedY = selectedY - this.originY - MapData.tileDiagonalHeight/2 - this.canvasOffsetTop;
    let tileX = Math.round(selectedX / MapData.tileDiagonalWidth - selectedY / MapData.tileDiagonalHeight);
    let tileY = Math.round(selectedX / MapData.tileDiagonalWidth + selectedY / MapData.tileDiagonalHeight);
    this.selectedX = tileX;
    this.selectedY = tileY;

    // for scroll ->
    if (this.selectedX >= 0 && this.selectedX <= 23 && this.selectedY >= 0 && this.selectedY <= 23) {
      this.mousePointY = e.pageY;
      this.mousePointX = e.pageX;
    } else {
      this.mousePointY = null;
      this.mousePointX = null;
    }

    //console.log('this.selectedX', this.selectedX, 'this.selectedY', this.selectedY);
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
    this.maxXSpan = MapData.tileDiagonalWidth/2 * MapData.cols;

    this.initMapTiles();
    this.initPlayerObjects();
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
    for (let x = 0; x < MapData.cols; x++) {
      this.generatedTileObjects.push([]);
      for (let y = 0; y < MapData.rows; y++) {
        let layers = MapData.mapLayers[x][y];
        let offX = x * MapData.tileDiagonalWidth / 2 + y * MapData.tileDiagonalWidth / 2;
        let offY = y * MapData.tileDiagonalHeight / 2 - x * MapData.tileDiagonalHeight / 2;
        let tile = new Tile(
          x,
          y,
          offX,
          offY,
          MapData,
          (MapData.tiles[MapData.map[x][y]].src.indexOf('water_waves.png') !== -1 ? true: false),
          layers,
          this.context
        );
        this.generatedTileObjects[x].push(tile);
      }
    }
  }

  initPlayerObjects = () => {
    this.playerObjects.push(new Player(this.context, this.canvas, 100, 100, 24*75, 0));
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

  drawFrame = () => {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // scroll ->
    if (this.mousePointY !== null && this.mousePointY < window.innerHeight*0.2) {
      this.originY += 55;
    } else if (this.mousePointY !== null && this.mousePointY > window.innerHeight*0.8) {
      this.originY -= 55;
    }
    if (this.mousePointX !== null && this.mousePointX < window.innerWidth*0.2 && this.originX < this.maxXSpan/2) {
      this.originX += 55;
    } else if (this.mousePointX !== null && this.mousePointX > window.innerWidth*0.8) {
      this.originX -= 55;
    }
    this.context.setTransform(1, 0, 0, 1, this.originX, this.originY);

    for(let x = (this.generatedTileObjects.length - 1); x >= 0; x--) {
      for (let y = 0; y < this.generatedTileObjects[x].length; y++) {
        let done = this.generatedTileObjects[x][y].draw((this.selectedX === x && this.selectedY === y ? true : false));
      }
    }

    for (let playerObj of this.playerObjects) {
      playerObj.draw();
    }

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
