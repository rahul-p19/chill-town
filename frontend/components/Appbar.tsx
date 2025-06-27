"use client";

import Link from 'next/link';

export function Appbar(){
    return <div className='flex justify-between items-center py-6 px-8 font-pixelify text-xl bg-black'>
        <div className='text-3xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 font-pixelify'>ChillTown</div>
        <div className='flex gap-x-8 text-white'>
            <Link href={"/init"} className='border-yellow-300 rounded-full px-6 py-2 border hover:border-orange-400 transition-colors duration-150'>
                Join
            </Link>
        </div>
    </div>
}