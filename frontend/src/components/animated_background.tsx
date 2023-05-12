import React, { Component } from "react";
import styles from "@/styles/components/animated_background.module.scss"

export default class AnimatedBackground extends Component {
  componentDidMount(): void {
    const script = document.createElement("script");

    script.src = "/scripts/animate_bg.js";

    document.body.appendChild(script);
  }

  render() {
    return (
        <canvas id="canvas" className={styles.main}></canvas>
    );
  }
}
