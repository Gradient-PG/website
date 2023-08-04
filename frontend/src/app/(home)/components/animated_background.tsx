import React, { Component } from "react";
import styles from "@/styles/components/animated_background.module.scss"
import animateCanvas from "../lib/animate_bg";

export default class AnimatedBackground extends Component {
  componentDidMount(): void {
    animateCanvas("heroCanvas")
  }

  render() {
    return (
        <canvas id="heroCanvas" className={styles.main}></canvas>
    );
  }
}
