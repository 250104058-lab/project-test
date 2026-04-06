const { execSync } = require("child_process");
const fs = require("fs");

function getChangedFiles() {
  try {
    const output = execSync(
      "git diff --name-only HEAD~1 HEAD",
      { encoding: "utf-8" }
    );
    return output.split("\n").filter(Boolean);
  } catch (e) {
    console.log("No git history yet");
    return [];
  }
}

function shouldProcess(file) {
  return (
    (file.endsWith(".tsx") || file.endsWith(".ts")) &&
    !file.includes(".test.")
  );
}

function generateTest(file) {
  const testFile = file.replace(/\.tsx?$/, ".test.tsx");

  if (fs.existsSync(testFile)) {
    console.log(`Skip (already has test): ${testFile}`);
    return;
  }

  console.log(`Generating test for: ${file}`);

  const content = `
import { render } from "@testing-library/react";
import Component from "../${file}";

describe("${file}", () => {
  it("should render without crashing", () => {
    render(<Component />);
  });
});
`;

  fs.writeFileSync(testFile, content);
}

function main() {
  const files = getChangedFiles();

  files.forEach((file) => {
    if (shouldProcess(file)) {
      generateTest(file);
    }
  });
}

main();