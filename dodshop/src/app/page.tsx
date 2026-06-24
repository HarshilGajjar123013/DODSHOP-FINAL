import Hero from "@/components/sections/Hero/Hero";
import Collection from "@/components/sections/Collection/Collection";
import Gallery from "@/components/sections/Gallery/Gallery";
import FAQ from "@/components/sections/FAQ/FAQ";
import Preloader from "@/components/common/Preloader/Preloader";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Collection />
      <Gallery />
      <FAQ />
    </main>
  );
}