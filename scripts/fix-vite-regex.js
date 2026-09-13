import fs from "node:fs";

const file = "src/main.jsx";
let source = fs.readFileSync(file, "utf8");

// The generated JSX contained over-escaped slash sequences inside regex
// literals. Vite/Rolldown parses those as an unterminated regex group.
const replacements = [
  ["/youtu\\\\.be|youtube\\\\.com/", "/youtu\\.be|youtube\\.com/"],
  ["/(?:v=|vi=|\\\\/)([A-Za-z0-9_-]{11})/", "/(?:v=|vi=|\\/)([A-Za-z0-9_-]{11})/"],
  ["/youtu\\\\.be\\\\/([A-Za-z0-9_-]{11})/", "/youtu\\.be\\/([A-Za-z0-9_-]{11})/"]
];

for (const [from, to] of replacements) source = source.split(from).join(to);
fs.writeFileSync(file, source);
console.log("Prepared src/main.jsx for Vite build.");
