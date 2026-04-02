export const languageOptions = [
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "TypeScript", value: "typescript", monaco: "typescript" },
  { label: "Python", value: "python", monaco: "python" },
  { label: "Java", value: "java", monaco: "java" },
  { label: "C++", value: "cpp", monaco: "cpp" },
  { label: "Go", value: "go", monaco: "go" },
  { label: "CSS", value: "css", monaco: "css" },
];

export const codeTemplates = {
  javascript: `function solve(input) {\n  // write your solution here\n  return input;\n}\n`,
  typescript: `function solve(input: string): string {\n  // write your solution here\n  return input;\n}\n`,
  python: `def solve(input_data):\n    # write your solution here\n    return input_data\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // write your solution here\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your solution here\n    return 0;\n}\n`,
  go: `package main\n\nimport \"fmt\"\n\nfunc main() {\n    // write your solution here\n    fmt.Println(\"ready\")\n}\n`,
};

export const debugTemplates = {
  javascript: `function sumPositive(numbers) {
  let total = 0;

  for (let index = 0; index <= numbers.length; index += 1) {
    if (numbers[index] > 0) {
      total += numbers[index];
    }
  }

  return total;
}

console.log(sumPositive([2, -1, 4]));
`,
  typescript: `function sumPositive(numbers: number[]): number {
  let total = 0;

  for (let index = 0; index <= numbers.length; index += 1) {
    if (numbers[index] > 0) {
      total += numbers[index];
    }
  }

  return total;
}

console.log(sumPositive([2, -1, 4]));
`,
  python: `def sum_positive(numbers):
    total = 0

    for index in range(len(numbers) + 1):
        if numbers[index] > 0:
            total += numbers[index]

    return total

print(sum_positive([2, -1, 4]))
`,
  java: `import java.util.*;

public class Solution {
    static int sumPositive(int[] numbers) {
        int total = 0;

        for (int index = 0; index <= numbers.length; index++) {
            if (numbers[index] > 0) {
                total += numbers[index];
            }
        }

        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumPositive(new int[]{2, -1, 4}));
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int sumPositive(const vector<int>& numbers) {
    int total = 0;

    for (size_t index = 0; index <= numbers.size(); index++) {
        if (numbers[index] > 0) {
            total += numbers[index];
        }
    }

    return total;
}

int main() {
    cout << sumPositive({2, -1, 4}) << endl;
    return 0;
}
`,
  go: `package main

import "fmt"

func sumPositive(numbers []int) int {
    total := 0

    for index := 0; index <= len(numbers); index++ {
        if numbers[index] > 0 {
            total += numbers[index]
        }
    }

    return total
}

func main() {
    fmt.Println(sumPositive([]int{2, -1, 4}))
}
`,
  css: `.profile-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #dbe4f0;
}

.profile-card__title {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.profile-card__meta {
  color: #64748b;
  margin-top: 8px;
}
`,
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
  css: {
    available: false,
    label: "Review only",
    description: "CSS can be reviewed by the AI but not executed on the server.",
  },
};

export const getCodeTemplate = (language) => codeTemplates[language] || codeTemplates.javascript;
export const getDebugTemplate = (language) => debugTemplates[language] || debugTemplates.javascript;
export const getMonacoLanguage = (language) => languageOptions.find((item) => item.value === language)?.monaco || 'javascript';
