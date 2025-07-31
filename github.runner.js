// runGitCommands.js
import { execSync } from "child_process";

try {
  execSync("git add .", { stdio: "inherit" });
  const message = "some change";
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });

  execSync("git push", { stdio: "inherit" });
} catch (error) {
  console.error("Error running git commands:", error.message);
}
