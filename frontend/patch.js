const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "src/app/(app)/fd/page.tsx");
let content = fs.readFileSync(p, "utf-8");

const fixed = content.replace(
/                  <div style=\{\{ gridColumn: "1 \/ -1" \}\}>\s*<label className="label">Deposit Type \*\<\/label>\s*<select className="input" value=\{calcForm\.deposit_type\} onChange=\{\(e\) => setC\("deposit_type", e\.target\.value\)\}>\s*<option value="FIXED">Standard FIXED\<\/option>\s*<option value="FLEXIBLE">Flexible \/ Recurring\<\/option>\s*\<\/select>\s*\<\/div>\s*<div style=\{\{ marginTop: "1\.5rem", background: "#f0fdf4"/s,
`                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="label">Deposit Type *</label>
                    <select className="input" value={calcForm.deposit_type} onChange={(e) => setC("deposit_type", e.target.value)}>
                      <option value="FIXED">Standard FIXED</option>
                      <option value="FLEXIBLE">Flexible / Recurring</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }} disabled={calculating}>
                  {calculating ? "Calculating…" : "Calculate Maturity"}
                </button>
              </form>

              {maturity && (
                <div style={{ marginTop: "1.5rem", background: "#f0fdf4"`
);

fs.writeFileSync(p, fixed, "utf-8");
console.log("Fixed!");
