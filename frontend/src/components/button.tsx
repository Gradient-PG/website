import classNames from 'classnames'
import Link from 'next/link'
import React, { Component } from 'react'
import styles from  "@/styles/components/button.module.scss"


export interface ButtonProps {
    href: string,
    text: string,
    classNames?: [string],
    target?: string
}

export default class Button extends Component<ButtonProps> {

  render() {
    return (
        <Link href={this.props.href} target={this.props.target} className={classNames(this.props.classNames, styles.main)}>
            {this.props.text}
        </Link>
    )
  }
}
