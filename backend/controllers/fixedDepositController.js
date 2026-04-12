const fdService = require("../services/fixedDepositService");

/** POST /api/fixed-deposits */
const create = async (req, res) => {
  try {
    const {
      customer_id,
      deposit_amount,
      interest_rate,
      interest_type,
      compounding_frequency,
      start_date,
      duration_months,
      deposit_type,
    } = req.body;

    if (!customer_id || (deposit_type !== "FLEXIBLE" && !deposit_amount) || !interest_rate || !interest_type || !start_date || !duration_months) {
      return res.status(400).json({
        success: false,
        message:
          "customer_id, deposit_amount (if FIXED), interest_rate, interest_type, start_date, and duration_months are required.",
      });
    }

    if (interest_type === "compound" && !compounding_frequency) {
      return res.status(400).json({
        success: false,
        message: "compounding_frequency is required for compound interest.",
      });
    }

    const processedFrequency = interest_type === "simple" ? null : compounding_frequency;

    const fd = await fdService.createFD({
      customer_id,
      deposit_amount,
      interest_rate,
      interest_type,
      compounding_frequency: processedFrequency,
      start_date,
      duration_months,
      deposit_type: deposit_type || "FIXED",
    });

    return res.status(201).json({ success: true, data: fd });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/** GET /api/fixed-deposits?customer_id=:id */
const getAll = async (req, res) => {
  try {
    const { customer_id } = req.query;
    const fds = await fdService.getAllFDs(customer_id || null);
    return res.status(200).json({ success: true, data: fds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/fixed-deposits/:id */
const getOne = async (req, res) => {
  try {
    const fd = await fdService.getFDById(req.params.id);
    return res.status(200).json({ success: true, data: fd });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/fixed-deposits/calculate
 * Calculates maturity amount without saving — useful for previews.
 * Body: { deposit_amount, interest_rate, interest_type, compounding_frequency, start_date, duration_months }
 */
const calculate = async (req, res) => {
  try {
    const result = fdService.calculateFDMaturity(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/** DELETE /api/fixed-deposits/:id */
const remove = async (req, res) => {
  try {
    const result = await fdService.deleteFD(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

/** POST /api/fixed-deposits/:id/deposits */
const addDeposit = async (req, res) => {
  try {
    const { date, amount } = req.body;
    if (!date || !amount) {
      return res.status(400).json({ success: false, message: "date and amount are required." });
    }
    const result = await fdService.addDeposit(req.params.id, { date, amount });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = { create, getAll, getOne, calculate, remove, addDeposit };
