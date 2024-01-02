import React from 'react'



import fb from "@/public/images/icons/facebook.svg"
import gh from "@/public/images/icons/github.svg"
import dc from "@/public/images/icons/discord.svg"
import ig from "@/public/images/icons/instagram.svg"

import info from "@/public/data/urls.json";
import Image from 'next/image';
import { cn } from '@/lib/utils'

interface SocialProps extends React.HTMLProps<HTMLDivElement> {
  size: number
}

const Socials: React.FC<SocialProps> = ({ ...props }) => {
  return (
    <div className={cn('flex gap-3 items-center', props.className)}>
      <a href={info.FB_URL}><Image src={fb} width={props.size} height={props.size} alt="Facebook" /></a>

      <a href={info.GH_URL}><Image src={gh} width={props.size} height={props.size} alt="GitHub"/></a>
    <a href={info.DISCORD_INVITE}><Image src={dc} width={props.size} height={props.size} alt="Discord"/></a>
    <a href={info.IG_URL}><Image src={ig} width={props.size} height={props.size} alt="Instagram"/></a>
    </div>
  )
}

export default Socials