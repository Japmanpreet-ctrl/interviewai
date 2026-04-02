import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import ThemeToggle from './ThemeToggle';
function Navbar() {
    const {userData} = useSelector((state)=>state.user)
    const [showCreditPopup,setShowCreditPopup] = useState(false)
    const [showUserPopup,setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout" , {withCredentials:true})
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")

        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div className='flex justify-center px-4 pt-6'>
        <motion.div 
        initial={{opacity:0 , y:-40}}
        animate={{opacity:1 , y:0}}
        transition={{duration: 0.3}}
        className='w-full max-w-6xl rounded-[24px] border border-white/60 bg-white/85 px-8 py-4 flex justify-between items-center relative shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]'>
            <div className='flex items-center gap-3 cursor-pointer'>
                <div className='rounded-lg bg-slate-950 p-2 text-white dark:bg-emerald-500 dark:text-slate-950'>
                    <BsRobot size={18}/>

                </div>
                <h1 className='hidden text-lg font-semibold text-slate-900 md:block dark:text-slate-50'>InterviewIQ.AI</h1>
            </div>

            <div className='flex items-center gap-6  relative'>
                <ThemeToggle />
                <div className='relative'>
                    <button onClick={()=>{
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false)
                    }} className='flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-md text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'>
                        <BsCoin size={20}/>
                        {userData?.credits || 0}
                    </button>

                    {showCreditPopup && (
                        <div className='absolute right-[-50px] z-50 mt-3 w-64 rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900'>
                            <p className='mb-4 text-sm text-slate-600 dark:text-slate-300'>Need more credits to continue interviews?</p>
                            <button onClick={()=>navigate("/pricing")} className='w-full rounded-lg bg-slate-950 py-2 text-sm text-white dark:bg-emerald-500 dark:text-slate-950'>Buy more credits</button>

                        </div>
                    )}
                </div>

                <div className='relative'>
                    <button
                    onClick={()=>{
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        setShowUserPopup(!showUserPopup);
                        setShowCreditPopup(false)
                    }} className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 font-semibold text-white dark:bg-emerald-500 dark:text-slate-950'>
                        {userData ? userData?.name.slice(0,1).toUpperCase() : <FaUserAstronaut size={16}/>}
                        
                    </button>

                    {showUserPopup && (
                        <div className='absolute right-0 z-50 mt-3 w-48 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900'>
                            <p className='mb-1 text-md font-medium text-blue-500 dark:text-emerald-400'>{userData?.name}</p>

                            <button onClick={()=>navigate("/history")} className='w-full py-2 text-left text-sm text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white'>InterView History</button>
                            <button onClick={handleLogout} 
                            className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'>
                                <HiOutlineLogout size={16}/>
                                Logout</button>
                        </div>
                    )}
                </div>

            </div>



        </motion.div>

        {showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>}
      
    </div>
  )
}

export default Navbar
