import fs from "fs";
import path from "path";

import { Inter, Cormorant_Garamond } from "next/font/google";

import AiinflugenLanding from "./components/landing/AiinflugenLanding";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const imageDirectory = path.join(process.cwd(), "public", "images");

function getImagesFromPublicFolder() {
  try {
    const files = fs
      .readdirSync(imageDirectory)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .sort();

    return files.map((file) => `/images/${file}`);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const images = getImagesFromPublicFolder();

  return (
    <AiinflugenLanding
      images={images}
      bodyFontClass={inter.className}
      headingFontClass={cormorant.className}
    />
  );
}
