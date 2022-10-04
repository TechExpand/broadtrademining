const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Profile = require('../model/profile');
const Transaction = require("../model/transaction")
const Wallet = require("../model/wallet")
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const islogin = require("../middleware/islogin")
const isadmin = require("../middleware/isadmin")
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { json } = require("body-parser");
const mongoose = require('mongoose');
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const { check, validationResult } = require('express-validator')





let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: "speedsterfxweb@gmail.com",
        pass: "speedsterfxweb101",
        clientId: "578020731868-ghru19tab9srobgt48d3jva5p2u1ikll.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//044V94zlH9k6sCgYIARAAGAQSNwF-L9Irvu6Twdyoto4eTXBhyo7YaOPoEiCDLfUkMLn1VeWcQMGliwJ6qZzLoP4h4KVB4PKAs14"
    }
});




// index page
router.get('/', function (req, res) {
    res.render('pages/index');
});





// index page
router.get('/withdraw', islogin, function (req, res) {
    res.render('pages/withdraw');
});


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

// index page
router.post('/withdraw', function (req, res) {
    let user = req.cookies.user;
    Profile.findOne({ user: mongoose.Types.ObjectId(user) }).then(function (val) {
        if (Number(req.body.amount) > Number(val.totalProfit)) {

            res.render('pages/withdraw', { error: "insufficient balance" });
        } else {

            let today = new Date();



            Profile.findByIdAndUpdate(
                {_id: val._id},
                {
                    user: val.user,
                    name: val.name,
                    email: val.email,
                    amount: val.amount,
                    image: val.image,
                    totalDeposit: val.totalDeposit,
                    totalProfit: (Number(val.totalProfit) - (Number(req.body.amount)).toString()).toString(),
                    totalWithdraw: (Number(val.totalWithdraw)+Number(req.body.amount)).toString(),
                    referalEarn: val.referalEarn,
                },
                function (err, docs) {
                  if (err) {
                    res.status(400).send({ message: "failed to update" });
                  } else {
                    Transaction.create({
                        date: today.toLocaleDateString("en-US"),
                        user: mongoose.Types.ObjectId(user),
                        transactionID: makeid(12),
                        amount: req.body.amount,
                        status: false,
                        detail: "account debited",
                        balance: Number(val.totalProfit) - (Number(req.body.amount)).toString(),
                    }).then(
                        function (tran) {
                            var perPage = 5;
                            var page = req.params.page || 1;
        
        
                            Transaction.find({ user: mongoose.Types.ObjectId(user) })
                                .skip((perPage * page) - perPage)
                                .limit(perPage).exec(function (err, transaction) {
                                    if (err) throw err;
                                    Transaction.countDocuments({}).exec((err, count) => {

                                        let mailOptions = {
                                            from: "speedsterfxweb@gmail.com",
                                            to: val.email,
                                            subject: 'BROADTRADEMINING',
                                            text: `Thank you for using BROADTRADEMINING. You have successfully withdraw $${req.body.amount} to ${req.body.accountname} (${req.body.bankname}) with this account ${req.body.accountnumber}.`
                                        };
        
        
                                        transporter.sendMail(mailOptions, function (err, data) {
                                            if (err) {
                                                console.log("Error " + err);
                                            } else {
        
                                                res.render('pages/dashboard', {
                                                    message: "withdrawal successful",
                                                    email: user.email,
                                                    fullname: val.name,
                                                    transaction: transaction,
                                                    amount: val.amount,
                                                    image: val.image,
                                                    totalDeposit: val.totalDeposit,
                                                    totalProfit: val.totalProfit,
                                                    totalWithdraw: val.totalWithdraw,
                                                    current: page,
                                                    pages: Math.ceil(count / perPage),
                                                    referalEarn: val.referalEarn,
                                                });
                                            }
                                        });
        
                                    });
                                });
        
        
                        }
                    )
                  }
                }
              )
      


          



        }
    })
});



// index page
router.get('/about', function (req, res) {
    res.render('pages/about');
});


const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};


function RemoveExtraSpace(value) {
    return value.replace(/\s+/g, ' ');
}



router.get("/users/clear", function (req, res, next) {
    User.find({})
        .then(function (menus) {
            menus.map((v) => {
                return User.findByIdAndDelete({ _id: v._id }).then(function (
                    menus
                ) { });
            });
            res.send("done");
        })
        .catch(next);
});


