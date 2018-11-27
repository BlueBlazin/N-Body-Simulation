import QuadTree from './qtree';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerWidth;

class Body {
  constructor(x, y, vx = 0, vy = 0, minMass = 5000, maxMass = 7000) {
    this.x = x;
    this.y = y;
    const massDiff = maxMass - minMass;
    this.mass = minMass + Math.random() * massDiff;
    this.r = (massDiff + 2*(this.mass - minMass))/massDiff;
    this.color = `rgb(${Math.random()*255}, 20, ${Math.random()*255})`
    this.vx = vx;
    this.vy = vy;
  }

  update({ fx, fy }, dt = 0.016) {
    const ax = fx / this.mass;
    const ay = fy / this.mass;

    this.vx += (ax * dt);
    this.vy += (ay * dt);

    this.x += (this.vx * dt);
    this.y += (this.vy * dt);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}



/********************************************************************
*  TEST CODE
*********************************************************************/

function makeBodies(n = 2) {
  const bodies = [];
  for (var i = 0; i < n; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.width;
    const signx = Math.random() < 0.5 ? -1 : 1;
    const signy = Math.random() < 0.5 ? -1 : 1;
    const vx = (5 + Math.random()*5) * signx;
    const vy = (5 + Math.random()*5) * signy;

    const body = new Body(x, y, vx, vy);
    bodies.push(body);
  }
  return bodies;
}

function makeBodiesSystem() {
  const bodies = [];
  bodies.push(new Body(canvas.width/2, canvas.height/2, 0, 0, 1990000, 1990001)); // sun
  bodies.push(new Body(canvas.width/2 + 200, canvas.height/2 - 100, 60, 40, 1000, 1001)); // planet1
  bodies.push(new Body(canvas.width/2 + 200, canvas.height/2 - 300, 70, 25, 1200, 1201)); // planet2
  bodies.push(new Body(canvas.width/2 - 150, canvas.height/2 + 150, 80, 0, 1100, 1101)); // planet3
  bodies.push(new Body(canvas.width/2 - 220, canvas.height/2 + 200, -45, 5, 1000, 1101)); // planet3
  return bodies;
}

function makeBodiesSpiral(n = 1000, speed = 50, noise = 25) {
  const bodies = [];

  /** Archimedean spiral ***
  ***  r = a + bθ 
  *************************/
  const a = 40;
  const b = 3;

  for (var t = 0; t < n; t++) {
    const theta = 0.1 * t;

    const r = a + b * theta + (Math.random() * noise);
    const x = canvas.width/2 + r * Math.cos(theta);
    const y = canvas.height/2 + r * Math.sin(theta);
    
    let vx = -r * Math.sin(theta);
    let vy = r * Math.cos(theta);
    vx = speed * vx/Math.sqrt(vx*vx + vy*vy);
    vy = speed * vy/Math.sqrt(vx*vx + vy*vy);
    
    bodies.push(new Body(x, y, vx, vy, 1000, 10000));
  }

  return bodies;
}

function makeBodiesDoubleSpiral(n1 = 700, n2 = 300, speed = 10, noise = 20) {
  const bodies = [];

  const a = 25;
  const b = 3;

  for (var t = 0; t < n1; t++) {
    const theta = 0.1 * t;

    const r = a + b * theta + (Math.random() * noise);
    const x = (canvas.width/2 - 150) + r * Math.cos(theta);
    const y = (canvas.height/2 + 100) + r * Math.sin(theta);
    
    let vx = -r * Math.sin(theta);
    let vy = r * Math.cos(theta);
    vx = speed * vx/Math.sqrt(vx*vx + vy*vy);
    vy = speed * vy/Math.sqrt(vx*vx + vy*vy);
    
    bodies.push(new Body(x, y, vx, vy, 1000, 10000));
  }

  for (var t = 0; t < n2; t++) {
    const theta = 0.1 * t;

    const r = a + b * theta + (Math.random() * noise);
    const x = (canvas.width/2 + 300) + r * Math.cos(theta);
    const y = (canvas.height/2 - 50) + r * Math.sin(theta);
    
    let vx = -r * Math.sin(theta);
    let vy = r * Math.cos(theta);
    vx = speed * vx/Math.sqrt(vx*vx + vy*vy);
    vy = speed * vy/Math.sqrt(vx*vx + vy*vy);
    
    bodies.push(new Body(x, y, vx, vy, 1000, 10000));
  }

  return bodies;
}

function getQuadTree(bodies) {
  const qt = new QuadTree(canvas.width);
  for (var i = 0; i < bodies.length; i++) 
    qt.insert(bodies[i]);
  return qt;
}

function remainingBodies(bodies) {
  return bodies.filter(({ x, y }) => x > 0 && x < canvas.width && y > 0 && y < canvas.height);
}

/********************************************************************
* animation
********************************************************************/

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  bodies = remainingBodies(bodies);
  const qt = getQuadTree(bodies);

  bodies.forEach((body, i) => {
    const force = qt.getNetForce(body)
    body.draw(ctx);
    body.update(force);
  });
}

let bodies = makeBodiesDoubleSpiral();
animate();