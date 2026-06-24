import sharp from "sharp";
import path from "path";

const cartSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="44" fill="#FF6A00"/>
  <g transform="translate(24, 24) scale(2)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </g>
</svg>`;

const wishlistSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="44" fill="#FF6A00"/>
  <g transform="translate(24, 24) scale(2)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </g>
</svg>`;

const collectionSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <circle cx="48" cy="48" r="44" fill="#FF6A00"/>
  <g transform="translate(24, 24) scale(2)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 10V7a2 2 0 1 1 4 0"/>
    <path d="M2 17h20L12 10.5Z"/>
  </g>
</svg>`;

async function generateShortcuts() {
  const cartPath = path.join(process.cwd(), "public/icons/shortcut-cart.png");
  const wishlistPath = path.join(process.cwd(), "public/icons/shortcut-wishlist.png");
  const collectionPath = path.join(process.cwd(), "public/icons/shortcut-collection.png");

  try {
    await sharp(Buffer.from(cartSvg))
      .png()
      .toFile(cartPath);
    console.log("Generated shortcut-cart.png");

    await sharp(Buffer.from(wishlistSvg))
      .png()
      .toFile(wishlistPath);
    console.log("Generated shortcut-wishlist.png");

    await sharp(Buffer.from(collectionSvg))
      .png()
      .toFile(collectionPath);
    console.log("Generated shortcut-collection.png");

  } catch (error) {
    console.error("Error generating shortcuts:", error);
  }
}

generateShortcuts();
