import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Awards } from "@/components/Awards";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { CursorDot } from "@/components/CursorDot";

export default function Home() {
  return (
    <>
      <CursorDot />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Awards />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
