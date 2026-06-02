import { Geist } from "next/font/google";
import ObsidianLanding from "./components/landing/ObsidianLanding";

const geist = Geist({ subsets: ["latin"] });

export default function HomePage() {
  return (
    <div className={geist.className}>
      <ObsidianLanding />
    </div>
  );
}