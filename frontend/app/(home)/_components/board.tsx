import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

import boardInfo from '@/public/data/board.json';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BoardProps extends React.HTMLProps<HTMLDivElement> { }

const Board: React.FC<BoardProps> = ({ ...props }) => {
  let icons_path = "/images/icons/";
  return (
    <div className={cn('container flex flex-col justify-center', props.className)}>
      <div className="text-center">
        <h1 className='font-bold text-3xl'>Our Board</h1>
      </div>
      <div className='grid md:grid-cols-3 grid-cols-1 gap-4 mt-12 px-4'>
        {boardInfo.members.map((member, index) => {
          return (
            <div className="flex flex-row bg-neutral-100 rounded-md gap-5 items-center p-4 py-5" key={index}>
              <div className="p-4 bg-primary rounded-lg">
                <Image alt="icons" width={16} height={16} src={icons_path + member.icon + ".svg"} />
              </div>
              <div className="rounded-md flex flex-col">
                <h1 className='font-bold text-neutral-900 text-xl'>{member.name} {member.surname}</h1>
                <h2 className='text-primary font-semibold'>{member.position}</h2>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Board