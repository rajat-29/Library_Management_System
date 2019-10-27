var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({              
    name: String,
    uniId: String,
    email: String,
    password: String,
    phone: String,
    city: String,
    gender: String,
    dob: String,
    role: String,   
    status: String,
    flag: Number, 
})

module.exports =  mongoose.model('students', userSchema);