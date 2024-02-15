// CONSTANTS
const MAX_ATTEMPTS = 50;
const INITIAL_SHAPES = 100;
const MAX_NUM_SHAPES = 1000;
const MIN_RAD = 3;
const PLACEMENT_DELAY = 1; // ms

// variables
let MAX_SHAPE_SIZE = -1; // (set after canvas is initialized)
let shapes = [];
let startTime = 0;
let shapeIndex = 0;


const TRIANGLE_K = Math.sqrt(3.0);

//fill biggest polygon
function setup() {
  createCanvas(390, 1215);
  MAX_SHAPE_SIZE = min(width, height) * 0.3 / 2.0; // maximum shape size?
  // setup calculations here

  // we assume all shapes are circles for now
  // shape: [ [x, y], radius ]

  // ∀shape in shapes, if sdf(shape, x, y) - shapeSize < 0, it is NOT safe
  for (let i = 0; i < INITIAL_SHAPES; i++) {
    addShape();
  }

  console.log('done! # shapes: ' + shapes.length);
  background(0);
}

function addShape() {
  if (shapes.length >= MAX_NUM_SHAPES) {
    return false;
  }

  let center = undefined;

  //check that the shape doesnt start in another shape
  let safe = false;
  let attempts = 0;
  let maxRadius;
  while (!safe) {
    center = createVector(random(width), random(height));
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      break;
    }
    safe = true; // innocent until proven guilty
    maxRadius = MAX_SHAPE_SIZE;
    for (let j = 0; j < MAX_ATTEMPTS; j++) {
      for (let shape of shapes) {
        let d = circleSDF(shape, center);
        maxRadius = Math.min(d, maxRadius);
        if (d - MIN_RAD < 0) {
          safe = false; // guilty
          break;
        }
      }
    }
  }
  if (!safe) {
    return false;
  }
  //try to grow as much as possible
  shapes.push([center, maxRadius]);
  //radius = minimumDist;
  return true;
}

// circlePos: 2dVector[float, y] ; circleRad: radius, samplePos: 2dVector[x, y]
//circleshape -> [p5jsvector, radius]
//samplePos -> p5jsvector
function circleSDF(circleShape, samplePos) {
  let x = circleShape[0].x;
  let y = circleShape[0].y;
  let r = circleShape[1];
  return dist(x, y, samplePos.x, samplePos.y) - r;
}


function clamp(x, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, x));
}
function length(x, y) {
  return Math.sqrt(x * x + y * y);
}
function sign(x) {
  return x < 0 ? -1 : 1;
}

function triangleSDF(triangleShape, samplePos) {
  /*
  float sdEquilateralTriangle( in vec2 p, in float r )
  {
      const float k = sqrt(3.0);
      p.x = abs(p.x) - r;
      p.y = p.y + r/k;
      if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
      p.x -= clamp( p.x, -2.0*r, 0.0 );
      return -length(p)*sign(p.y);
  }
  */



  let px = abs(samplePos[0]) - triangleSize;
  let py = samplePos[1] + triangleSize / TRIANGLE_K;

  if (px + TRIANGLE_K * py > 0.0) {
    const ppx = px;
    const ppy = py;
    px = (ppx - TRIANGLE_K * ppy) / 2.0;
    py = (-TRIANGLE_K * ppx - ppy) / 2.0;
  }

  px -= clamp(px, -2.0 * triangleSize, 0.0);

  return -length(px, py) * sign(py);
}

function drawCircleShape(shape) {
  ellipse(shape[0].x, shape[0].y, shape[1] * 2.0, shape[1] * 2.0);
}

function drawTriangleShape(shape) {
  const r = shape[1];
  //
  triangle()
}

let shapeReady = false;
function draw() {
  if (shapeIndex >= shapes.length) {
    noLoop();
    return;
  }
  if (millis() - startTime > PLACEMENT_DELAY) {
    startTime = millis();
    let s = shapes[shapeIndex][1]; // shape size
    let brightness = clamp(255 / s * 2.0, 20, 255);
    fill(brightness);
    noStroke();
    // stroke(brightness + 10);
    drawCircleShape(shapes[shapeIndex]);
    shapeIndex++;
    shapeReady = false;
  }

  if (!shapeReady) {
    // try to generate the next shape
    // if not, it's ok
    for (let i = 0; i < 1; i++) {
      if (addShape()) {
        shapeReady = true;
        break;
      }
    }
  }

}

