import React, { Component } from 'react'

import fb from "../../public/icons/facebook.svg"
import gh from "../../public/icons/github.svg"
import ig from "../../public/icons/instagram.svg"
import dc from "../../public/icons/discord.svg"

import styles from "@/styles/components/socials.module.scss";
import Image from 'next/image'

import info from "@/public/data/info.json"

interface SocialsProps {
    size: number
}


export default class Socials extends Component<SocialsProps> {
  render() {
    return (
      <div className={styles.main}>
        <a href={info.FB_URL}><Image src={fb} width={this.props.size} height={this.props.size} alt="Facebook"/></a>
        <a href={info.GH_URL}><Image src={gh} width={this.props.size} height={this.props.size} alt="GitHub"/></a>
        <a href={info.DISCORD_INVITE}><Image src={dc} width={this.props.size} height={this.props.size} alt="Discord"/></a>
        <a href={info.IG_URL}><Image src={ig} width={this.props.size} height={this.props.size} alt="Instagram"/></a>
      </div>
    )
  }
}
