import React from "react";

import dc from "@/public/images/icons/discord.svg";
import fb from "@/public/images/icons/facebook.svg";
import gh from "@/public/images/icons/github.svg";
import ig from "@/public/images/icons/instagram.svg";

import { cn } from "@/lib/utils";
import info from "@/public/data/urls.json";
import Image from "next/image";

interface SocialProps extends React.HTMLProps<HTMLDivElement> {
  size: number;
}

const Socials: React.FC<SocialProps> = ({ ...props }) => {
  return (
    <div className={cn("flex items-center gap-3", props.className)}>
      <a href={info.FB_URL} target="_blank">
        <Image src={fb} width={props.size} height={props.size} alt="Facebook" />
      </a>

      <a href={info.GH_URL} target="_blank">
        <Image src={gh} width={props.size} height={props.size} alt="GitHub" />
      </a>
      <a href={info.DISCORD_INVITE} target="_blank">
        <Image src={dc} width={props.size} height={props.size} alt="Discord" />
      </a>
      <a href={info.IG_URL} target="_blank">
        <Image
          src={ig}
          width={props.size}
          height={props.size}
          alt="Instagram"
        />
      </a>
    </div>
  );
};

export default Socials;
