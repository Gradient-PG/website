"use client";

import React, { Component } from "react";
import classNames from "classnames";
import styles from "../styles/hero.module.scss";

import bg_image from "@/public/hero-background.svg";
import wave from "@/public/hero-wave.svg";
import logo from "@/public/logo.png";
import info from "@/public/data/info.json";


import Image from "next/image";
import Link from "next/link";
import Button from "@/components/button";
import AnimatedBackground from "./animated_background";

export default class Hero extends Component {
  render() {
    return (
      <div className={classNames(styles.main)}>
        <div className={classNames(styles.hero_background)}>
          <Image src={wave} className={styles.hero_wave} alt={""}/>
          <Image
            src={bg_image}
            fill
            alt="background"
            className={styles.hero_background_image}
          />
          <AnimatedBackground />

        </div>

        <div className={classNames(styles.top_bar, "container")}>
          <Image src={logo} width={84} alt="logo gradient"/>
          <ul className={classNames(styles.menu)}>
            <Link href={"/"}>Home</Link>
            <Link href={"/"}>Projects</Link>
            <Button href={info.DISCORD_INVITE} target={"_blank"} text="Discord"/>
            <Button href="/contact" text="Contact"/>
          </ul>
        </div>

        <div className={classNames(styles.text_section, "container")}>
          <h1>Gradient<br></br>Research Group</h1>
          <p>We are a team of passionate students who are dedicated to exploring the exciting field of machine learning. Our group provides a platform for learning and growth in this rapidly advancing field.</p>
          <Button href="/contact" text="Join us"/>
        </div>
      </div>
    );
  }
}
