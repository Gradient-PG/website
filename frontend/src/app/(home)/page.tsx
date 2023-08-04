import Image from "next/image";
import Hero from "./components/hero";
import Card from "@/components/card";
import Cards from "@/components/cards";
import Footer from "@/components/sections/footer";
import ProjectsSection from "./components/projects_section";

export default function Home() {
    return (
        <main>
            <Hero />
            <Cards />
            <ProjectsSection />
            <Footer />
        </main>
    );
}
