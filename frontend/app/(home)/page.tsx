import Footer from "@/components/footer";
import Board from "./_components/board";
import Cards from "./_components/cards";
import Hero from "./_components/hero";
import Projects from "./_components/projects";
import Partnerships from "./_components/partnerships";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Cards className="md:-mt-40" />
      <Projects className="mt-8 md:mt-16" />
      <Board className="mt-8 md:mt-16" />
      <Partnerships className="mt-8 md:mt-16" />
      <Footer className="mt-8 md:mt-16" />
    </main>
  );
}
