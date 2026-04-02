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
import { getCodeTemplate } from "../utils/codeTemplates";

const createTechnicalState = () => ({
  answer: "",
  language: "javascript",
  code: getCodeTemplate("javascript"),
  output: "",
  showOutput: true,
  languageDrafts: {
    javascript: getCodeTemplate("javascript"),
    typescript: getCodeTemplate("typescript"),
    python: getCodeTemplate("python"),
    java: getCodeTemplate("java"),
    cpp: getCodeTemplate("cpp"),
    go: getCodeTemplate("go"),
  },
});

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, mode = "Technical" } = interviewData;
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
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const videoRef = useRef(null);
  const [showEditor, setShowEditor] = useState(true);

  const [questionStates, setQuestionStates] = useState(
    questions.map(() => (isTechnicalMode ? createTechnicalState() : { answer: "" }))
  );

  const currentQuestion = questions[currentIndex];
  const currentState = useMemo(() => {
    if (!questionStates[currentIndex]) {
      return isTechnicalMode ? createTechnicalState() : { answer: "" };
    }
    return questionStates[currentIndex];
  }, [questionStates, currentIndex, isTechnicalMode]);

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
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("zira") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("david") ||
          voice.name.toLowerCase().includes("mark") ||
          voice.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
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
      code: state.languageDrafts?.[language] || getCodeTemplate(language),
      output: "",
    }));
  };

  const handleCodeChange = (code) => {
    updateCurrentState((state) => ({
      code,
      languageDrafts: {
        ...(state.languageDrafts || {}),
        [state.language]: code,
      },
    }));
  };

  const handleResetTemplate = () => {
    updateCurrentState((state) => ({
      code: getCodeTemplate(state.language),
      output: "",
      languageDrafts: {
        ...(state.languageDrafts || {}),
        [state.language]: getCodeTemplate(state.language),
      },
    }));
  };

  const runCode = () => {
    if (!isTechnicalMode) return;

    if (currentState.language !== "javascript") {
      updateCurrentState({
        output: `Quick run is available for JavaScript only right now. You can still submit ${currentState.language} solutions for AI review.`,
        showOutput: true,
      });
      return;
    }

    try {
      const logs = [];
      const mockConsole = {
        log: (...args) =>
          logs.push(
            args
              .map((item) => {
                if (typeof item === "object") return JSON.stringify(item);
                return String(item);
              })
              .join(" ")
          ),
      };

      const runner = new Function(
        "console",
        `${currentState.code}\nreturn typeof solve === "function" ? solve("sample input") : undefined;`
      );
      const result = runner(mockConsole);

      if (result !== undefined) {
        logs.push(String(result));
      }

      updateCurrentState({
        output: logs.join("\n") || "Code ran successfully with no output.",
        showOutput: true,
      });
    } catch (error) {
      updateCurrentState({
        output: `Runtime Error: ${error.message}`,
        showOutput: true,
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
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback]);

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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1700px] min-h-[86vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col xl:flex-row overflow-hidden">
        <div className="w-full xl:w-[30%] bg-white flex flex-col p-6 space-y-6 border-r border-gray-200">
          <div className="w-full rounded-2xl overflow-hidden shadow-xl bg-slate-950">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {subtitle && (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">{subtitle}</p>
            </div>
          )}

          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAIPlaying && <span className="text-sm font-semibold text-emerald-600">AI Speaking</span>}
            </div>

            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>
            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                <span className="block text-xs text-gray-400">Current Question</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
                <span className="block text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>

          {!isIntroPhase && (
            <div className="bg-linear-to-br from-slate-950 to-slate-800 text-white rounded-2xl p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80 mb-2">Current Prompt</p>
              <div className="text-base font-semibold leading-relaxed">{currentQuestion?.question}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs">Mode: {mode}</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs">Difficulty: {currentQuestion?.difficulty}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 gap-6 bg-linear-to-br from-white to-slate-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">AI Smart Interview</h2>
              <p className="text-slate-500 mt-1">
                {isTechnicalMode
                  ? "Your written response and your code now live in separate spaces. Run quick checks in the workspace, then submit when you are ready."
                  : "Answer naturally and clearly as you would in a real interview."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-2">
                {isTechnicalMode ? <FaCode size={14} /> : <FaRegLightbulb size={14} />} {mode} Round
              </div>
              {isTechnicalMode && (
                <button
                  type="button"
                  onClick={() => setShowEditor((prev) => !prev)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition"
                >
                  {showEditor ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />} {showEditor ? "Hide Editor" : "Show Editor"}
                </button>
              )}
            </div>
          </div>

          {isTechnicalMode ? (
            <div className={`grid gap-6 flex-1 min-h-0 ${showEditor ? "xl:grid-cols-[0.75fr_1.25fr]" : "grid-cols-1"}`}>
              <div className="flex flex-col min-h-0">
                <div className="relative mb-6 bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Question {currentIndex + 1} of {questions.length}</p>
                  <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</div>
                </div>

                <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
                  Speak or type your explanation here. Your code stays in the workspace and is submitted alongside this response.
                </div>

                <textarea
                  placeholder="Explain your approach here or keep speaking with the mic on. This is your response area only."
                  onChange={(event) => updateCurrentState({ answer: event.target.value })}
                  value={currentState.answer || ""}
                  className="flex-1 min-h-[220px] bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
                />

                {!showEditor && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
                    Code workspace is hidden. Your current {currentState.language} solution is still saved and will be submitted with your response.
                  </div>
                )}
              </div>

              {showEditor && (
                <div className="min-h-[680px]">
                  <CodeEditorPanel
                    language={currentState.language}
                    code={currentState.code}
                    runOutput={currentState.output}
                    showOutput={currentState.showOutput}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={handleCodeChange}
                    onRunCode={runCode}
                    onToggleOutput={() => updateCurrentState({ showOutput: !currentState.showOutput })}
                    onResetTemplate={handleResetTemplate}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {!isIntroPhase && (
                <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Question {currentIndex + 1} of {questions.length}</p>
                  <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</div>
                </div>
              )}
              <textarea
                placeholder="Type your answer here..."
                onChange={(event) => updateCurrentState({ answer: event.target.value })}
                value={currentState.answer || ""}
                className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
              />
            </>
          )}

          {!feedback ? (
            <div className="flex items-center gap-4 mt-auto">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500"
              >
                {isSubmitting ? "Submitting..." : isTechnicalMode ? "Submit Work" : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
