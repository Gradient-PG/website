"use client"
import React, { Component } from 'react'
import Card from './card'

import styles from "@/styles/components/cards.module.scss"

export default class Cards extends Component {
  render() {
    return (
        <div className={styles.main}>
        <Card
          titleUp="Learning"
          titleDown="Opportunities"
          description="Access to experienced students and faculty for machine learning learning."
          icon="/icons/book-solid.svg"
        />
        <Card
          titleUp="Collaborative"
          titleDown="Environment"
          description="Supportive and collaborative community that encourages learning from each other."
          icon="/icons/users-solid.svg"
        />
        <Card
          titleUp="Hands-on"
          titleDown=" Experience"
          description="Practical experience in machine learning projects that contribute to real-world applications."
          icon="/icons/wrench-solid.svg"
        />
      </div>
    )
  }
}
