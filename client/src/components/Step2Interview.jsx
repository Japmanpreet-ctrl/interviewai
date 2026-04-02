import React, { useEffect, useMemo, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";
import { FaCode, FaRegEye, FaRegEyeSlash, FaRegLightbulb } from "react-icons/fa6";
import CodeEditorPanel from "./CodeEditorPanel";
import { getCodeTemplate, getDebugTemplate } from "../utils/codeTemplates";

const getQuestionStarterCode = (question, language = "javascript") => {
  if (language === "javascript" && question?.starterCode?.trim()) {
    return question.starterCode.trim();
  }

  if (question?.questionType === "debugging") {
    return getDebugTemplate(language);
  }

  return getCodeTemplate(language);
};

const createTechnicalState = (question) => ({
  answer: "",
  language: "javascript",
  code: getQuestionStarterCode(question, "javascript"),
  output: "",
  runStatus: "idle",
  isRunning: false,
  showOutput: true,
  languageDrafts: {
    javascript: getQuestionStarterCode(question, "javascript"),
    typescript: getQuestionStarterCode(question, "typescript"),
    python: getQuestionStarterCode(question, "python"),
    java: getQuestionStarterCode(question, "java"),
    cpp: getQuestionStarterCode(question, "cpp"),
    go: getQuestionStarterCode(question, "go"),
    css: getQuestionStarterCode(question, "css"),
  },
});

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, mode = "Technical", voicePreference = "female" } = interviewData
  const isTechnicalMode = mode === "Technical";
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState(voicePreference);
  const [subtitle, setSubtitle] = useState("");
  const videoRef = useRef(null);
  const [showEditor, setShowEditor] = useState(() => isTechnicalMode ? Boolean(questions[0]?.requiresCode) : false);

  const [questionStates, setQuestionStates] = useState(
    questions.map((question) => (isTechnicalMode ? createTechnicalState(question) : { answer: "" }))
  );

  const currentQuestion = questions[currentIndex];
  const currentState = useMemo(() => {
    if (!questionStates[currentIndex]) {
      return isTechnicalMode ? createTechnicalState() : { answer: "" };
    }
    return questionStates[currentIndex];
  }, [questionStates, currentIndex, isTechnicalMode]);
  const technicalTimerReached = isTechnicalMode && timeLeft === 0 && !feedback;
  const suggestedMinutes = Math.max(1, Math.round((currentQuestion?.timeLimit || 60) / 60));

  const updateCurrentState = (updater) => {
    setQuestionStates((prev) =>
      prev.map((item, index) => {
        if (index !== currentIndex) return item;
        const updates = typeof updater === "function" ? updater(item) : updater;
        return { ...item, ...updates };
      })
    );
  };

  useEffect(() => {
    const preferredGender = voicePreference === "male" ? "male" : "female";

    const matchesGender = (voice, gender) => {
      const name = voice.name.toLowerCase();
      if (gender === "male") {
        return name.includes("david") || name.includes("mark") || name.includes("male");
      }

      return name.includes("zira") || name.includes("samantha") || name.includes("female");
    };

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const preferredVoice = voices.find((voice) => matchesGender(voice, preferredGender));
      const fallbackVoice = voices.find((voice) => matchesGender(voice, preferredGender === "male" ? "female" : "male"));
      const nextVoice = preferredVoice || fallbackVoice || voices[0];

      setSelectedVoice(nextVoice);
      setVoiceGender(preferredVoice ? preferredGender : preferredGender === "male" ? "female" : "male");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voicePreference]);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text) =>
    new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);
        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });

  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it is great to meet you today. I hope you are feeling confident and ready.`);
        await speakText(
          isTechnicalMode
            ? "For technical questions, you can explain your thinking, write code, and run quick checks in the workspace. Let us begin."
            : "I will ask you a few questions. Just answer naturally, and take your time. Let us begin."
        );
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
        if (isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, currentQuestion]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex, isIntroPhase, currentQuestion]);

  useEffect(() => {
    if (!isTechnicalMode || !currentQuestion) return;
    setShowEditor(Boolean(currentQuestion.requiresCode));
  }, [currentIndex, currentQuestion, isTechnicalMode]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      updateCurrentState((state) => ({
        answer: `${(state.answer || "").trim()} ${transcript}`.trim(),
      }));
    };

    recognitionRef.current = recognition;
  }, [currentIndex]);

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const handleLanguageChange = (language) => {
    updateCurrentState((state) => ({
      language,
      code: state.languageDrafts?.[language] || getQuestionStarterCode(currentQuestion, language),
      output: "",
      runStatus: "idle",
    }));
  };

  const handleCodeChange = (code) => {
    updateCurrentState((state) => ({
      code,
      runStatus: state.code === code ? state.runStatus : "idle",
      languageDrafts: {
        ...(state.languageDrafts || {}),
        [state.language]: code,
      },
    }));
  };

  const handleResetTemplate = () => {
    updateCurrentState((state) => {
      const nextTemplate = getQuestionStarterCode(currentQuestion, state.language);

      return {
        code: nextTemplate,
        output: "",
        runStatus: "idle",
        languageDrafts: {
          ...(state.languageDrafts || {}),
          [state.language]: nextTemplate,
        },
      };
    });
  };

  const runCode = async () => {
    if (!isTechnicalMode) return;

    updateCurrentState({
      isRunning: true,
      showOutput: true,
      output: "Running your latest code...",
    });

    try {
      const result = await axios.post(
        `${ServerUrl}/api/interview/quick-run`,
        {
          language: currentState.language,
          code: currentState.code,
        },
        { withCredentials: true }
      );

      updateCurrentState({
        isRunning: false,
        output: result.data.output || "Program finished with no output.",
        showOutput: true,
        runStatus: result.data.status || (result.data.ok ? "success" : "error"),
      });
    } catch (error) {
      updateCurrentState({
        isRunning: false,
        output: error?.response?.data?.message || "Quick run failed. Please try again.",
        showOutput: true,
        runStatus: "error",
      });
    }
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer: currentState.answer || "",
          explanation: currentState.answer || "",
          code: isTechnicalMode ? currentState.code || "" : "",
          language: isTechnicalMode ? currentState.language || "javascript" : "javascript",
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNext = async () => {
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let us move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) {
        startMic();
      }
    }, 500);
  };

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    if (!isTechnicalMode && timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback, isTechnicalMode]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#f1f5f9)] p-4 sm:p-6">
      <div className="mx-auto flex min-h-[86vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">AI Smart Interview</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500 sm:text-base">
                {isTechnicalMode
                  ? "A cleaner split workspace for reasoning on the left and coding on the right."
                  : "Answer naturally and clearly as you would in a real interview."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                {isTechnicalMode ? <FaCode size={14} /> : <FaRegLightbulb size={14} />} {mode} Round
              </div>
              {isTechnicalMode && (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentQuestion?.requiresCode) {
                      setShowEditor((prev) => !prev)
                    }
                  }}
                  disabled={currentQuestion?.requiresCode}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {showEditor ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />} {currentQuestion?.requiresCode ? "Workspace Required" : showEditor ? "Hide Editor" : "Open Workspace"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col xl:flex-row">
          <div className={`flex w-full flex-col border-slate-200 ${showEditor && isTechnicalMode ? "xl:w-1/2 xl:border-r" : "xl:w-full"} bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)]`}>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="mb-5 grid gap-4 md:grid-cols-[240px_1fr]">
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950 shadow-sm">
                  <video
                    src={videoSource}
                    key={videoSource}
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Question {currentIndex + 1} of {questions.length}</p>
                      <div className="mt-3 text-lg font-semibold leading-relaxed text-slate-900">{currentQuestion?.question}</div>
                    </div>
                    <div className="grid min-w-[180px] grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <div className="text-xs text-slate-400">Time</div>
                        <div className="mt-2 flex justify-center">
                          <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                        <div className="text-xs text-slate-400">Progress</div>
                        <div className="mt-3 text-2xl font-bold text-slate-900">{currentIndex + 1}/{questions.length}</div>
                        <div className="mt-1 text-xs text-slate-400">{currentQuestion?.difficulty}</div>
                      </div>
                    </div>
                  </div>

                  {subtitle && (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>

              {isTechnicalMode ? (
                <>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">Explain approach separately from code</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                      {technicalTimerReached ? "Suggested time passed, submit when ready" : `${suggestedMinutes} min suggested solve window`}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">{currentState.language.toUpperCase()} workspace selected</span>
                  </div>

                  <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">Response</p>
                      <p className="mt-1 text-sm text-slate-500">Describe your reasoning, edge cases, and final approach here.</p>
                    </div>
                    <textarea
                      placeholder="Explain your approach here or keep speaking with the mic on."
                      onChange={(event) => updateCurrentState({ answer: event.target.value })}
                      value={currentState.answer || ""}
                      className="min-h-[320px] flex-1 resize-none border-0 bg-white px-5 py-4 text-slate-800 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {!isIntroPhase && (
                    <div className="relative mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm sm:p-6">
                      <p className="mb-2 text-xs text-gray-400 sm:text-sm">Question {currentIndex + 1} of {questions.length}</p>
                      <div className="text-base font-semibold leading-relaxed text-gray-800 sm:text-lg">{currentQuestion?.question}</div>
                    </div>
                  )}
                  <textarea
                    placeholder="Type your answer here..."
                    onChange={(event) => updateCurrentState({ answer: event.target.value })}
                    value={currentState.answer || ""}
                    className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-100 p-4 text-gray-800 outline-none transition focus:ring-2 focus:ring-emerald-500 sm:p-6"
                  />
                </>
              )}

              {!feedback ? (
                <div className="mt-5 flex items-center gap-4">
                  <motion.button
                    onClick={toggleMic}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg sm:h-14 sm:w-14"
                  >
                    {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                  </motion.button>

                  <motion.button
                    onClick={submitAnswer}
                    disabled={isSubmitting}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-2xl bg-slate-950 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:bg-gray-500 sm:py-4"
                  >
                    {isSubmitting ? "Submitting..." : isTechnicalMode ? "Submit Work" : "Submit Answer"}
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
                >
                  <p className="mb-4 font-medium text-emerald-700">{feedback}</p>
                  <button
                    onClick={handleNext}
                    className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-950 py-3 text-white transition hover:bg-slate-800"
                  >
                    Next Question <BsArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {isTechnicalMode && showEditor && (
            <div className="w-full xl:w-1/2 bg-slate-50 p-4 sm:p-5">
              <div className="h-full min-h-[760px]">
                <CodeEditorPanel
                  language={currentState.language}
                  code={currentState.code}
                  runOutput={currentState.output}
                  showOutput={currentState.showOutput}
                  isRunning={currentState.isRunning}
                  runStatus={currentState.runStatus}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={handleCodeChange}
                  onRunCode={runCode}
                  onToggleOutput={() => updateCurrentState({ showOutput: !currentState.showOutput })}
                  onResetTemplate={handleResetTemplate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
