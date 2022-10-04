const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user schema & model
const UserSchema = new Schema({
    email: {
        type: String,
        // required: [true, 'email field is required']
    },
    password: {
        type: String,
        required: [true, 'password field is required']
    },
	
    fullname: {
        type: String,
        // required: [true, 'firstname field is required']
    },
    
	image: String,
	accountType: {
        type: String,
        required: [true, 'accountType field is required']
    },
   
    joined: {
        type: String,
        required: [true, 'joined field is required']
    },
});


const User = mongoose.model('user',UserSchema);

module.exports = User;