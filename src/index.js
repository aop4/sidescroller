class MovableSprite {
  xCoord;
  yCoord;
  constructor(xCoord, yCoord) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
  }
}

const SCREEN_SIZE = 8; // width/height of the player's current view of the map
const gameMap = generateMatrix();
// player starts in middle of map
const PLAYER_START_X = gameMap[0].length / 2;
const PLAYER_START_Y = gameMap.length / 2;
let screenYOffset = Math.floor(PLAYER_START_Y / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from top of game map
let screenXOffset = Math.floor(PLAYER_START_X / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from left side of game map

let vue = new Vue({
  el: '#app',
  data: {
    matrix: gameMap,
    player: new MovableSprite(PLAYER_START_X, PLAYER_START_Y),
    gameStarted: false,
    screenYOffset: screenYOffset,
    screenXOffset: screenXOffset,
    screenSize: SCREEN_SIZE
  },
  methods: {
    movePlayerDown,
    movePlayerUp,
    movePlayerRight,
    movePlayerLeft
  }
});

function generateMatrix() {
  const MATRIX_WIDTH = SCREEN_SIZE * 3;
  const MATRIX_HEIGHT = SCREEN_SIZE * 3;
  const LAND_PROBABILITY = 0.6;
  const matrix = [];
  for (let row = 0; row < MATRIX_WIDTH; row++) {
    matrix.push([]);
    for (let col = 0; col < MATRIX_HEIGHT; col++) {
      if (Math.random() < LAND_PROBABILITY) {
        matrix[row].push(1);
      } else {
        matrix[row].push(0);
      }
    }
  }
  return matrix;
}

function movePlayerLeft(sprite) {
  movePlayerToCoordinates(sprite, sprite.xCoord - 1, sprite.yCoord);
}

function movePlayerRight(sprite) {
  movePlayerToCoordinates(sprite, sprite.xCoord + 1, sprite.yCoord);
}

function movePlayerUp(sprite) {
  movePlayerToCoordinates(sprite, sprite.xCoord, sprite.yCoord - 1);
}

function movePlayerDown(sprite) {
  movePlayerToCoordinates(sprite, sprite.xCoord, sprite.yCoord + 1);
}

function movePlayerToCoordinates(movableSprite, x, y) {
  if (isValidCoordinate(x, y)) {
    let shouldRedrawScreen = false;

    movableSprite.xCoord = x;
    movableSprite.yCoord = y;
    
    if (x >= screenXOffset + SCREEN_SIZE) {
      screenXOffset += SCREEN_SIZE;
      shouldRedrawScreen = true;
    } else if (x < screenXOffset) {
      screenXOffset -= SCREEN_SIZE;
      shouldRedrawScreen = true;
    } else if (y >= screenYOffset + SCREEN_SIZE) {
      screenYOffset += SCREEN_SIZE;
      shouldRedrawScreen = true;
    } else if (y < screenYOffset) {
      screenYOffset -= SCREEN_SIZE;
      shouldRedrawScreen = true;
    }

    if (shouldRedrawScreen) {
      vue.$data.screenYOffset = screenYOffset;
      vue.$data.screenXOffset = screenXOffset;
    }
  }
}

function isValidCoordinate(x, y) {
  return y >= 0 && y < gameMap.length && x >= 0 && x < gameMap[0].length;
}
