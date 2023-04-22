const SCALE = 2;
const WIDTH = 16;
const HEIGHT = 18;
const SCALED_WIDTH = SCALE * WIDTH;
const SCALED_HEIGHT = SCALE * HEIGHT;
const CYCLE_LOOP = [0, 1, 0, 2];
const FACING_DOWN = 0;
const FACING_UP = 1;
const FACING_LEFT = 2;
const FACING_RIGHT = 3;
const FRAME_LIMIT = 12;
const MOVEMENT_SPEED = 1;



let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let keyPresses = {};
let currentDirection = FACING_DOWN;
let currentLoopIndex = 0;
let frameCount = 0;
let positionX = 0;
let positionY = 0;


let img = new Image();
let static_img = [];
let determined_Xpos = [];
let determined_Ypos = [];

let boxes = [];


let prevX = 0;
let prevY = 0;

window.addEventListener('keydown', keyDownListener);
function keyDownListener(event) {
    keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event) {
    keyPresses[event.key] = false;
}

function loadImage() {
  img.src = './img/Green-Char.png';

  let box = document.getElementById('weather-box0');
  box.style.position = 'absolute';
  box.style.top=0;
  box.style.left=0;
  box.style.margin = "30px 0px 0px 100px"

  boxes.push(box);

  for (let x = 0; x < 8; x++) {

    // Handle images
    let imgx = new Image();
    if (0.5 < Math.random()) {
      imgx.src = './img/Red-Char.png';
    } else {
      imgx.src = './img/Blue-Char.png';
    }
    static_img.push(imgx);
  
    let given_x = Math.floor(Math.random() * (600 - 20) + 20);
    let given_y = Math.floor(Math.random() * (650 - 20) + 20);
  
    determined_Xpos.push(given_x);
    determined_Ypos.push(given_y);

    // Handle boxes
    let box_name = "weather-box" + (x+1);
    let cur_box = document.getElementById(box_name);

    

    cur_box.style.position = 'absolute';
    cur_box.style.top = 150;
    cur_box.style.left = 200;
    cur_box.style.margin = (given_y - 30) +"px 0px 0px "+ (given_x + 40)+ "px";

    boxes.push(cur_box);

  
  }

  

  img.onload = function() {
    window.requestAnimationFrame(gameLoop);
  };
}

function drawFrame(frameX, frameY, canvasX, canvasY) {
    ctx.drawImage(img,
                    frameX * WIDTH, frameY * HEIGHT, WIDTH, HEIGHT,
                    canvasX, canvasY, SCALED_WIDTH, SCALED_HEIGHT);
    

    
    if (prevX != canvasX) {
        if (prevX < canvasX) {
            boxes[0].style.left = parseInt(boxes[0].style.left) + (1) + 'px';
            prevX = canvasX;
        } else {
            boxes[0].style.left = parseInt(boxes[0].style.left) - (1) + 'px';
            prevX = canvasX;
        }
    }
    
    if (prevY != canvasY) {
        if (prevY < canvasY) {
          boxes[0].style.top = parseInt(boxes[0].style.top) + (1) + 'px';
            prevY = canvasY;
        } else {
          boxes[0].style.top = parseInt(boxes[0].style.top) - (1) + 'px';
            prevY = canvasY;
        }
    }

    for (let x = 0; x < 8; x++) {
      ctx.drawImage(static_img[x], 0, 0, WIDTH, HEIGHT,
        determined_Xpos[x], determined_Ypos[x], SCALED_WIDTH, SCALED_HEIGHT);
    }

    
    // ctx.drawImage(img2,
    //     0, 0, WIDTH, HEIGHT,
    //     5, 5, SCALED_WIDTH, SCALED_HEIGHT);

        // box.style.position = 'absolute';
}

loadImage();

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let hasMoved = false;

  if (keyPresses.w) {
    moveCharacter(0, -MOVEMENT_SPEED, FACING_UP);
    hasMoved = true;
  } else if (keyPresses.s) {
    moveCharacter(0, MOVEMENT_SPEED, FACING_DOWN);
    hasMoved = true;
  }

  if (keyPresses.a) {
    moveCharacter(-MOVEMENT_SPEED, 0, FACING_LEFT);
    hasMoved = true;
  } else if (keyPresses.d) {
    moveCharacter(MOVEMENT_SPEED, 0, FACING_RIGHT);
    hasMoved = true;
  }

  if (hasMoved) {
    frameCount++;
    if (frameCount >= FRAME_LIMIT) {
      frameCount = 0;
      currentLoopIndex++;
      if (currentLoopIndex >= CYCLE_LOOP.length) {
        currentLoopIndex = 0;
      }
    }
  }
  
  if (!hasMoved) {
    currentLoopIndex = 0;
  }

  drawFrame(CYCLE_LOOP[currentLoopIndex], currentDirection, positionX, positionY);
  window.requestAnimationFrame(gameLoop);
}

function moveCharacter(deltaX, deltaY, direction) {
  if (positionX + deltaX > 0 && positionX + SCALED_WIDTH + deltaX < canvas.width) {
    positionX += deltaX;
  }
  if (positionY + deltaY > 0 && positionY + SCALED_HEIGHT + deltaY < canvas.height) {
    positionY += deltaY;
  }
  currentDirection = direction;
}