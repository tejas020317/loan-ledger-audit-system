const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(app)/fd/page.tsx', 'utf-8');

// 1. Add deposit_type to formData state
code = code.replace(
  /interest_type: "simple",\n\s*compounding_frequency: "quarterly",/g,
  `interest_type: "simple",
    compounding_frequency: "quarterly",
    deposit_type: "FIXED",`
);

// Add to the type definition
code = code.replace(
  /interest_type: "simple" \| "compound";\n\s*compounding_frequency: string;/g,
  `interest_type: "simple" | "compound";
  compounding_frequency: string;
  deposit_type: "FIXED" | "FLEXIBLE";`
);

// Add the UI field for deposit_type just before deposit_amount
code = code.replace(
  /<div>\n\s*<label className="mb-1 block text-sm font-medium">[\s\n]*Deposit Amount/g,
  `<div>
                <label className="mb-1 block text-sm font-medium">
                  Deposit Type
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.deposit_type || "FIXED"}
                  onChange={(e) =>
                    setFormData({ ...formData, deposit_type: e.target.value as "FIXED" | "FLEXIBLE" })
                  }
                >
                  <option value="FIXED">Fixed</option>
                  <option value="FLEXIBLE">Flexible</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deposit Amount`
);

// Add Eye icon import
if (!code.includes('Eye')) {
  code = code.replace(/Trash2,([\s\n]*)} from "lucide-react";/g, 'Trash2, Eye$1} from "lucide-react";');
}
if (!code.includes('import Link from')) {
  code = code.replace(/import \{ motion, AnimatePresence \} from "framer-motion";/g, 'import { motion, AnimatePresence } from "framer-motion";\nimport Link from "next/link";');
}

// Update table header
code = code.replace(
  /<th className="px-4 py-3 text-left">Amount<\/th>/g,
  `<th className="px-4 py-3 text-left">Type / Amount</th>`
);

// Update table amount cell and add button
code = code.replace(
  /<td className="px-4 py-3 font-medium">[\s\n]*₹\{fd\.deposit_amount\}[\s\n]*<\/td>/g,
  `<td className="px-4 py-3 font-medium">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">{fd.deposit_type || 'FIXED'}</span>
                        <span>₹{fd.deposit_type === 'FLEXIBLE' && fd.total_deposited ? fd.total_deposited : fd.deposit_amount}</span>
                      </div>
                    </td>`
);

code = code.replace(
  /<button\n\s*onClick=\{\(\) => setDeleteId\(fd\.fd_id\)\}\n\s*className="text-red-600 hover:text-red-900 dark:text-red-400"\n\s*title="Delete FD"\n\s*>\n\s*<Trash2 className="h-4 w-4" \/>\n\s*<\/button>/g,
  `<Link href={\`/fd/\${fd.fd_id}\`} className="mr-2 inline-flex text-blue-600 hover:text-blue-900 dark:text-blue-400" title="View Ledger">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(fd.fd_id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                        title="Delete FD"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>`
);

fs.writeFileSync('frontend/src/app/(app)/fd/page.tsx', code);
console.log('patched');
