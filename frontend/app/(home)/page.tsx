import Image from 'next/image'
import Hero from './_components/hero'
import Cards from './_components/cards'
import Projects from './_components/projects'
import Board from './_components/board'
import Footer from '@/components/footer'
import Plug from '@/components/plug'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Cards className='md:-mt-40'/>
      <Projects className='mt-16'/>
      <Board className='mt-16'/>
      <Footer className='mt-16' />
      <Plug />
    </main>
  )
}
