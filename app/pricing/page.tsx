'use client'

import Navbar from '@/components/ui/Navbar'
import React from 'react'
import PricingTable from '@/components/PricingTable'

const page = () => {
    return (
        <>
            <Navbar />
            <div className='flex flex-col items-center justify-center min-h-screen px-4'>
                <PricingTable />
            </div>
        </>

    )
}

export default page
