import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

import aboutBenefits from '@/public/data/about-benefits.json';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CardsProps extends React.HTMLProps<HTMLDivElement> {}

const Cards: React.FC<CardsProps> = ({...props}) => {

  let icons_path = "/images/icons/";

  return (
    <div className={cn('flex flex-row justify-around flex-wrap md:flex-nowrap', props.className)}>
      {aboutBenefits.cards.map((benefit, index) => {
        return (
          <Card className='w-full m-4' key={index}>
            <CardHeader className='text-center p-16'>
              <CardTitle className='self-center mt-4 mb-6'><Image src={icons_path + benefit.icon} alt={benefit.icon} width={36} height={36}/></CardTitle>

              <CardTitle className='text-2xl'>{benefit.titleUp}<br/>{benefit.titleDown}</CardTitle>

              <CardDescription>{benefit.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}

    </div>
  )
}

export default Cards