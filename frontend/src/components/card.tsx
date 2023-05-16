"use client"

import React, { Component } from 'react'
import styles from "@/styles/components/card.module.scss"
import Image from "next/image";

export interface CardProps {
  icon: string,
  titleUp: string,
  titleDown: string,
  description: string
}

export default class Card extends Component<CardProps> {
  render() {
    return (
      <div className={styles.main}>
        <div className={styles.image_holder}>
          <Image src={this.props.icon} alt="icon" width={36} height={36}/>
        </div>
        <h1>{this.props.titleUp}<br></br>{this.props.titleDown}</h1>
        <p>{this.props.description}</p>
      </div>
    )
  }
}
