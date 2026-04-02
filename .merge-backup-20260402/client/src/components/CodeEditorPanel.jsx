import React from "react";
import Editor from "@monaco-editor/react";
import { FaCode, FaPlay, FaRegEye, FaRegEyeSlash, FaRotateLeft, FaTerminal } from "react-icons/fa6";
import { languageOptions } from "../utils/codeTemplates";

function CodeEditorPanel({
  language,
  code,
  runOutput,
  showOutput,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onToggleOutput,
  onResetTemplate,
}) {
  return (
    <div className="h-full flex flex-col rounded-[28px] overflow-hidden border border-slate-200 shadow-xl bg-white">
      <div className="px-5 py-4 bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <FaCode />
            </div>
            <div>
              <h3 className="text-base font-semibold">Technical Workspace</h3>
              <p className="text-xs text-white/70">Write code, run quick checks, and inspect output without leaving the interview.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onRunCode}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition text-sm font-semibold"
            >
              <FaPlay size={12} /> Run Code
            </button>
            <button
              type="button"
              onClick={onResetTemplate}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
            >
              <FaRotateLeft size={12} /> Reset Template
            </button>
            <button
              type="button"
              onClick={onToggleOutput}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
            >
              {showOutput ? <FaRegEyeSlash size={12} /> : <FaRegEye size={12} />} {showOutput ? "Hide Output" : "Show Output"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {languageOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onLanguageChange(item.value)}
              className={`px-3 py-2 rounded-full text-sm transition border ${language === item.value ? "bg-emerald-400 text-slate-950 border-emerald-300 font-semibold" : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[360px] bg-[#0b1020]">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value) => onCodeChange(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            fontLigatures: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 16 },
          }}
        />
      </div>

      {showOutput && (
        <div className="border-t border-slate-200 bg-slate-950 text-emerald-200 p-4 min-h-[150px]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-emerald-300/80 mb-3">
            <FaTerminal size={12} /> Output
          </div>
          <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-6">{runOutput || "Run your code to see output here."}</pre>
        </div>
      )}
    </div>
  );
}

export default CodeEditorPanel;
