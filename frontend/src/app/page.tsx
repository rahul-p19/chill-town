import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Home() {
  return (
    <div className='flex flex-col sm:flex-row items-center justify-center min-h-[90vh] gap-8 bg-black'>
      <Image src={"/chilltown-screenshot.png"} alt='ChillTown Screenshot' height={600} width={400} className='h-[70vh] w-[70vw] sm:w-[30vw] rounded-lg' />
      <div className='flex flex-col items-center gap-y-8'>
        <h1 className='text-9xl font-pixelify bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-500
        '>ChillTown</h1>
        <h2 className='text-3xl font-sans w-4/5 text-center text-white'>Welcome to ChillTown, Your Personalized Entertainment Universe</h2>
        <Link href={"/init"} className='bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-red-500 p-3 rounded-full text-xl font-sans border-yellow-300 hover:border-orange-400 transition-colors duration-150 border px-6'>Get Started!</Link>
        </div>
    </div>
  )
}

export default Home