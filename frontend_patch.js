const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "frontend/src/app/(app)/fd/page.tsx");
let content = fs.readFileSync(file, "utf-8");

// Conditionally render compounding UI in Create Form
content = content.replace(
  /<div>\s*<label className="label">Compounding Frequency<\/label>[\s\S]*?<\/select>\s*<\/div>/,
  `{form.interest_type === "compound" && (
                  <div>
                    <label className="label">Compounding Frequency *</label>
                    <select className="input" required value={form.compounding_frequency} onChange={(e) => setF("compounding_frequency", e.target.value)}>
                      <option value="">Select...</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half-Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}`
);

// Conditionally render compounding UI in Calc Form
content = content.replace(
  /<div>\s*<label className="label">Compounding<\/label>[\s\S]*?<\/select>\s*<\/div>/,
  `{calcForm.interest_type === "compound" && (
                  <div>
                    <label className="label">Compounding Frequency *</label>
                    <select className="input" required value={calcForm.compounding_frequency} onChange={(e) => setC("compounding_frequency", e.target.value)}>
                      <option value="">Select...</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half-Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}`
);

// Form Setters to reset when changing to simple
content = content.replace(
  /const setF = \(k: string, v: string\) => setForm\(\(p\) => \(\{ \.\.\.p, \[k\]: v \}\)\);/,
  `const setF = (k: string, v: string) => setForm((p) => { 
    if (k === "interest_type" && v === "simple") return { ...p, [k]: v, compounding_frequency: "" };
    return { ...p, [k]: v };
  });`
);

content = content.replace(
  /const setC = \(k: string, v: string\) => \{ setCalcForm\(\(p\) => \(\{ \.\.\.p, \[k\]: v \}\)\); setMaturity\(null\); \};/,
  `const setC = (k: string, v: string) => { 
    setCalcForm((p) => {
      if (k === "interest_type" && v === "simple") return { ...p, [k]: v, compounding_frequency: "" };
      return { ...p, [k]: v };
    }); 
    setMaturity(null); 
  };`
);

fs.writeFileSync(file, content, "utf-8");
console.log("Patched frontend UI");