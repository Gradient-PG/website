"use client";

import React, { Component, useEffect } from "react";

import bg_image from "@/public/images/shapes/hero-background.svg";
import wave from "@/public/images/shapes/hero-wave.svg";

import urls from "@/public/data/urls.json";

import { } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AnimatedBackground from "@/components/animated_background";
import { Logo } from "@/components/logo";

export default function Hero() {
  return (
    <div className={cn("flex w-full flex-col relative gap-8")}>

      <div className="-z-10 absolute h-full w-full">
        <Image src={wave} alt={"Hero wave"} className="absolute bottom-0 w-full md:block hidden" />

        <Image
          src={bg_image}
          fill
          alt="background"
          className="object-cover -z-10"
        />

        <AnimatedBackground className="hidden md:block" id="heroAnimated" />

      </div>


      <div className="md:p-16 p-8 flex flex-col md:mb-32">
        <div className={cn("items-center justify-between my-8 hidden md:flex")}>
          <Logo />
          <ul className={cn("flex gap-6 items-center text-md text-white font-bold")}>
            <Link href={"/"}>Home</Link>
            <Link href={"/#projects"}>Projects</Link>
            <Button variant={"secondary"} size={'lg'}>
              <Link href={urls.DISCORD_INVITE}>
                Discord
              </Link>
            </Button>

          </ul>
        </div>

        <div className="flex flex-col items-start gap-5 md:max-w-96 max-w-full">
          <h1 className="font-bold text-3xl text-slate-50">Gradient<br></br>Research Group</h1>
          <p className="text-lg text-slate-300">We are a team of passionate students who are dedicated to exploring the exciting field of machine learning. Our group provides a platform for learning and growth in this rapidly advancing field.</p>
          <Button variant={"secondary"} size={"lg"}>
            <Link href={urls.DISCORD_INVITE}>
              Join us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}