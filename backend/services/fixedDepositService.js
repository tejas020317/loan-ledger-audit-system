const { FixedDeposit, Customer, FdTransaction } = require("../models");
const sequelize = require("../config/database");

const frequencyMap = { monthly: 12, quarterly: 4, half_yearly: 2, yearly: 1 };

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const diffDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
};

const computeMaturity = (fd) => {
  const isFlexible = fd.deposit_type === "FLEXIBLE";
  const maturityDateStr = addMonths(fd.start_date, fd.duration_months)
    .toISOString()
    .split("T")[0];

  if (!isFlexible) {
    const P = parseFloat(fd.deposit_amount || 0);
    const R = parseFloat(fd.interest_rate || 0);
    const T = (fd.duration_months || 0) / 12;
    let maturityAmount;

    if (fd.interest_type === "simple") {
      const si = (P * R * T) / 100;
      maturityAmount = parseFloat((P + si).toFixed(2));
    } else {
      const n = frequencyMap[fd.compounding_frequency] ?? 4;
      const r = R / 100;
      maturityAmount = parseFloat((P * Math.pow(1 + r / n, n * T)).toFixed(2));
    }

    const interestEarned = parseFloat((maturityAmount - P).toFixed(2));
    return { maturity_amount: maturityAmount, interest_earned: interestEarned, maturity_date: maturityDateStr };
  } else {
    let totalDeposited = 0;
    let totalInterest = 0;
    let currentBalance = 0;
    let lastDate = fd.start_date;

    const txs = fd.transactions || [];
    if (txs.length === 0) {
      // Do nothing, no deposits yet
    } else {
      txs.forEach((tx) => {
        totalDeposited += parseFloat(tx.deposit_amount || 0);
        totalInterest += parseFloat(tx.interest_added || 0);
        currentBalance = parseFloat(tx.balance || 0);
        lastDate = tx.transaction_date;
      });
    }

    const daysToMaturity = diffDays(lastDate, maturityDateStr);
    let maturityAmount = currentBalance;
    if (daysToMaturity > 0 && currentBalance > 0) {
      const R = parseFloat(fd.interest_rate);
      const remainingInterest = (currentBalance * (R / 100) * daysToMaturity) / 365;
      maturityAmount += remainingInterest;
      totalInterest += remainingInterest;
    }

    return { 
      maturity_amount: parseFloat(maturityAmount.toFixed(2)), 
      interest_earned: parseFloat(totalInterest.toFixed(2)), 
      maturity_date: maturityDateStr,
      total_deposited: parseFloat(totalDeposited.toFixed(2))
    };
  }
};

const createFD = async (data) => {
  const customer = await Customer.findByPk(data.customer_id);
  if (!customer) {
    const error = new Error("Customer not found.");
    error.statusCode = 404;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const fd = await FixedDeposit.create(data, { transaction: t });

    // Create initial transaction only if it's a FIXED deposit, or handle it as required.
    // Based on requirements: "Do NOT create initial deposit automatically. Only use transaction entries" (for FLEXIBLE).
    if (data.deposit_type !== "FLEXIBLE") {
      await FdTransaction.create({
        fd_id: fd.fd_id,
        transaction_date: data.start_date,
        deposit_amount: data.deposit_amount,
        interest_added: 0,
        balance: data.deposit_amount
      }, { transaction: t });
    }
    
    await t.commit();
    let fdData = fd.toJSON();
    fdData.transactions = data.deposit_type !== "FLEXIBLE" ? [{ 
      transaction_date: data.start_date,
      deposit_amount: data.deposit_amount,
      interest_added: 0,
      balance: data.deposit_amount
    }] : [];
    return { ...fdData, ...computeMaturity(fdData) };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllFDs = async (customerId) => {
  const where = customerId ? { customer_id: customerId } : {};
  const fds = await FixedDeposit.findAll({
    where,
    include: [
      { association: "customer", attributes: ["customer_id", "name", "account_number"] },
      { association: "transactions" }
    ],
    order: [["start_date", "DESC"]],
  });
  return fds.map((fd) => ({ ...fd.toJSON(), ...computeMaturity(fd.toJSON()) }));
};

const getFDById = async (fdId) => {
  const fd = await FixedDeposit.findByPk(fdId, {
    include: [
      { association: "customer", attributes: ["customer_id", "name", "phone", "account_number"] },
      { association: "transactions", separate: true, order: [["transaction_date", "ASC"], ["id", "ASC"]] }
    ],
  });
  if (!fd) {
    const error = new Error("Fixed deposit not found.");
    error.statusCode = 404;
    throw error;
  }
  return { ...fd.toJSON(), ...computeMaturity(fd.toJSON()) };
};

const calculateFDMaturity = (data) => {
  const P = parseFloat(data.deposit_amount || 0);
  const R = parseFloat(data.interest_rate || 0);
  const T = parseInt(data.duration_months || 0, 10) / 12;

  if (!P || !R || !T || !data.interest_type || !data.start_date) {
    const error = new Error("deposit_amount, interest_rate, duration_months, interest_type, and start_date are required.");
    error.statusCode = 400;
    throw error;
  }
  return computeMaturity({ ...data, transactions: [] });
};

const deleteFD = async (id) => {
  const fd = await FixedDeposit.findByPk(id);
  if (!fd) {
    const error = new Error("Fixed deposit not found.");
    error.statusCode = 404;
    throw error;
  }
  await fd.destroy();
  return { message: "Fixed deposit deleted successfully." };
};

const addDeposit = async (fdId, data) => {
  const t = await sequelize.transaction();
  try {
    const fd = await FixedDeposit.findByPk(fdId, { transaction: t });
    if (!fd) throw new Error("Fixed deposit not found.");
    if (fd.deposit_type !== "FLEXIBLE") {
      throw new Error("Only FLEXIBLE deposits allow adding extra investments");
    }

    const lastTx = await FdTransaction.findOne({
      where: { fd_id: fdId },
      order: [["transaction_date", "DESC"], ["id", "DESC"]],
      transaction: t
    });

    const lastDate = lastTx ? lastTx.transaction_date : fd.start_date;
    const currentReqDate = new Date(data.date);
    const lastDateObj = new Date(lastDate);

    if (currentReqDate < lastDateObj) {
      throw new Error("Deposit date cannot be before the last transaction date");
    }

    const days = diffDays(lastDate, data.date);
    const prevBalance = lastTx ? parseFloat(lastTx.balance) : 0;
    const depositAmount = parseFloat(data.amount);
    
    let interestAdded = 0;
    if (days > 0 && prevBalance > 0) {
      interestAdded = (prevBalance * (parseFloat(fd.interest_rate) / 100) * days) / 365;
    }

    const newBalance = prevBalance + interestAdded + depositAmount;

    const newTx = await FdTransaction.create({
      fd_id: fdId,
      transaction_date: data.date,
      deposit_amount: depositAmount,
      interest_added: interestAdded,
      balance: newBalance
    }, { transaction: t });

    await fd.update({ deposit_amount: newBalance }, { transaction: t });
    await t.commit();
    return newTx;
  } catch (error) {
    await t.rollback();
    if (!error.statusCode) error.statusCode = 400;
    throw error;
  }
};

module.exports = { createFD, getAllFDs, getFDById, calculateFDMaturity, deleteFD, addDeposit };