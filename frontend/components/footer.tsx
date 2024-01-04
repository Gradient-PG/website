import Image from "next/image";
import React from "react";

import { Logo } from "./logo";
import Socials from "./socials";

import { cn } from "@/lib/utils";
import bg_image from "@/public/images/shapes/footer-background.svg";
import wave from "@/public/images/shapes/hero-wave.svg";
import { Button } from "./ui/button";

interface FooterProps extends React.HTMLProps<HTMLDivElement> {}

const Footer: React.FC<FooterProps> = ({ ...props }) => {
  return (
    <div className={cn("relative min-h-80 pb-4", props.className)}>
      <Image
        src={wave}
        alt=""
        className="absolute -z-10 -mt-1 hidden w-full  rotate-180 md:block"
      />
      <Image
        src={bg_image}
        fill
        alt="background"
        className="-z-20 object-cover"
      />

      <div className="ml-10 mt-10 flex flex-col items-start gap-6 md:ml-20 md:mt-48 md:flex-row md:items-center">
        <Logo />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-neutral-100">Contact us</h1>
          <Button variant={"link"} className="text-md m-0 p-0 text-neutral-200">
            <a href="mailto:gradient@pg.edu.pl">gradient@pg.edu.pl</a>
          </Button>
        </div>

        <Socials size={32} />
      </div>
    </div>
  );
};

export default Footer;
