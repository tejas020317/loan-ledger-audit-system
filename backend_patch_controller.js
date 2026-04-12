const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "backend/controllers/fixedDepositController.js");
let content = fs.readFileSync(file, "utf-8");

content = content.replace(
  /if \(\!customer_id \|\| \!deposit_amount \|\| \!interest_rate \|\| \!interest_type \|\| \!start_date \|\| \!duration_months\) \{[\s\S]*?\}\n/,
  `if (!customer_id || !deposit_amount || !interest_rate || !interest_type || !start_date || !duration_months) {
      return res.status(400).json({
        success: false,
        message:
          "customer_id, deposit_amount, interest_rate, interest_type, start_date, and duration_months are required.",
      });
    }

    if (interest_type === "compound" && !compounding_frequency) {
      return res.status(400).json({
        success: false,
        message: "compounding_frequency is required for compound interest.",
      });
    }

    const processedFrequency = interest_type === "simple" ? null : compounding_frequency;
`
);

content = content.replace(
  /compounding_frequency,/,
  `compounding_frequency: processedFrequency,`
);

fs.writeFileSync(file, content, "utf-8");
console.log("Patched fixedDepositController");
