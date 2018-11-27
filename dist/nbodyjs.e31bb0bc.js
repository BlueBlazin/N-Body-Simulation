// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"qtree.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/************************************************************************
* Region
*************************************************************************/
var Region =
/*#__PURE__*/
function () {
  function Region(x, y, size) {
    _classCallCheck(this, Region);

    this.x = x;
    this.y = y;
    this.size = size;
    /* this is really half the full size */
  }

  _createClass(Region, [{
    key: "contains",
    value: function contains(_ref) {
      var x = _ref.x,
          y = _ref.y;
      return this.x - this.size <= x && x < this.x + this.size && this.y - this.size <= y && y < this.y + this.size;
    }
  }, {
    key: "NE",
    value: function NE() {
      var x = this.x,
          y = this.y,
          size = this.size;
      var newSize = size / 2;
      return new Region(x + newSize, y - newSize, newSize);
    }
  }, {
    key: "NW",
    value: function NW() {
      var x = this.x,
          y = this.y,
          size = this.size;
      var newSize = size / 2;
      return new Region(x - newSize, y - newSize, newSize);
    }
  }, {
    key: "SW",
    value: function SW() {
      var x = this.x,
          y = this.y,
          size = this.size;
      var newSize = size / 2;
      return new Region(x - newSize, y + newSize, newSize);
    }
  }, {
    key: "SE",
    value: function SE() {
      var x = this.x,
          y = this.y,
          size = this.size;
      var newSize = size / 2;
      return new Region(x + newSize, y + newSize, newSize);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var x = this.x,
          y = this.y,
          size = this.size;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
  }]);

  return Region;
}();
/************************************************************************
* Node 
*************************************************************************/


var Node =
/*#__PURE__*/
function () {
  function Node(region) {
    _classCallCheck(this, Node);

    this.region = region;
    this.body = null;
    this.external = true;
    this.NE = null;
    this.NW = null;
    this.SW = null;
    this.SE = null;
    this.cx = 0;
    /* center of mass x */

    this.cy = 0;
    /* center of mass y */

    this.mass = 0;
    /* total mass */
  }

  _createClass(Node, [{
    key: "_equals",
    value: function _equals(_ref2) {
      var x = _ref2.x,
          y = _ref2.y,
          mass = _ref2.mass;
      return x === this.cx && y === this.cy && mass === this.mass;
    }
  }, {
    key: "_calcForce",
    value: function _calcForce(_ref3) {
      var x1 = _ref3.x,
          y1 = _ref3.y,
          m1 = _ref3.mass;
      var eps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
      var x2 = this.cx,
          y2 = this.cy,
          m2 = this.mass;
      var rx = x2 - x1;
      var ry = y2 - y1;
      var r3 = Math.pow(Math.sqrt(rx * rx + ry * ry) + eps, 3);
      var fx = m1 * m2 * rx / r3;
      var fy = m1 * m2 * ry / r3;
      return {
        fx: fx,
        fy: fy
      };
    }
  }, {
    key: "netForce",
    value: function netForce(body) {
      var theta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
      var fx = 0;
      var fy = 0;

      if (this.external) {
        return this._equals(body) ? {
          fx: fx,
          fy: fy
        } : this._calcForce(body);
      }
      /* for internal nodes */


      var d = Math.sqrt((this.cx - body.x) * (this.cx - body.x) + (this.cy - body.y) * (this.cy - body.y));
      var s = this.region.size;

      if (s / d < theta) {
        return this._calcForce(body);
      }

      var subForce;

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

      return {
        fx: fx,
        fy: fy
      };
    }
  }, {
    key: "updateCenterOfMass",
    value: function updateCenterOfMass(_ref4) {
      var x = _ref4.x,
          y = _ref4.y,
          mass = _ref4.mass;
      this.cx = (this.cx * this.mass + x * mass) / (this.mass + mass);
      this.cy = (this.cy * this.mass + y * mass) / (this.mass + mass);
      this.mass += mass;
    }
  }, {
    key: "_insertInRegion",
    value: function _insertInRegion(body) {
      /********  Check NE  *********/
      var NERegion = this.region.NE();

      if (NERegion.contains(body)) {
        this.NE = this.NE === null ? new Node(NERegion) : this.NE;
        this.NE.insert(body);
        return;
      }
      /********  Check NW  *********/


      var NWRegion = this.region.NW();

      if (NWRegion.contains(body)) {
        this.NW = this.NW === null ? new Node(NWRegion) : this.NW;
        this.NW.insert(body);
        return;
      }
      /********  Check SW  *********/


      var SWRegion = this.region.SW();

      if (SWRegion.contains(body)) {
        this.SW = this.SW === null ? new Node(SWRegion) : this.SW;
        this.SW.insert(body);
        return;
      }
      /********  Check SE  *********/


      var SERegion = this.region.SE();

      if (SERegion.contains(body)) {
        this.SE = this.SE === null ? new Node(SERegion) : this.SE;
        this.SE.insert(body);
        return;
      }
    }
  }, {
    key: "insert",
    value: function insert(body) {
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
            var nodeBody = this.body;

            this._insertInRegion(nodeBody);

            this._insertInRegion(body);

            this.external = false;
            this.body = null;
          }
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.body !== null) {
        var _this$body = this.body,
            x = _this$body.x,
            y = _this$body.y;
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
  }]);

  return Node;
}();
/************************************************************************
* QuadTree
*************************************************************************/


var QuadTree =
/*#__PURE__*/
function () {
  function QuadTree(size) {
    _classCallCheck(this, QuadTree);

    this.size = size;
    this.root = new Node(new Region(size / 2, size / 2, size / 2));
  }

  _createClass(QuadTree, [{
    key: "insert",
    value: function insert(body) {
      this.root.insert(body);
    }
  }, {
    key: "getNetForce",
    value: function getNetForce(body) {
      return this.root.netForce(body);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      ctx.strokeRect(0, 0, this.size, this.size);
      this.root.draw(ctx);
    }
  }]);

  return QuadTree;
}();

exports.default = QuadTree;
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _qtree = _interopRequireDefault(require("./qtree"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;

var Body =
/*#__PURE__*/
function () {
  function Body(x, y) {
    var vx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var vy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var minMass = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 5000;
    var maxMass = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 7000;

    _classCallCheck(this, Body);

    this.x = x;
    this.y = y;
    var massDiff = maxMass - minMass;
    this.mass = minMass + Math.random() * massDiff;
    this.r = (massDiff + 2 * (this.mass - minMass)) / massDiff;
    this.color = "rgb(".concat(Math.random() * 255, ", 20, ").concat(Math.random() * 255, ")");
    this.vx = vx;
    this.vy = vy;
  }

  _createClass(Body, [{
    key: "update",
    value: function update(_ref) {
      var fx = _ref.fx,
          fy = _ref.fy;
      var dt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.016;
      var ax = fx / this.mass;
      var ay = fy / this.mass;
      this.vx += ax * dt;
      this.vy += ay * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }]);

  return Body;
}();
/********************************************************************
*  TEST CODE
*********************************************************************/


function makeBodies() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
  var bodies = [];

  for (var i = 0; i < n; i++) {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.width;
    var signx = Math.random() < 0.5 ? -1 : 1;
    var signy = Math.random() < 0.5 ? -1 : 1;
    var vx = (5 + Math.random() * 5) * signx;
    var vy = (5 + Math.random() * 5) * signy;
    var body = new Body(x, y, vx, vy);
    bodies.push(body);
  }

  return bodies;
}

function makeBodiesSystem() {
  var bodies = [];
  bodies.push(new Body(canvas.width / 2, canvas.height / 2, 0, 0, 1990000, 1990001)); // sun

  bodies.push(new Body(canvas.width / 2 + 200, canvas.height / 2 - 100, 60, 40, 1000, 1001)); // planet1

  bodies.push(new Body(canvas.width / 2 + 200, canvas.height / 2 - 300, 70, 25, 1200, 1201)); // planet2

  bodies.push(new Body(canvas.width / 2 - 150, canvas.height / 2 + 150, 80, 0, 1100, 1101)); // planet3

  bodies.push(new Body(canvas.width / 2 - 220, canvas.height / 2 + 200, -45, 5, 1000, 1101)); // planet3

  return bodies;
}

function makeBodiesSpiral() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
  var speed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
  var noise = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 25;
  var bodies = [];
  /** Archimedean spiral ***
  ***  r = a + bθ 
  *************************/

  var a = 40;
  var b = 3;

  for (var t = 0; t < n; t++) {
    var theta = 0.1 * t;
    var r = a + b * theta + Math.random() * noise;
    var x = canvas.width / 2 + r * Math.cos(theta);
    var y = canvas.height / 2 + r * Math.sin(theta);
    var vx = -r * Math.sin(theta);
    var vy = r * Math.cos(theta);
    vx = speed * vx / Math.sqrt(vx * vx + vy * vy);
    vy = speed * vy / Math.sqrt(vx * vx + vy * vy);
    bodies.push(new Body(x, y, vx, vy, 1000, 10000));
  }

  return bodies;
}

function makeBodiesDoubleSpiral() {
  var n1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 700;
  var n2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  var noise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 20;
  var bodies = [];
  var a = 25;
  var b = 3;

  for (var t = 0; t < n1; t++) {
    var theta = 0.1 * t;
    var r = a + b * theta + Math.random() * noise;
    var x = canvas.width / 2 - 150 + r * Math.cos(theta);
    var y = canvas.height / 2 + 100 + r * Math.sin(theta);
    var vx = -r * Math.sin(theta);
    var vy = r * Math.cos(theta);
    vx = speed * vx / Math.sqrt(vx * vx + vy * vy);
    vy = speed * vy / Math.sqrt(vx * vx + vy * vy);
    bodies.push(new Body(x, y, vx, vy, 1000, 10000));
  }

  for (var t = 0; t < n2; t++) {
    var _theta = 0.1 * t;

    var _r = a + b * _theta + Math.random() * noise;

    var _x = canvas.width / 2 + 300 + _r * Math.cos(_theta);

    var _y = canvas.height / 2 - 50 + _r * Math.sin(_theta);

    var _vx = -_r * Math.sin(_theta);

    var _vy = _r * Math.cos(_theta);

    _vx = speed * _vx / Math.sqrt(_vx * _vx + _vy * _vy);
    _vy = speed * _vy / Math.sqrt(_vx * _vx + _vy * _vy);
    bodies.push(new Body(_x, _y, _vx, _vy, 1000, 10000));
  }

  return bodies;
}

function getQuadTree(bodies) {
  var qt = new _qtree.default(canvas.width);

  for (var i = 0; i < bodies.length; i++) {
    qt.insert(bodies[i]);
  }

  return qt;
}

function remainingBodies(bodies) {
  return bodies.filter(function (_ref2) {
    var x = _ref2.x,
        y = _ref2.y;
    return x > 0 && x < canvas.width && y > 0 && y < canvas.height;
  });
}
/********************************************************************
* animation
********************************************************************/


function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bodies = remainingBodies(bodies);
  var qt = getQuadTree(bodies);
  bodies.forEach(function (body, i) {
    var force = qt.getNetForce(body);
    body.draw(ctx);
    body.update(force);
  });
}

var bodies = makeBodiesDoubleSpiral();
animate();
},{"./qtree":"qtree.js"}],"../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50592" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/nbodyjs.e31bb0bc.map