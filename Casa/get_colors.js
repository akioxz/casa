const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'products');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

async function processFiles() {
  for (const file of files) {
    try {
      const image = await Jimp.read(path.join(dir, file));
      const w = image.bitmap.width;
      const h = image.bitmap.height;
      
      // Sample slightly below center to hit the furniture body
      let r = 0, g = 0, b = 0;
      let count = 0;
      for (let dx = -20; dx <= 20; dx += 10) {
        for (let dy = 0; dy <= 40; dy += 10) {
          const hex = image.getPixelColor(Math.floor(w/2) + dx, Math.floor(h/2) + dy);
          const rgba = Jimp.intToRGBA(hex);
          // ignore pure white/gray background
          if (rgba.r < 240 || rgba.g < 240 || rgba.b < 240) {
            r += rgba.r;
            g += rgba.g;
            b += rgba.b;
            count++;
          }
        }
      }
      if (count > 0) {
        r = Math.floor(r/count);
        g = Math.floor(g/count);
        b = Math.floor(b/count);
      }
      
      const toHex = (n) => n.toString(16).padStart(2, '0');
      console.log(`${file}: #${toHex(r)}${toHex(g)}${toHex(b)}`);
    } catch(e) {
      console.error(file, e.message);
    }
  }
}

processFiles();
