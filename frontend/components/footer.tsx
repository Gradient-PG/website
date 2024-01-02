import React from 'react'
import Image from 'next/image';

import Socials from './socials';
import { Logo } from './logo';

import bg_image from "@/public/images/shapes/footer-background.svg";
import wave from "@/public/images/shapes/hero-wave.svg";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface FooterProps extends React.HTMLProps<HTMLDivElement> { }

const Footer: React.FC<FooterProps> = ({...props}) => {
  return (
    <div className={cn('relative min-h-64 pb-4', props.className)}>
      <Image src={wave} alt="" className='w-full absolute rotate-180 -z-10 -mt-1  md:block hidden' />
      <Image
        src={bg_image}
        fill
        alt="background"
        className='object-cover -z-20'
      />

      <div className="md:mt-36 md:ml-20 flex gap-6 items-start mt-20 ml-10 md:flex-row flex-col md:items-center">
       <Logo />
        <div className="flex flex-col">
          <h1 className='text-neutral-100 font-bold text-lg'>Contact us</h1>
          <Button variant={"link"} className='m-0 p-0 text-neutral-200 text-md'>
            <a href='mailto:gradient@pg.edu.pl'>gradient@pg.edu.pl</a>
          </Button>
        </div>
        
        <Socials size={32} />
      </div>
    </div>
  )
}

export default Footer