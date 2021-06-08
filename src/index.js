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
  numCoins = 0;
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

class GameData {
  screenXOffset;
  screenYOffset;
  totalNumCoins = 0;
}

const SCREEN_SIZE = 8; // width/height of the player's current view of the map
const gameMap = generateMatrix();
// player starts in middle of map
const PLAYER_START_X = gameMap[0].length / 2;
const PLAYER_START_Y = gameMap.length / 2;
const player = new Player(PLAYER_START_X, PLAYER_START_Y);

const gameData = new GameData();

resetScreenOffsets();

let vue = new Vue({
  el: '#app',
  data: {
    matrix: gameMap,
    gameData: gameData,
    player: player,
    gameStarted: false,
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
      return landSquareContainsSprite(x, y, Coin);
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
          gameData.numCoins++;
        }
      } else {
        matrix[row].push(new MapSquare(TERRAIN_CODES.LAKE));
      }
    }
  }
  return matrix;
}

function movePlayerLeft(player) {
  movePlayerToCoordinates(player, player.xCoord - 1, player.yCoord);
}

function movePlayerRight(player) {
  movePlayerToCoordinates(player, player.xCoord + 1, player.yCoord);
}

function movePlayerUp(player) {
  movePlayerToCoordinates(player, player.xCoord, player.yCoord - 1);
}

function movePlayerDown(player) {
  movePlayerToCoordinates(player, player.xCoord, player.yCoord + 1);
}

function movePlayerToCoordinates(player, x, y) {
  if (isValidCoordinate(x, y)) {
    player.xCoord = x;
    player.yCoord = y;
    onPlayerMoved(x, y);
    
    resetScreenOffsets();
  }
}

function isValidCoordinate(x, y) {
  return y >= 0 && y < gameMap.length && x >= 0 && x < gameMap[0].length;
}

function onPlayerMoved(x, y) {
  if (landSquareContainsSprite(x, y, Coin)) {
    player.numCoins++;
    removeSpriteFromLandSquare(x, y, Coin);
  }
}

function landSquareContainsSprite(x, y, clazz) {
  return gameMap[y][x].sprites.some(sprite => sprite instanceof clazz);
}

/**
 * Removes the first sprite of type `clazz` found at coordinate `(x, y)` of the game map.
 * @param {*} x x-coordinate (column) in game map
 * @param {*} y y-coordinate (row) in game map
 * @param {*} clazz class of sprite to remove
 */
function removeSpriteFromLandSquare(x, y, clazz) {
  let index = gameMap[y][x].sprites.findIndex(sprite => sprite instanceof clazz);
  if (index > -1) {
    gameMap[y][x].sprites.splice(index, 1);
  }
}

function resetScreenOffsets() {
  gameData.screenYOffset = Math.floor(player.yCoord / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from top of game map
  gameData.screenXOffset = Math.floor(player.xCoord / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from left side of game map
}
