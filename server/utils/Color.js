const MIN_LUM = .2;
const MAX_LUM = .3;
const MIN_SAT = .2;
const MAX_SAT = .7;

exports.Color = class Color {
  constructor(code) {
    var rgb = code.substr(4, code.length-5).split(',');
    [this.r, this.g, this.b] = rgb.map((current, index, arr)=>{return parseInt(current);});
  }
  makeValidBackground() {
    var [h, s, l] = this.calcHSL(this.r, this.g, this.b);
    if (s < MIN_SAT) s = MIN_SAT;
    else if (s > MAX_SAT) s = MAX_SAT;
    if (l < MIN_LUM) l = MIN_LUM;
    else if (l > MAX_LUM) l = MAX_LUM;
    [this.r, this.g, this.b] = this.calcRGB(h, s, l);
  }
  get() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
  calcHSL(r, g, b) {
    // Algorithm from https://gist.github.com/mjackson/5311256
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [ h, s, l ];
  }
  calcRGB(h, s, l) {
    // Algorithm from https://gist.github.com/mjackson/5311256
    var r, g, b;
    if (s == 0) { r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [ Math.round(r*255), Math.round(g*255), Math.round(b*255) ];
  }
}
