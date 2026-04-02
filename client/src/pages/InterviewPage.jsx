import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCheck } from 'react-icons/fa'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
    const [step, setStep] = useState(1)
    const [interviewData, setInterviewData] = useState(null)
    const navigate = useNavigate()

    const steps = useMemo(() => ([
        { id: 1, label: 'Setup' },
        { id: 2, label: 'Interview' },
        { id: 3, label: 'Report' },
    ]), [])

    const handleBack = () => {
        if (step === 1) {
            navigate('/')
            return
        }
        setStep((prev) => prev - 1)
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur'>
                <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
                    <button
                        onClick={handleBack}
                        className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50'
                    >
                        <FaArrowLeft size={12} /> {step === 1 ? 'Back Home' : 'Previous Step'}
                    </button>

                    <div className='flex items-center gap-2 sm:gap-3'>
                        {steps.map((item) => {
                            const isActive = step === item.id
                            const isDone = step > item.id
                            const badgeClass = isActive
                                ? 'bg-emerald-600 text-white shadow'
                                : isDone
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500'
                            const labelClass = isActive ? 'text-gray-900' : 'text-gray-500'

                            return (
                                <div key={item.id} className='flex items-center gap-2'>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${badgeClass}`}>
                                        {isDone ? <FaCheck size={12} /> : item.id}
                                    </div>
                                    <span className={`hidden text-sm font-medium sm:block ${labelClass}`}>{item.label}</span>
                                    {item.id !== steps.length && <div className='hidden h-px w-8 bg-gray-200 sm:block' />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {step === 1 && (
                <Step1SetUp onStart={(data) => {
                    setInterviewData(data)
                    setStep(2)
                }} />
            )}

            {step === 2 && (
                <Step2Interview
                    interviewData={interviewData}
                    onFinish={(report) => {
                        setInterviewData(report)
                        setStep(3)
                    }}
                />
            )}

            {step === 3 && (
                <Step3Report report={interviewData} />
            )}
        </div>
    )
}

export default InterviewPage
