const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const TransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    date: String,
    transactionID: String,
    amount: String,
    status: Boolean,
    detail: String,
    balance: String,
  });
  
  const Transaction = mongoose.model('transaction', TransactionSchema);

  module.exports = Transaction;