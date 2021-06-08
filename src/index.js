class Sprite {
  xCoord;
  yCoord;
  constructor(xCoord, yCoord) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
  }
}

class Player extends Sprite {
  health = 5;
}

class Skeleton extends Sprite {}

class Coin extends Sprite {}

class Heart extends Sprite {}

class MapSquare {
  sprites = [];
  terrainCode;

  constructor(terrainCode) {
    this.terrainCode = terrainCode;
  }
}

const TERRAIN_CODES = Object.freeze({
  LAKE : 0,
  LAND : 1,
  OCEAN : 2
});

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
    player: new Sprite(PLAYER_START_X, PLAYER_START_Y),
    gameStarted: false,
    screenYOffset: screenYOffset,
    screenXOffset: screenXOffset,
    screenSize: SCREEN_SIZE
  },
  methods: {
    movePlayerDown,
    movePlayerUp,
    movePlayerRight,
    movePlayerLeft,
    shouldDrawLand(x, y) {
      return gameMap[y][x].terrainCode === TERRAIN_CODES.LAND;
    },
    shouldDrawLake(x, y) {
      return gameMap[y][x].terrainCode === TERRAIN_CODES.LAKE;
    },
    shouldDrawPlayer(player, x, y) {
      return player.xCoord === x && player.yCoord === y;
    },
    shouldDrawCoin(x, y) {
      return gameMap[y][x].sprites.some(sprite => sprite instanceof Coin);
    }
  }
});

function generateMatrix() {
  const MATRIX_WIDTH = SCREEN_SIZE * 3;
  const MATRIX_HEIGHT = SCREEN_SIZE * 3;
  const LAND_PROBABILITY = 0.6;
  const COIN_PROBABILITY = 15 / (MATRIX_WIDTH * MATRIX_HEIGHT);
  const matrix = [];
  for (let row = 0; row < MATRIX_WIDTH; row++) {
    matrix.push([]);
    for (let col = 0; col < MATRIX_HEIGHT; col++) {
      if (Math.random() < LAND_PROBABILITY) {
        mapSquare = new MapSquare(TERRAIN_CODES.LAND);
        matrix[row].push(mapSquare);
        if (Math.random() < COIN_PROBABILITY) {
          mapSquare.sprites.push(new Coin());
        }
      } else {
        matrix[row].push(new MapSquare(TERRAIN_CODES.LAKE));
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

function movePlayerToCoordinates(sprite, x, y) {
  if (isValidCoordinate(x, y)) {
    let shouldRedrawScreen = false;

    sprite.xCoord = x;
    sprite.yCoord = y;
    
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
