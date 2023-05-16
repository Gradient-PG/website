"use client"

import React, { Component } from 'react'
import logo from "../../public/logo.png";
import Image from "next/image"
import classNames from 'classnames';

import bg_image from "../../public/footer-background.svg";
import wave from "../../public/hero-wave.svg";


import styles from "@/styles/components/footer.module.scss"
import Socials from './socials';
import AnimatedBackground from './animated_background';

export default class Footer extends Component {
  render() {
    return (
      <div className={classNames(styles.main)}>

        <Image src={wave} className={styles.hero_wave} alt={""}/>
        <Image
            src={bg_image}
            fill
            alt="background"
            className={styles.hero_background_image}
          />
          <div className={styles.content}>
            <Image src={logo} width={84} alt="logo gradient"/>
            <div className={styles.sub}>
              <h1>Contact us</h1>
              <p><a href='mailto:gradient@pg.edu.pl'>gradient@pg.edu.pl</a></p>
            </div>
            <Socials />
          </div>

      </div>
    )
  }
}
