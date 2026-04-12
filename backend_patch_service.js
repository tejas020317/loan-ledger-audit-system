const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "backend/services/fixedDepositService.js");
let content = fs.readFileSync(file, "utf-8");

content = content.replace(
  /if \(fd\.interest_type === "simple"\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
  `if (fd.interest_type === "simple") {
      const si = (P * R * T) / 100;
      maturityAmount = parseFloat((P + si).toFixed(2));
    } else {
      const n = frequencyMap[fd.compounding_frequency] ?? 4;
      const r = R / 100;
      maturityAmount = parseFloat((P * Math.pow(1 + r / n, n * T)).toFixed(2));
    }`
);

// We need to fix the transaction initial creation for FLEXIBLE
content = content.replace(
  /\/\/ Always create initial transaction for both FIXED and FLEXIBLE for the ledger[\s\S]*?await FdTransaction[\s\S]*?\}, \{ transaction: t \}\);/,
  `// Create initial transaction only if it's a FIXED deposit, or handle it as required.
    // Based on requirements: "Do NOT create initial deposit automatically. Only use transaction entries" (for FLEXIBLE).
    if (data.deposit_type !== "FLEXIBLE") {
      await FdTransaction.create({
        fd_id: fd.fd_id,
        transaction_date: data.start_date,
        deposit_amount: data.deposit_amount,
        interest_added: 0,
        balance: data.deposit_amount
      }, { transaction: t });
    }`
);

// We need to fix calculateFDMaturity validation
content = content.replace(
  /if \(\!P \|\| \!R \|\| \!T \|\| \!data\.interest_type \|\| \!data\.start_date\) \{/,
  `if (!P || !R || !T || !data.interest_type || !data.start_date) {`
);

fs.writeFileSync(file, content, "utf-8");
console.log("Patched fixedDepositService");