router.get("/profile/clear", function (req, res, next) {
    Profile.find({})
        .then(function (menus) {
            menus.map((v) => {
                return Profile.findByIdAndDelete({ _id: v._id }).then(function (
                    menus
                ) { });
            });
            res.send("done");
        })
        .catch(next);
});


router.post("/login", function (req, res, next) {
    let { email, password } = req.body;
    if (email === "" || password === "" || !email || !password) {
        res.render('pages/login', { error: "field cannot be empty" })
        //   res.status(400).send({ message: "field cannot be empty" });
    }
    if (!validateEmail(RemoveExtraSpace(email))) {
        res.render('pages/login', { error: "enter a valid email" })
        //   res.status(400).send({ message: "enter a valid email" });
    }
    User.findOne({ email: email })
        .then(function (user) {
            if (!user) {
                res.render('pages/login', { error: "invalid credentials" })
                //   res.status(400).send({ message: "invalid credentials" });
            }

            else {
                bcrypt.compare(password, user.password).then(function (result) {
                    if (!result) {
                        res.render('pages/login', { error: "invalid credentials" })
                        //   res.status(400).send({ message: "invalid credentials" });
                    }
                    else {
                        Profile.find({ user: user._id }).then(function (profile) {
                            let token = jwt.sign({ id: user._id }, TOKEN_SECRET, {
                                expiresIn: "3600000000s",
                            });
                            if (profile.length == 0) {
                                res.status(400).send({ message: "failed" })
                            } else {
                                var perPage = 5;
                                var page = req.params.page || 1;

                                Transaction.find({ user: mongoose.Types.ObjectId(user._id) }).skip((perPage * page) - perPage)
                                    .limit(perPage).exec(function (err, transaction) {
                                        if (err) throw err;
                                        Transaction.countDocuments({}).exec((err, count) => {

                                            let time;

                                            time += (3600 * 1000) * 87660
                                            res.cookie("user", user._id, { expires: time })
                                              
console.log(user.email)
console.log(user.email)
                                            if(user.email === "ogcourage@gmail.com"){
                                                res.cookie("isadmin", true, { expires: time })
                                                res.redirect("admin/1")
                                            }else{
                                                console.log(user.email)
console.log(user.email)
                                                res.cookie("isadmin", false, { expires: time })
                                                res.render('pages/dashboard', {
                                                    id: user._id,
                                                    token: token,
                                                    transaction: transaction,
                                                    email: user.email,
                                                    fullname: profile[0].name,
                                                    amount: profile[0].amount,
                                                    image: profile[0].image,
                                                    totalDeposit: profile[0].totalDeposit,
                                                    totalProfit: profile[0].totalProfit,
                                                    totalWithdraw: profile[0].totalWithdraw,
                                                    referalEarn: profile[0].referalEarn,
                                                    current: page,
                                                    pages: Math.ceil(count / perPage),
    
                                                })
                                            }
                                            // let cookies = req.cookies.obj;

                                           

                                        });
                                    });

                            }

                        });
                    }
                });
            }
        })

        .catch(next);
});







router.post("/registration",
    //   [
    //     check('password', 'This username must me 3+ characters long')
    //         .exists()
    //         .isLength({ min: 3 }),
    //     check('fullname', 'Fullname is required')
    //         .exists(),
    //     check('email', 'Email is not valid')
    //         .isEmail()
    //         .normalizeEmail()
    // ],

    function (req, res, next) {


        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let currentDate = `${day}-${month}-${year}`;

        let { email, password, fullname } = req.body;
        if (email === "" || password === "" || !email || !password) {
            //   res.status(400).send({ message: "field cannot be empty" });
            res.render('pages/dashboard', { message: "field cannot be empty" })
        }
        if (password.length <= 6) {
            //   res
            //     .status(400)
            //     .send({ message: "password must be greater than 6 characters" });
            res.render('pages/dashboard', { message: "password must be greater than 6 characters" })

        }
        if (!validateEmail(RemoveExtraSpace(email))) {
            //   res.status(400).send({ message: "enter a valid email" });
            res.render('pages/dashboard', { message: "enter a valid email" })
        }
        User.findOne({ email: email })
            .then(function (user) {
                if (user) {
                    //   res.status(400).send({ message: "user already exist" });
                    res.render('pages/dashboard', { message: "user already exist" })
                } else {
                    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
                        User.create({

                            fullname: fullname,
                            email: email,
                            password: hashedPassword,
                            accountType: "user",
                            image: "",
                            joined: currentDate,

                        })
                            .then(function (createduser) {
                                Profile.create({
                                    email: email,
                                    name: fullname,
                                    user: createduser._id,
                                    amount: "0",
                                    image: "",
                                    totalDeposit: "0",
                                    totalProfit: "0",
                                    totalWithdraw: "0",
                                    referalEarn: "0",
                                })
                                    .then(function (profile) {
                                        let token = jwt.sign({ id: createduser._id }, TOKEN_SECRET, {
                                            expiresIn: "3600000000s",
                                        });


                                        let mailOptions = {
                                            from: "speedsterfxweb@gmail.com",
                                            to: email,
                                            subject: 'BROADTRADEMINING',
                                            text: 'Thank you for signing up on BROADTRADEMINING. Login to Start investing with us.'
                                        };


                                        transporter.sendMail(mailOptions, function (err, data) {
                                            if (err) {
                                                console.log("Error " + err);
                                            } else {
                                                console.log("Email sent successfully");
                                                res.render('pages/login', { message: "You can now log in." })
                                            }
                                        });


                                    })
                                    .catch(next);

                            })
                            .catch(next);
                    });
                }
            })
            .catch(next);
    });









