export const languageOptions = [
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "TypeScript", value: "typescript", monaco: "typescript" },
  { label: "Python", value: "python", monaco: "python" },
  { label: "Java", value: "java", monaco: "java" },
  { label: "C++", value: "cpp", monaco: "cpp" },
  { label: "Go", value: "go", monaco: "go" },
];

export const codeTemplates = {
  javascript: `function solve(input) {\n  // write your solution here\n  return input;\n}\n`,
  typescript: `function solve(input: string): string {\n  // write your solution here\n  return input;\n}\n`,
  python: `def solve(input_data):\n    # write your solution here\n    return input_data\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // write your solution here\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your solution here\n    return 0;\n}\n`,
  go: `package main\n\nimport \"fmt\"\n\nfunc main() {\n    // write your solution here\n    fmt.Println(\"ready\")\n}\n`,
};

export const quickRunSupport = {
  javascript: {
    available: true,
    label: "Quick run ready",
    description: "Runs locally on the interview server.",
  },
  typescript: {
    available: false,
    label: "Review only",
    description: "TypeScript runtime is not installed on the server yet.",
  },
  python: {
    available: true,
    label: "Quick run ready",
    description: "Runs locally on the interview server.",
  },
  java: {
    available: false,
    label: "Review only",
    description: "Java runtime is not installed on the server yet.",
  },
  cpp: {
    available: true,
    label: "Quick run ready",
    description: "Compiles and runs locally on the interview server.",
  },
  go: {
    available: false,
    label: "Review only",
    description: "Go is not installed on the server yet.",
  },
};

export const getCodeTemplate = (language) => codeTemplates[language] || codeTemplates.javascript;
export const getMonacoLanguage = (language) => languageOptions.find((item) => item.value === language)?.monaco || 'javascript';
