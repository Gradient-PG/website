import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'


const Plug = () => {
  return (
    <div className='bg-neutral-50 text-neutral-900 pl-4 text-center py-3 w-full'>
        Made with ❤️ by {" "}
        <Link href="https://kamilkoziol.com" className='font-bold underline'>
                Kamil Kozioł
        </Link>
    </div>
  )
}

export default Plug