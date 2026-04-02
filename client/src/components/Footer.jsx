import React from 'react'
import { BsRobot } from 'react-icons/bs'

function Footer() {
  return (
    <div className='flex justify-center px-4 pb-10 py-4 pt-10'>
      <div className='w-full max-w-6xl rounded-[24px] border border-white/60 bg-white/85 px-3 py-8 text-center shadow-sm backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/88'>
        <div className='flex justify-center items-center gap-3 mb-3'>
            <div className='rounded-lg bg-slate-950 p-2 text-white dark:bg-emerald-500 dark:text-slate-950'><BsRobot size={16}/></div>
            <h2 className='font-semibold text-slate-900 dark:text-slate-50'>InterviewIQ.AI</h2>
        </div>
        <p className='mx-auto max-w-xl text-sm text-slate-500 dark:text-slate-400'>
  AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>


      </div>
    </div>
  )
}

export default Footer
