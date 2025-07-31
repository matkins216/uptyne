import Image from 'next/image'
import React from 'react'
import monitors2 from '../public/monitors2.png'
import monitorID2 from '../public/monitorID2.png'


const HomeAbout = () => {
  return (
      <div className='flex flex-col items-center justify-center px-4 bg-[#2b7fff]/20 h-2/3 py-20 gap-6 md:gap-10'>
      <h2 className='flex text-center font-bold text-4xl md:w-[800px]'>Uptyne was made for those seeking a value-add uptime monitoring tool for freelancers</h2>
      <Image src={monitorID2} alt='individual monitor screen' width={1200} height={300} className='rounded-lg' />

      <Image src={monitors2} alt="monitoring" width={1200} height={300} className='rounded-lg'/>
    </div>
  )
}

export default HomeAbout
