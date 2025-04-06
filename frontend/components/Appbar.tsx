"use client";

import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

export function Appbar(){
    return <div className='flex justify-between items-center p-4 font-pixelify text-xl'>
        <div className='text-3xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 font-pixelify'>ChillTown</div>
        <div>
            <SignedOut>
                <div className='flex gap-x-3 font-sans'>
                    <div className='border-b border-b-transparent hover:border-b hover:border-b-yellow-500'>
                    <SignInButton />
                    </div>
                    <div className='border-b border-b-transparent hover:border-b hover:border-b-yellow-500'>
                    <SignUpButton />
                    </div>
                </div>
            </SignedOut>
            <SignedIn>
                     <UserButton />
            </SignedIn>
        </div>
    </div>
}