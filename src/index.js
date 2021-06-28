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

  onInjured() {
    if (this.health > 0 && gameData.hasGameStarted && this.numCoins < gameData.totalNumCoins) {
      this.health--;
    }
  }
}

class Skeleton extends Sprite {
  coin;
  constructor(xCoord, yCoord, coin) {
    super(xCoord, yCoord);
    this.coin = coin;
    setInterval(() => this.move(), 500);
  }

  move() {
    // skeleton can teleport to land terrain within 1 square of coin
    const SKELETON_RANGE = 3;
    let nextX = this.coin.xCoord + Math.floor(Math.random() * SKELETON_RANGE) - 1;
    let nextY = this.coin.yCoord + Math.floor(Math.random() * SKELETON_RANGE) - 1;
    if (isValidCoordinate(gameMap, nextX, nextY) && landSquareHasTerrain(nextX, nextY, TERRAIN_CODES.LAND)) {
      removeSpriteFromLandSquare(this.xCoord, this.yCoord, this);
      addSpriteToLandSquare(nextX, nextY, this);
      this.xCoord = nextX;
      this.yCoord = nextY;
      if (player.xCoord === this.xCoord && player.yCoord === this.yCoord) {
        player.onInjured();
        playAudio(ATTACK_SOUND);
      }
    }
  }
}

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
  hasGameStarted = false;
}

const SCREEN_SIZE = 8; // width/height of the player's current view of the map
const ATTACK_SOUND = 'attack_sound.m4a';
const DROWNING_SOUND = 'drowning_sound.m4a';
const gameData = new GameData();
const gameMap = generateMatrix();
// player starts in middle of map
const PLAYER_START_X = gameMap[0].length / 2;
const PLAYER_START_Y = gameMap.length / 2;
const player = new Player(PLAYER_START_X, PLAYER_START_Y);
const themeMusic = new Audio('../resources/Theme.mp3');

resetScreenOffsets();

let vue = new Vue({
  el: '#app',
  data: {
    matrix: gameMap,
    gameData: gameData,
    player: player,
    screenSize: SCREEN_SIZE
  },
  methods: {
    movePlayerDown,
    movePlayerUp,
    movePlayerRight,
    movePlayerLeft,
    shouldDrawLand(x, y) {
      return landSquareHasTerrain(x, y, TERRAIN_CODES.LAND);
    },
    shouldDrawLake(x, y) {
      return landSquareHasTerrain(x, y, TERRAIN_CODES.LAKE);
    },
    shouldDrawOcean(x, y) {
      return landSquareHasTerrain(x, y, TERRAIN_CODES.OCEAN);
    },
    shouldDrawPlayer(player, x, y) {
      return player.xCoord === x && player.yCoord === y;
    },
    shouldDrawCoin(x, y) {
      return landSquareContainsSprite(x, y, Coin);
    },
    shouldDrawSkeleton(x, y) {
      return landSquareContainsSprite(x, y, Skeleton);
    },
    onGameStarted() {
      gameData.hasGameStarted = true;
      themeMusic.play();
    },
    toggleMusic() {
      themeMusic.muted = !themeMusic.muted;
    },
    isCoordinateInView(col, row) {
      return col >= gameData.screenXOffset && col < gameData.screenXOffset + SCREEN_SIZE
        && row >= gameData.screenYOffset && row < gameData.screenYOffset + SCREEN_SIZE;
    }
  }
});

function landSquareHasTerrain(x, y, terrainCode) {
  return gameMap[y][x].terrainCode === terrainCode;
}

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
          createCoinAndSkeletonGuard(mapSquare, col, row);
        }
      } else {
        matrix[row].push(new MapSquare(TERRAIN_CODES.LAKE));
      }
    }
  }
  populateOceanTerrain(matrix);
  return matrix;
}

function createCoinAndSkeletonGuard(mapSquare, x, y) {
  coin = new Coin(x, y);
  skeleton = new Skeleton(x, y, coin);
  mapSquare.sprites.push(skeleton);
  mapSquare.sprites.push(coin);
  gameData.totalNumCoins++;
}

/**
 * Identify ocean terrain based on a randomly generated map. Any contiguous body of
 * water that touches the edge of the game map will be ocean.
 */
function populateOceanTerrain(matrix) {
  // top and bottom row
  for (let col = 0; col < matrix[0].length; col++) {
    identifyOceanSquares(matrix, 0, col);
    identifyOceanSquares(matrix, matrix.length - 1, col);
  }
  // first and last column
  for (let row = 0; row < matrix.length; row++) {
    identifyOceanSquares(matrix, row, 0);
    identifyOceanSquares(matrix, row, matrix[0].length - 1);
  }
}

function identifyOceanSquares(matrix, row, col) {
  if (isValidCoordinate(matrix, col, row) && matrix[row][col].terrainCode === TERRAIN_CODES.LAKE) {
    matrix[row][col].terrainCode = TERRAIN_CODES.OCEAN;
    identifyOceanSquares(matrix, row + 1, col);
    identifyOceanSquares(matrix, row - 1, col);
    identifyOceanSquares(matrix, row, col + 1);
    identifyOceanSquares(matrix, row, col - 1);
  }
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
  if (isValidCoordinate(gameMap, x, y)) {
    player.xCoord = x;
    player.yCoord = y;
    onPlayerMoved(x, y);
    
    resetScreenOffsets();
  }
}

function isValidCoordinate(matrix, x, y) {
  return y >= 0 && y < matrix.length && x >= 0 && x < matrix[0].length;
}

function onPlayerMoved(x, y) {
  if (landSquareContainsSprite(x, y, Coin) && player.health > 0) {
    player.numCoins++;
    removeSpriteClassFromLandSquare(x, y, Coin);
  }
  if (landSquareContainsSprite(x, y, Skeleton)) {
    player.onInjured();
    playAudio(ATTACK_SOUND);
  }
  if (landSquareHasTerrain(x, y, TERRAIN_CODES.OCEAN)) {
    player.onInjured();
    playAudio(DROWNING_SOUND);
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
function removeSpriteClassFromLandSquare(x, y, clazz) {
  let index = gameMap[y][x].sprites.findIndex(sprite => sprite instanceof clazz);
  if (index > -1) {
    gameMap[y][x].sprites.splice(index, 1);
  }
}

function removeSpriteFromLandSquare(x, y, sprite) {
  let index = gameMap[y][x].sprites.findIndex(s => s === sprite);
  if (index > -1) {
    gameMap[y][x].sprites.splice(index, 1);
  }
}

function addSpriteToLandSquare(x, y, sprite) {
  gameMap[y][x].sprites.push(sprite);
}

function resetScreenOffsets() {
  gameData.screenYOffset = Math.floor(player.yCoord / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from top of game map
  gameData.screenXOffset = Math.floor(player.xCoord / SCREEN_SIZE) * SCREEN_SIZE; // offset of the player's view from left side of game map
}

function playAudio(fileName) {
  (new Audio('../resources/' + fileName)).play();
}
