import Image from "next/image";
import Hero from "./components/hero";
import Card from "@/components/card";
import Cards from "src/app/(home)/components/cards";
import Footer from "@/components/sections/footer";
import ProjectsSection from "./components/projects_section";
import Board from "./components/board";

export default function Home() {
    return (
        <main>
            <Hero />
            <Cards />
            <ProjectsSection />
            <Board />
            <Footer />
        </main>
    );
}
