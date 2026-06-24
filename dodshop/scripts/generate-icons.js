import sharp from "sharp";
import path from "path";

async function generateIcons() {
  const sourcePath = path.join(process.cwd(), "public/logo.png");
  const icon192Path = path.join(process.cwd(), "public/icons/icon-192x192.png");
  const icon512Path = path.join(process.cwd(), "public/icons/icon-512x512.png");
  const maskable192Path = path.join(process.cwd(), "public/icons/icon-192x192-maskable.png");
  const maskable512Path = path.join(process.cwd(), "public/icons/icon-512x512-maskable.png");

  try {
    // Generate regular icons
    await sharp(sourcePath)
      .resize(192, 192)
      .png()
      .toFile(icon192Path);
    console.log("Generated icon-192x192.png");

    await sharp(sourcePath)
      .resize(512, 512)
      .png()
      .toFile(icon512Path);
    console.log("Generated icon-512x512.png");

    // Generate maskable icons with solid dark background (#1A1A1A) and appropriate safe-zone padding (around 70-80% logo resize)
    await sharp(sourcePath)
      .resize({
        width: 140,
        height: 140,
        fit: "contain",
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .extend({
        top: 26,
        bottom: 26,
        left: 26,
        right: 26,
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .png()
      .toFile(maskable192Path);
    console.log("Generated icon-192x192-maskable.png");

    await sharp(sourcePath)
      .resize({
        width: 380,
        height: 380,
        fit: "contain",
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .extend({
        top: 66,
        bottom: 66,
        left: 66,
        right: 66,
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .png()
      .toFile(maskable512Path);
    console.log("Generated icon-512x512-maskable.png");

  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
