"use client";

import {
    SignInButton,
    SignUpButton,
    SignOutButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'
import Link from 'next/link';

export function Appbar(){
    return <div className='flex justify-between items-center py-6 px-8 font-pixelify text-xl bg-black'>
        <div className='text-3xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 font-pixelify'>ChillTown</div>
        <div className='flex gap-x-8 text-white'>
            <Link href={"/marketplace"} className='border-yellow-300 rounded-full px-6 py-2 border hover:border-orange-400 transition-colors duration-150'>
                Marketplace
            </Link>
            <SignedOut>
                <div className='flex gap-x-6 font-pixelify'>
                    <div className='border-yellow-300 rounded-full px-6 py-2 border hover:border-orange-400 transition-colors duration-150'>
                    <SignInButton />
                    </div>
                    <div className='border-yellow-300 rounded-full px-6 py-2 border hover:border-orange-400 transition-colors duration-150'>
                    <SignUpButton />
                    </div>
                </div>
            </SignedOut>
            <SignedIn>
                     <UserButton />
                     <SignOutButton />
            </SignedIn>
        </div>
    </div>
}