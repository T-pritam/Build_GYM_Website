import SmoothScroll from "@/lib/lenis";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import AmbientParticles from "@/components/three/AmbientParticles";
import Hero from "@/components/sections/Hero";
import Trainers from "@/components/sections/Trainers";
import AppShowcase from "@/components/sections/AppShowcase";
import Activities from "@/components/sections/Activities";
import Premium from "@/components/sections/Premium";
import Cafe from "@/components/sections/Cafe";
import Membership from "@/components/sections/Membership";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Preloader />
      <AmbientParticles />
      <ScrollProgress />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Trainers />
        <AppShowcase />
        <Activities />
        <Premium />
        <Cafe />
        <Membership />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
