"use client";

import bg_image from "@/public/images/shapes/hero-background.svg";
import wave from "@/public/images/shapes/hero-wave.svg";

import urls from "@/public/data/urls.json";

import { Button } from "@/components/ui/button";

import AnimatedBackground from "@/components/animated_background";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className={cn("relative flex w-full flex-col gap-8")}>
      <div className="absolute -z-10 h-full w-full">
        <Image
          src={wave}
          alt={"Hero wave"}
          className="absolute bottom-0 hidden w-full md:block"
        />

        <Image
          src={bg_image}
          fill
          alt="background"
          className="-z-10 object-cover"
        />

        <AnimatedBackground className="hidden md:block" id="heroAnimated" />
      </div>

      <div className="container flex flex-col p-8 md:mb-52 md:p-24">
        <div className={cn("my-8 hidden items-center justify-between md:flex")}>
          <Logo />
          <ul
            className={cn(
              "text-md flex items-center gap-6 font-extrabold text-white",
            )}
          >
            <Link className="hover:underline" href={"/"}>
              Home
            </Link>
            <Link className="hover:underline" href={"/#projects"}>
              Projects
            </Link>
            <Button variant={"secondary"} size={"lg"}>
              <Link href={urls.DISCORD_INVITE}>Discord</Link>
            </Button>
          </ul>
        </div>

        <div className="flex max-w-full flex-col items-start gap-5 md:w-1/2">
          <h1 className="text-4xl font-bold text-slate-50">
            Gradient<br></br>Research Group
          </h1>
          <p className="text-lg text-slate-300">
            We are a team of passionate students who are dedicated to exploring
            the exciting field of machine learning. Our group provides a
            platform for learning and growth in this rapidly advancing field.
          </p>
          <Button variant={"secondary"} size={"lg"}>
            <Link href={urls.DISCORD_INVITE} target="_blank">
              Join us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
