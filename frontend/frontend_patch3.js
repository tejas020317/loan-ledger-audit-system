const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "src/app/(app)/fd/page.tsx");
let content = fs.readFileSync(file, "utf-8");

// Set deposit_amount to 0 if FLEXIBLE
content = content.replace(
  /deposit_amount: Number\(form\.deposit_amount\),/,
  `deposit_amount: form.deposit_type === "FLEXIBLE" ? 0 : Number(form.deposit_amount),`
);

// Conditionally hide Deposit Amount in UI if FLEXIBLE
content = content.replace(
  /<div>\s*<label className="label">Deposit Amount \(₹\) \*\<\/label>\s*<input className="input" type="number" min="1" placeholder="100000" required value=\{form\.deposit_amount\} onChange=\{\(e\) => setF\("deposit_amount", e\.target\.value\)\} \/>\s*<\/div>/,
  `{form.deposit_type !== "FLEXIBLE" && (
                  <div>
                    <label className="label">Initial Deposit Amount (₹) *</label>
                    <input className="input" type="number" min="1" placeholder="100000" required value={form.deposit_amount} onChange={(e) => setF("deposit_amount", e.target.value)} />
                  </div>
                )}`
);

fs.writeFileSync(file, content, "utf-8");
console.log("Patched deposit amount condition");