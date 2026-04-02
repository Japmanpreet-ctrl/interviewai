import React, { useState } from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
    FaBullseye,
    FaArrowRight,
} from "react-icons/fa";
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AtsScoreCard from './AtsScoreCard';
import { useNavigate } from 'react-router-dom';

function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [targetRole, setTargetRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsReport, setAtsReport] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPricingCta, setShowPricingCta] = useState(false);

    const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

    const goToPricing = () => {
        navigate('/pricing', {
            state: {
                reason: 'low-credits',
                message: errorMessage || 'Not enough credits. Minimum 50 required.',
                from: '/interview',
            },
        })
    }

    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)
        setErrorMessage("")
        setShowPricingCta(false)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            setRole(result.data.role || "");
            setTargetRole(result.data.role || targetRole);
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);
            setAtsReport(null);
        } catch (error) {
            console.log(error)
            setErrorMessage(getErrorMessage(error, "Resume analysis failed."))
        } finally {
            setAnalyzing(false);
        }
    }

    const handleAnalyzeAts = async () => {
        if (!resumeText || atsLoading) return;
        setAtsLoading(true)
        setErrorMessage("")
        setShowPricingCta(false)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/ats-score", {
                targetRole: targetRole || role,
                jobDescription,
                resumeText,
                skills,
                projects,
                extractedRole: role,
                experience,
            }, { withCredentials: true })

            setAtsReport(result.data)
        } catch (error) {
            console.log(error)
            setErrorMessage(getErrorMessage(error, "ATS scoring failed."))
        } finally {
            setAtsLoading(false)
        }
    }

    const handleStart = async () => {
        if (!userData) {
            setErrorMessage("Please sign in again before starting the interview.")
            setShowPricingCta(false)
            return;
        }

        setLoading(true)
        setErrorMessage("")
        setShowPricingCta(false)
        try {
            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", { role, experience, mode, resumeText, projects, skills }, { withCredentials: true })
            if (userData) {
                dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
            }
            onStart({ ...result.data, mode })
        } catch (error) {
            console.log(error)
            const message = getErrorMessage(error, "Interview could not start.")
            const lowCredits = message.toLowerCase().includes("credit")
            setErrorMessage(message)
            setShowPricingCta(lowCredits)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8'>

            <div className='w-full max-w-7xl bg-white rounded-3xl shadow-2xl grid lg:grid-cols-[0.95fr_1.25fr] overflow-hidden'>

                <motion.div
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='relative bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center'>

                    <h2 className="text-4xl font-bold text-gray-800 mb-6">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 mb-10">
                        Upload your resume, check its ATS strength, and begin a more role-aware mock interview.
                    </p>

                    <div className='space-y-5'>
                        {[
                            {
                                icon: <FaUserTie className="text-green-600 text-xl" />,
                                text: "Choose Role & Experience",
                            },
                            {
                                icon: <FaBullseye className="text-green-600 text-xl" />,
                                text: "See ATS Score Before Interview",
                            },
                            {
                                icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                text: "Smart Voice Interview",
                            },
                            {
                                icon: <FaChartLine className="text-green-600 text-xl" />,
                                text: "Performance Analytics",
                            },
                        ].map((item, index) => (
                            <motion.div key={index}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                                whileHover={{ scale: 1.03 }}
                                className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer'>
                                {item.icon}
                                <span className='text-gray-700 font-medium'>{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="p-8 md:p-12 bg-white space-y-6">

                    <h2 className='text-3xl font-bold text-gray-800'>Interview Setup</h2>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl px-4 py-4 text-sm shadow-sm ${showPricingCta ? 'border border-amber-200 bg-amber-50 text-amber-900' : 'border border-rose-200 bg-rose-50 text-rose-700'}`}
                        >
                            <p className='font-medium'>{errorMessage}</p>
                            {showPricingCta && (
                                <div className='mt-3 flex flex-wrap items-center gap-3'>
                                    <button
                                        type='button'
                                        onClick={goToPricing}
                                        className='inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 transition'
                                    >
                                        View Plans <FaArrowRight size={12} />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setShowPricingCta(false)}
                                        className='rounded-full border border-amber-300 px-4 py-2 text-amber-800 hover:bg-amber-100 transition'
                                    >
                                        Stay Here
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Enter role'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>

                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />
                        </div>
                    </div>

                    <select value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className='w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'>
                        <option value="Technical">Technical Interview</option>
                        <option value="HR">HR Interview</option>
                    </select>

                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='relative'>
                            <FaBullseye className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Target role for ATS'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setTargetRole(e.target.value)} value={targetRole} />
                        </div>
                        <textarea
                            rows={4}
                            placeholder='Optional job description for better ATS scoring'
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition resize-none'
                            onChange={(e) => setJobDescription(e.target.value)}
                            value={jobDescription}
                        />
                    </div>

                    {!analysisDone && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => document.getElementById("resumeUpload").click()}
                            className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition'>

                            <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3' />

                            <input type="file"
                                accept="application/pdf"
                                id="resumeUpload"
                                className='hidden'
                                onChange={(e) => setResumeFile(e.target.files[0])} />

                            <p className='text-gray-600 font-medium'>
                                {resumeFile ? resumeFile.name : "Click to upload resume"}
                            </p>

                            {resumeFile && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUploadResume()
                                    }}
                                    className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition'>
                                    {analyzing ? "Analyzing Resume..." : "Analyze Resume"}
                                </motion.button>)}
                        </motion.div>
                    )}

                    {analysisDone && (
                        <div className='space-y-5'>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'>
                                <div className='flex items-center justify-between gap-4'>
                                    <h3 className='text-lg font-semibold text-gray-800'>Resume Analysis Result</h3>
                                    <button
                                        onClick={handleAnalyzeAts}
                                        disabled={atsLoading}
                                        className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400'>
                                        {atsLoading ? "Scoring ATS..." : "Analyze ATS Score"}
                                    </button>
                                </div>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1'>Projects:</p>
                                        <ul className='list-disc list-inside text-gray-600 space-y-1'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 mb-1'>Skills:</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            <AtsScoreCard report={atsReport} />
                        </div>
                    )}

                    <motion.button
                        onClick={handleStart}
                        disabled={!role || !experience || loading || !analysisDone}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
                        {loading ? "Starting..." : "Start Interview"}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default Step1SetUp
