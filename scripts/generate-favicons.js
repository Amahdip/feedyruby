const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const brandDir = path.join(__dirname, "../apps/web/public/brand");
const faviconDir = path.join(__dirname, "../apps/web/public/favicon");
const publicDir = path.join(__dirname, "../apps/web/public");
const appDir = path.join(__dirname, "../apps/web/app");

const iconSimple = path.join(brandDir, "feedyruby-icon-simple.svg");
const iconNormal = path.join(brandDir, "feedyruby-icon.svg");

// Make sure output directories exist
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

const targets = [
  // Small icons (use simple version)
  { src: iconSimple, dest: path.join(faviconDir, "favicon-16x16.png"), size: 16 },
  { src: iconSimple, dest: path.join(faviconDir, "favicon-32x32.png"), size: 32 },
  { src: iconSimple, dest: path.join(publicDir, "favicon.ico"), size: 32 }, // Save PNG with .ico extension (compatible with modern browsers)
  { src: iconSimple, dest: path.join(appDir, "icon.png"), size: 32 },
  { src: iconSimple, dest: path.join(faviconDir, "mstile-70x70.png"), size: 70 },

  // Medium / Large icons (use normal version with details)
  { src: iconNormal, dest: path.join(faviconDir, "mstile-144x144.png"), size: 144 },
  { src: iconNormal, dest: path.join(faviconDir, "mstile-150x150.png"), size: 150 },
  { src: iconNormal, dest: path.join(faviconDir, "apple-touch-icon.png"), size: 180 },
  { src: iconNormal, dest: path.join(faviconDir, "android-chrome-192x192.png"), size: 192 },
  { src: iconNormal, dest: path.join(publicDir, "android-chrome-192x192.png"), size: 192 },
  { src: iconNormal, dest: path.join(faviconDir, "mstile-310x310.png"), size: 310 },
  { src: iconNormal, dest: path.join(faviconDir, "android-chrome-512x512.png"), size: 512 },
  { src: iconNormal, dest: path.join(publicDir, "android-chrome-512x512.png"), size: 512 },
];

async function generate() {
  console.log("Starting favicon generation...");
  for (const target of targets) {
    try {
      await sharp(target.src)
        .resize(target.size, target.size)
        .png()
        .toFile(target.dest);
      console.log(`Generated: ${path.relative(path.join(__dirname, ".."), target.dest)} (${target.size}x${target.size})`);
    } catch (err) {
      console.error(`Failed to generate ${target.dest}:`, err);
    }
  }

  // Handle non-square mstile-310x150
  try {
    const dest310x150 = path.join(faviconDir, "mstile-310x150.png");
    await sharp(iconNormal)
      .resize(310, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(dest310x150);
    console.log(`Generated: ${path.relative(path.join(__dirname, ".."), dest310x150)} (310x150)`);
  } catch (err) {
    console.error("Failed to generate mstile-310x150.png:", err);
  }

  console.log("Favicon generation completed!");
}

generate();
