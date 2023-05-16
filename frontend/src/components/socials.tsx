import React, { Component } from 'react'

import fb from "../../public/icons/facebook.svg"
import gh from "../../public/icons/github.svg"
import ig from "../../public/icons/instagram.svg"
import dc from "../../public/icons/discord.svg"

import styles from "@/styles/components/socials.module.scss";
import Image from 'next/image'

export default class Socials extends Component {
  render() {
    return (
      <div className={styles.main}>
        <a href="facebook.com"><Image src={fb} width={42} height={42} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={gh} width={42} height={42} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={dc} width={42} height={42} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={ig} width={42} height={42} alt="Facebook"/></a>
      </div>
    )
  }
}
