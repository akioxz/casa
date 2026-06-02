const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGES = [
  'C:/Users/kyler/.gemini/antigravity/brain/d4403360-39a3-4e73-b08f-f8acc212aa1d/media__1779197939554.png',
  'C:/Users/kyler/.gemini/antigravity/brain/d4403360-39a3-4e73-b08f-f8acc212aa1d/media__1779197939592.png',
  'C:/Users/kyler/.gemini/antigravity/brain/d4403360-39a3-4e73-b08f-f8acc212aa1d/media__1779197939652.png',
];

const OUTPUT_DIR = 'C:/Users/kyler/Downloads/Casa/assets/products';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BLOCKS_IMG1 = [
  { name: 'chair_soriana_ebony', x: 20, y: 15, w: 140, h: 100 },
  { name: 'chair_boll_white', x: 15, y: 125, w: 130, h: 110 },
  { name: 'chair_tubular_tan', x: 148, y: 132, w: 120, h: 110 },
  { name: 'chair_cozy_brown', x: 290, y: 65, w: 170, h: 165 },
  { name: 'chair_minimal_white', x: 15, y: 250, w: 125, h: 120 },
  { name: 'chair_slouch_grey', x: 150, y: 258, w: 145, h: 120 },
  { name: 'chair_walnut_cradle', x: 305, y: 285, w: 155, h: 120 },
  { name: 'chair_puff_white', x: 10, y: 382, w: 140, h: 110 },
  { name: 'chair_wood_dining', x: 165, y: 405, w: 130, h: 140 },
  { name: 'chair_plush_camel', x: 300, y: 430, w: 160, h: 135 },
  { name: 'chair_cushion_leg', x: 15, y: 525, w: 135, h: 130 },
  { name: 'chair_round_boucle', x: 170, y: 565, w: 130, h: 125 },
  { name: 'chair_shaggy_white', x: 308, y: 580, w: 150, h: 120 },
  { name: 'chair_wood_plush', x: 105, y: 690, w: 200, h: 145 },
  { name: 'chair_cradle_brass', x: 15, y: 840, w: 170, h: 135 },
  { name: 'chair_wave_leather', x: 270, y: 875, w: 190, h: 115 },
];

const BLOCKS_IMG3 = [
  { name: 'chair_pink_lounge', x: 40, y: 22, w: 135, h: 125 },
  { name: 'chair_rust_arch', x: 180, y: 15, w: 120, h: 115 },
  { name: 'chair_rose_cup', x: 325, y: 20, w: 115, h: 110 },
  { name: 'chair_rust_box', x: 20, y: 160, w: 90, h: 90 },
  { name: 'chair_burgundy_ball', x: 102, y: 145, w: 90, h: 95 },
  { name: 'chair_berry_dome', x: 192, y: 125, w: 108, h: 130 },
  { name: 'chair_orange_saddle', x: 310, y: 132, w: 138, h: 110 },
  { name: 'chair_terracotta_side', x: 25, y: 295, w: 80, h: 110 },
  { name: 'chair_blush_loop', x: 102, y: 270, w: 98, h: 140 },
  { name: 'chair_weave_tubular', x: 205, y: 280, w: 115, h: 145 },
  { name: 'chair_berry_rolls', x: 325, y: 260, w: 125, h: 135 },
  { name: 'chair_aubergine_curved', x: 20, y: 440, w: 120, h: 110 },
  { name: 'chair_wine_round', x: 150, y: 430, w: 145, h: 130 },
  { name: 'chair_plum_cushion', x: 310, y: 415, w: 135, h: 120 },
  { name: 'chair_plum_slat', x: 30, y: 575, w: 108, h: 135 },
  { name: 'chair_burnt_orange', x: 165, y: 585, w: 125, h: 145 },
  { name: 'chair_pattern_swivel', x: 300, y: 565, w: 145, h: 150 },
  { name: 'chair_blush_sleek', x: 60, y: 725, w: 90, h: 115 },
  { name: 'chair_red_flower', x: 195, y: 730, w: 115, h: 125 },
  { name: 'chair_rose_shield', x: 325, y: 725, w: 105, h: 135 },
  { name: 'chair_rust_tufted', x: 38, y: 855, w: 130, h: 125 },
  { name: 'chair_plum_swivel', x: 195, y: 885, w: 100, h: 105 },
  { name: 'chair_rust_slats', x: 325, y: 895, w: 100, h: 100 },
];

async function processChairs() {
  console.log('Starting image crop and background replacement sequence...');

  try {
    const buffer1 = fs.readFileSync(SOURCE_IMAGES[0]);
    const img1 = await Jimp.read(buffer1);
    const width = img1.width;
    const height = img1.height;
    console.log(`Image 1 loaded successfully: ${width}x${height}`);

    for (const block of BLOCKS_IMG1) {
      const absX = Math.round((block.x / 470) * width);
      const absY = Math.round((block.y / 1000) * height);
      const absW = Math.round((block.w / 470) * width);
      const absH = Math.round((block.h / 1000) * height);

      const cropped = img1.clone().crop({
        x: Math.max(0, absX),
        y: Math.max(0, absY),
        w: Math.min(width - absX, absW),
        h: Math.min(height - absY, absH)
      });

      cropped.scan((x, y, idx) => {
        const r = cropped.bitmap.data[idx];
        const g = cropped.bitmap.data[idx + 1];
        const b = cropped.bitmap.data[idx + 2];

        if (r > 210 && g > 210 && b > 210) {
          cropped.bitmap.data[idx] = 255;
          cropped.bitmap.data[idx + 1] = 255;
          cropped.bitmap.data[idx + 2] = 255;
        }
      });

      const outFile = path.join(OUTPUT_DIR, `${block.name}.png`);
      await cropped.write(outFile);
      console.log(`Exported clean white product image: ${block.name}.png`);
    }
  } catch (err) {
    console.error('Failed to slice Image 1 chairs:', err);
  }

  try {
    const buffer3 = fs.readFileSync(SOURCE_IMAGES[2]);
    const img3 = await Jimp.read(buffer3);
    const width = img3.width;
    const height = img3.height;
    console.log(`Image 3 loaded successfully: ${width}x${height}`);

    for (const block of BLOCKS_IMG3) {
      const absX = Math.round((block.x / 450) * width);
      const absY = Math.round((block.y / 1000) * height);
      const absW = Math.round((block.w / 450) * width);
      const absH = Math.round((block.h / 1000) * height);

      const cropped = img3.clone().crop({
        x: Math.max(0, absX),
        y: Math.max(0, absY),
        w: Math.min(width - absX, absW),
        h: Math.min(height - absY, absH)
      });

      cropped.scan((x, y, idx) => {
        const r = cropped.bitmap.data[idx];
        const g = cropped.bitmap.data[idx + 1];
        const b = cropped.bitmap.data[idx + 2];

        if (r > 215 && g > 215 && b > 215) {
          cropped.bitmap.data[idx] = 255;
          cropped.bitmap.data[idx + 1] = 255;
          cropped.bitmap.data[idx + 2] = 255;
        }
      });

      const outFile = path.join(OUTPUT_DIR, `${block.name}.png`);
      await cropped.write(outFile);
      console.log(`Exported clean white product image: ${block.name}.png`);
    }
  } catch (err) {
    console.error('Failed to slice Image 3 chairs:', err);
  }

  console.log('All product chair images cropped, cleaned and exported successfully!');
}

processChairs();
