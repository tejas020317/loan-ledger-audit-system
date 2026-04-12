require("dotenv").config({ path: "./backend/.env" });
const { sequelize } = require('./backend/models');

async function fixDb() {
  try {
    await sequelize.query(`ALTER TABLE fixed_deposits ADD COLUMN deposit_type VARCHAR(20) DEFAULT 'FIXED';`);
    console.log("Added deposit_type successfully.");
  } catch(e) {
    console.log("Error adding column (might already exist):", e.message);
  }
  
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS fd_transactions (
          id                  SERIAL PRIMARY KEY,
          fd_id               INTEGER         NOT NULL
                                  REFERENCES fixed_deposits(fd_id)
                                  ON DELETE CASCADE,
          transaction_date    DATE            NOT NULL,
          deposit_amount      DECIMAL(15, 2)  DEFAULT 0,
          interest_added      DECIMAL(15, 2)  DEFAULT 0,
          balance             DECIMAL(15, 2)  NOT NULL,
          created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
          updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fd_tx_fd ON fd_transactions(fd_id);
    `);
    console.log("Created fd_transactions successfully.");
  } catch(e) {
    console.log("Error creating table:", e.message);
  }
  
  process.exit(0);
}
fixDb();