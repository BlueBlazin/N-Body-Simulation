
/************************************************************************
* Region
*************************************************************************/

class Region {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;     /* this is really half the full size */
  }

  contains({ x, y }) {
    return (
      this.x - this.size <= x && 
      x < this.x + this.size && 
      this.y - this.size <= y && 
      y < this.y + this.size
    );
  }

  NE() {
    const { x, y, size } = this;
    const newSize = size/2;
    return new Region(x + newSize, y - newSize, newSize);
  }

  NW() {
    const { x, y, size } = this;
    const newSize = size/2;
    return new Region(x - newSize, y - newSize, newSize);
  }

  SW() {
    const { x, y, size } = this;
    const newSize = size/2;
    return new Region(x - newSize, y + newSize, newSize);
  }

  SE() {
    const { x, y, size } = this;
    const newSize = size/2;
    return new Region(x + newSize, y + newSize, newSize);
  }

  draw(ctx) {
    const { x, y, size } = this;
    
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }
}


/************************************************************************
* Node 
*************************************************************************/

class Node {
  constructor(region) {
    this.region = region;
    this.body = null;
    this.external = true;

    this.NE = null;
    this.NW = null;
    this.SW = null;
    this.SE = null;

    this.cx = 0;        /* center of mass x */
    this.cy = 0;        /* center of mass y */
    this.mass = 0;         /* total mass */
  }

  _equals({ x, y, mass }) {
    return x === this.cx && y === this.cy && mass === this.mass;
  }

  _calcForce({ x: x1, y: y1, mass: m1 }, eps = 3) {
    const { cx: x2, cy: y2, mass: m2 } = this;
    const rx = (x2 - x1);
    const ry = (y2 - y1);
    const r3 = Math.pow(Math.sqrt(rx*rx + ry*ry) + eps, 3);

    let fx = m1 * m2 * rx /r3;
    let fy = m1 * m2 * ry /r3;
    return { fx, fy };
  }
 
  netForce(body, theta = 0.5) {
    let fx = 0;
    let fy = 0;

    if (this.external) {
      return (this._equals(body) ? { fx, fy } : this._calcForce(body));
    }

    /* for internal nodes */
    const d = Math.sqrt((this.cx - body.x)*(this.cx - body.x) + (this.cy - body.y)*(this.cy - body.y));
    const s = this.region.size;

    if (s/d < theta) {
      return this._calcForce(body);
    }

    let subForce;

    if (this.NE !== null) {
      subForce = this.NE.netForce(body);
      fx += subForce.fx;
      fy += subForce.fy;
    }

    if (this.NW !== null) {
      subForce = this.NW.netForce(body);
      fx += subForce.fx;
      fy += subForce.fy;
    }

    if (this.SW !== null) {
      subForce = this.SW.netForce(body);
      fx += subForce.fx;
      fy += subForce.fy;
    }

    if (this.SE !== null) {
      subForce = this.SE.netForce(body);
      fx += subForce.fx;
      fy += subForce.fy;
    }

    return { fx, fy };
  }

  updateCenterOfMass({ x, y, mass }) {
    this.cx = (this.cx*this.mass + x*mass) / (this.mass + mass);
    this.cy = (this.cy*this.mass + y*mass) / (this.mass + mass);
    this.mass += mass;
  }

  _insertInRegion(body) {
    /********  Check NE  *********/
    const NERegion = this.region.NE();
    if (NERegion.contains(body)) {
      this.NE = this.NE === null ? new Node(NERegion) : this.NE;
      this.NE.insert(body);
      return;
    }
    /********  Check NW  *********/
    const NWRegion = this.region.NW();
    if (NWRegion.contains(body)) {
      this.NW = this.NW === null ? new Node(NWRegion) : this.NW;
      this.NW.insert(body);
      return;
    }
    /********  Check SW  *********/
    const SWRegion = this.region.SW();
    if (SWRegion.contains(body)) {
      this.SW = this.SW === null ? new Node(SWRegion) : this.SW;
      this.SW.insert(body);
      return;
    }
    /********  Check SE  *********/
    const SERegion = this.region.SE();
    if (SERegion.contains(body)) {
      this.SE = this.SE === null ? new Node(SERegion) : this.SE;
      this.SE.insert(body);
      return;
    }
  }

  insert(body) {
    this.updateCenterOfMass(body);

    /*******************************************************
    *  No body
    *******************************************************/
    if (this.body === null) {
      this.body = body;
    }
    /*******************************************************
    *  Internal node
    *******************************************************/
    else if (!this.external) {
      this._insertInRegion(body);
    }

    /*******************************************************
    *  External node
    *******************************************************/    
    else {
      const nodeBody = this.body;
      this._insertInRegion(nodeBody);
      this._insertInRegion(body);
      this.external = false;
      this.body = null;
    }
  }

  draw(ctx) {

    if (this.body !== null) {
      const { x, y } = this.body;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    if (!this.external) {
      this.region.draw(ctx);
    }

    if (this.NE) this.NE.draw(ctx);
    if (this.NW) this.NW.draw(ctx);
    if (this.SW) this.SW.draw(ctx);
    if (this.SE) this.SE.draw(ctx);
  }
}


/************************************************************************
* QuadTree
*************************************************************************/

export default class QuadTree {
  constructor(size) {
    this.size = size;
    this.root = new Node(new Region(size/2, size/2, size/2));
  }

  insert(body) {
    this.root.insert(body);
  }

  getNetForce(body) {
    return this.root.netForce(body);
  }

  draw(ctx) {
    ctx.strokeRect(0, 0, this.size, this.size);
    this.root.draw(ctx);
  }
}