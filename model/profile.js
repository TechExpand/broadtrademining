const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    name: String,
    email: String,
    amount: String,
    image: String,
    totalDeposit: String,
    totalProfit: String,
    totalWithdraw: String,
    referalEarn: String,
  });
  
  const Profile = mongoose.model('profile', ProfileSchema);

  module.exports = Profile;