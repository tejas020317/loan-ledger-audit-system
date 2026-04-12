const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FdTransaction = sequelize.define(
  "FdTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fd_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "fixed_deposits",
        key: "fd_id",
      },
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deposit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    interest_added: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "fd_transactions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = FdTransaction;