// index page
router.get('/contact', function (req, res) {
    res.render('pages/contact');
});




// index page
router.get('/dashboard/:page', islogin, function (req, res) {
    let user = req.cookies.user;
    console.log(user)
    User.findOne({ _id: mongoose.Types.ObjectId(user) }).then(function (user) {
        Profile.find({ user: mongoose.Types.ObjectId(user) }).then(function (profile) {
            var perPage = 5;
            var page = req.params.page || 1;
            Transaction.find({ user: mongoose.Types.ObjectId(user) }).skip((perPage * page) - perPage)
                .limit(perPage).exec(function (err, transaction) {
                    if (err) throw err;
                    Transaction.countDocuments({}).exec((err, count) => {
                        res.render('pages/dashboard', {
                            id: user._id,
                            email: user.email,
                            transaction: transaction,
                            fullname: profile[0].name,
                            amount: profile[0].amount,
                            image: profile[0].image,
                            totalDeposit: profile[0].totalDeposit,
                            totalProfit: profile[0].totalProfit,
                            totalWithdraw: profile[0].totalWithdraw,
                            referalEarn: profile[0].referalEarn,
                            current: page,
                            pages: Math.ceil(count / perPage)

                        });

                    });
                });
        })
    })
});




router.get('/admin/:page', islogin, function (req, res) {
    let user = req.cookies.user;
  
    User.findOne({ _id: mongoose.Types.ObjectId(user) }).then(function (user) {
        Profile.find({ user: mongoose.Types.ObjectId(user) }).then(function (profile) {
            var perPage = 5;
            var page = req.params.page || 1;
            Profile.find({ user: mongoose.Types.ObjectId(user) }).skip((perPage * page) - perPage)
                .limit(perPage).exec(function (err, prof) {
                    console.log(transaction)
                    if (err) throw err;
                    Profile.countDocuments({}).exec((err, count) => {
                        res.render('pages/admin', {
                            id: user._id,
                            email: user.email,
                            prof: prof,
                            fullname: profile[0].name,
                            amount: profile[0].amount,
                            image: profile[0].image,
                            totalDeposit: profile[0].totalDeposit,
                            totalProfit: profile[0].totalProfit,
                            totalWithdraw: profile[0].totalWithdraw,
                            referalEarn: profile[0].referalEarn,
                            current: page,
                            pages: Math.ceil(count / perPage)

                        });

                    });
                });
        })
    })
});



router.get('/deposit', function (req, res) {
    Wallet.find({}).then(function(value){
        if(value.length === 0){
            res.render('pages/deposit');
        }else{
            res.render('pages/deposit', {
                message: value[0],
            });
        }
    })
});



router.post('/deposit', function (req, res) {
    Wallet.create(req.body).then(function(value){
       res.send(value)
    })
});

router.get("/d/clear", function (req, res, next) {
    Transaction.find({})
        .then(function (menus) {
            menus.map((v) => {
                return Transaction.findByIdAndDelete({ _id: v._id }).then(function (
                    menus
                ) { });
            });
            res.send("done");
        })
        .catch(next);
});



// index page
router.get('/login', function (req, res) {
    res.render('pages/login');
});



// index page
router.get('/plan', function (req, res) {
    res.render('pages/plan');
});




router.get('/registration', function (req, res) {
    res.render('pages/registration');
});


module.exports = router;