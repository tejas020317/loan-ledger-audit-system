const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/(app)/fd/page.tsx");
let content = fs.readFileSync(file, "utf-8");

content = content.replace(/<label className="label">Interest Type \*/g, '<label className="label">Interest Type: Simple \/ Compound *');

fs.writeFileSync(file, content, "utf-8");
console.log("Patched label");