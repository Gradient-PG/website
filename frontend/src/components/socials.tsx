import React, { Component } from 'react'

import fb from "../../public/icons/facebook.svg"
import gh from "../../public/icons/github.svg"
import ig from "../../public/icons/instagram.svg"
import dc from "../../public/icons/discord.svg"

import styles from "@/styles/components/socials.module.scss";
import Image from 'next/image'

interface SocialsProps {
    size: number
}


export default class Socials extends Component<SocialsProps> {
  render() {
    return (
      <div className={styles.main}>
        <a href="facebook.com"><Image src={fb} width={this.props.size} height={this.props.size} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={gh} width={this.props.size} height={this.props.size} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={dc} width={this.props.size} height={this.props.size} alt="Facebook"/></a>
        <a href="facebook.com"><Image src={ig} width={this.props.size} height={this.props.size} alt="Facebook"/></a>
      </div>
    )
  }
}
