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
        user: "broadtrademining@gmail.com",
        pass: "broadtrademining126",
        clientId: "1084250007715-co6ovin9mas4gi6ivad4d758fe74icm3.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//046yHPzzwvEOpCgYIARAAGAQSNwF-L9Ir8Ns4DcOAPpCACNhfbDU2eGGCfK189Gtev3avFOwp-oFrZdjqNA7CnfS5lUCpVXwk8sI"
    }
});




// index page
router.get('/', function (req, res) {
    res.render('pages/home', {message: "null"});
});





// index page
router.get('/withdraw', islogin, function (req, res) {
    res.render('pages/withdraw', {message:"null"});
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

            res.render('pages/withdraw', { message: "insufficient balance" });
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
                                            from: "broadtrademining@gmail.com",
                                            to: val.email,
                                            subject: 'Broadtrademining',
                                            text: `Dear customer, you have successfully withdraw $${req.body.amount} to ${req.body.accountname} (${req.body.bankname}) with this account ${req.body.accountnumber}.`
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




// res.redirect('admin/1')
router.post("/userdelete/:user/:id", (req, res, next)=> {
    Profile.findByIdAndDelete({_id: mongoose.Types.ObjectId(req.params.id) }).then(function (
        bank
    ) {
        User.findByIdAndDelete({_id: mongoose.Types.ObjectId(req.params.user) }).then(function (
            profile
        ) {
            res.redirect('/admin/1')
        }).catch(next);
    }).catch(next);
  });



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
        res.render('pages/home', { message: "field cannot be empty" })
        //   res.status(400).send({ message: "field cannot be empty" });
    }
    if (!validateEmail(RemoveExtraSpace(email))) {
        res.render('pages/home', { message: "enter a valid email" })
        //   res.status(400).send({ message: "enter a valid email" });
    }
    User.findOne({ email: email })
        .then(function (user) {
            if (!user) {
                res.render('pages/home', { message: "user does not exist" })
                //   res.status(400).send({ message: "invalid credentials" });
            }

            else {
                bcrypt.compare(password, user.password).then(function (result) {
                    if (!result) {
                        res.render('pages/home', { message: "invalid credentials" })
                        //   res.status(400).send({ message: "invalid credentials" });
                    }
                    else {
                        Profile.find({ user: user._id }).then(function (profile) {
                            let token = jwt.sign({ id: user._id }, TOKEN_SECRET, {
                                expiresIn: "3600000000s",
                            });
                            if (profile.length == 0) {
                                res.render('pages/home', { message: "failed to signin" })
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
                                              

                                            if(user.email === "courageakhere1479@gmail.com"){
                                                res.cookie("isadmin", true, { expires: time })


                                                Profile.find({}).then(function(prof){
                                                    res.render('pages/admin', {
                                                        id: user._id,
                                                        email: user.email,
                                                        // password: user.password,
                                                        prof: prof,
                                                        fullname: profile[0].name,
                                                        proid: profile[0]._id,
                                                        password: profile[0].password,
                                                        amount: profile[0].amount,
                                                        message: "login successful",
                                                        image: profile[0].image,
                                                        totalDeposit: profile[0].totalDeposit,
                                                        totalProfit: profile[0].totalProfit,
                                                        totalWithdraw: profile[0].totalWithdraw,
                                                        referalEarn: profile[0].referalEarn,
                                                        current: page,
                                                        pages: Math.ceil(count / perPage)
                            
                                                    });
                                                   })
                                                

                                                
                                            }else{
                                                res.cookie("isadmin", false, { expires: time })
                                                

                                                res.render('pages/dashboard', {
                                                    id: user._id,
                                                    token: token,
                                                    transaction: transaction,
                                                    message: "login successful",
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
            res.render('pages/home', { message: "field cannot be empty" })
        }
        if (password.length <= 6) {
            //   res
            //     .status(400)
            //     .send({ message: "password must be greater than 6 characters" });
            res.render('pages/home', { message: "password must be greater than 6 characters" })

        }
        if (!validateEmail(RemoveExtraSpace(email))) {
            //   res.status(400).send({ message: "enter a valid email" });
            res.render('pages/home', { message: "enter a valid email" })
        }
        User.findOne({ email: email })
            .then(function (user) {
                if (user) {
                    //   res.status(400).send({ message: "user already exist" });
                    res.render('pages/home', { message: "user already exist" })
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
                                    password: password,
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
                                            from: "broadtrademining@gmail.com",
                                            to: email,
                                            subject: 'Broadtrademining',
                                            text: 'Thank you for signing up on Broadtrademining. Login to Start investing with us.'
                                        };


                                        transporter.sendMail(mailOptions, function (err, data) {
                                            if (err) {
                                                console.log("Error " + err);
                                            } else {
                                                console.log("Email sent successfully");
                                                res.render('pages/home', { message: "You can now log in." })
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









    router.post("/sendmail",
    

    function (req, res, next) {

        
        let mailOptions = {
            from: "broadtrademining@gmail.com",
            to: req.body.email,
            subject: 'Broadtrademining',
            text: req.body.body,
        };


        transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log("Error " + err);
            } else {
                console.log("Email sent successfully");
                res.redirect('admin/1')
            }
        });

    });








    
// index page
router.get('/contact', function (req, res) {
    res.render('pages/contact');
});


router.get('/dashboard', islogin, function (req, res) {
    res.redirect('dashboard/1');
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

                        if(user.email === "courageakhere1479@gmail.com"){
                           Profile.find({}).then(function(prof){
                            res.render('pages/admin', {
                                id: user._id,
                                email: user.email,
                                message: "null",
                                prof: prof,
                                proid: profile[0]._id,
                                fullname: profile[0].name,
                                amount: profile[0].amount,
                                password: profile[0].password,
                                image: profile[0].image,
                                totalDeposit: profile[0].totalDeposit,
                                totalProfit: profile[0].totalProfit,
                                totalWithdraw: profile[0].totalWithdraw,
                                referalEarn: profile[0].referalEarn,
                                current: page,
                                pages: Math.ceil(count / perPage)
    
                            });
                           })
                        }else{
                        res.render('pages/dashboard', {
                            id: user._id,
                            email: user.email,
                            message: "null",
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
                        }

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
                    console.log(profile)
                    if (err) throw err;
                    Profile.countDocuments({}).exec((err, count) => {


                        Profile.find({}).then(function(profs){
                            res.render('pages/admin', {
                                id: user._id,
                                email: user.email,
                                message: "null",
                                prof: profs,
                                proid: profile[0]._id,
                                fullname: profile[0].name,
                                amount: profile[0].amount,
                                image: profile[0].image,
                                password: profile[0].password,
                                totalDeposit: profile[0].totalDeposit,
                                totalProfit: profile[0].totalProfit,
                                totalWithdraw: profile[0].totalWithdraw,
                                referalEarn: profile[0].referalEarn,
                                current: page,
                                pages: Math.ceil(count / perPage)
    
                            });
                           })

                       

                    });
                });
        })
    })
});




router.get('/deposit', function (req, res) {
    Wallet.find({}).then(function(value){
        if(value.length === 0){
            res.render('pages/deposit', {message: "null"});
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


router.post('/edit/:user', function (req, res) {

    Profile.findOne({user: mongoose.Types.ObjectId(req.params.user)}).then(function(profile){
      
        Profile.findByIdAndUpdate(
            {_id: mongoose.Types.ObjectId(profile.id) },
            {
                user: profile.user,
                name: profile.name,
                email: profile.email,
                // amount: req.body.amount,
                
                image: "",
                totalDeposit: Number(profile.totalProfit)===Number(req.body.totalprofit)?req.body.totaldeposit: (Number(profile.totalDeposit) + Number(req.body.totalprofit)).toString(),
                totalProfit: req.body.totalprofit,
                totalWithdraw: profile.totalWithdraw,
                referalEarn: profile.referalEarn,
            },
            function (err, docs) {
              if (err) {
                res.status(400).send({ message: "failed to update" });
              } else {
                let today = new Date();
                Transaction.create({
                    date: today.toLocaleDateString("en-US"),
                    user:   mongoose.Types.ObjectId(req.params.user),
                    transactionID: makeid(12),
                    amount: req.body.totalprofit,
                    status: true,
                    detail: "account credited",
                    balance: req.body.totalprofit,
                }).then(
                    function (tran) {
                        var perPage = 5;
                        var page = req.params.page || 1;
    
    
                        Transaction.find({ user: mongoose.Types.ObjectId(req.params.user) })
                            .skip((perPage * page) - perPage)
                            .limit(perPage).exec(function (err, transaction) {
                                if (err) throw err;
                                Transaction.countDocuments({}).exec((err, count) => {
    
                                    let mailOptions = {
                                        from: "broadtrademining@gmail.com",
                                        to: profile.email,
                                        subject: 'Broadtrademining',
                                        text: Number(profile.totalProfit)===Number(req.body.totalprofit)?
                                        `Dear customer, your account have been successfully credited with $${(Number(req.body.totaldeposit)-Number(profile.totalDeposit))}.`:
                                        `Congratulations you just earned $${req.body.totalprofit} as profit for your investment with Broadtrademining.`
                                    };
    
    
                                    transporter.sendMail(mailOptions, function (err, data) {
                                        if (err) {
                                            console.log("Error " + err);
                                        } else {
    
    

                                            Profile.find({}).then(function(prof){
                                                res.render('pages/admin', {
                                                    id: req.params.user,
                                                    email: profile.email,
                                                    proid: profile._id,
                                                    password: profile.password,
                                                    fullname: profile.name,
                                                    message: "successfully credited user account",
                                                    prof: prof,
                                                    current: page,
                                                    pages: Math.ceil(count / perPage)
                        
                                                });    
                                            })

    
                                           


                                        }
                                          
                                    });
    
                                });
                            });
    
    
                    }
                )
              }
            }
          )
       })



   
});



router.get("/d/clear", function (req, res, next) {
    Wallet.find({})
        .then(function (menus) {
            menus.map((v) => {
                return Wallet.findByIdAndDelete({ _id: v._id }).then(function (
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



// wallet page
router.get('/wallet', function (req, res) {
    Wallet.find({}).then(function(value){
        if(value.length == 0){
            res.render('pages/wallet',  {
                message: "null",
            });
        }else{
            res.render('pages/wallet',  {
                message: value[0],
            });
        }
       
    })
});






// wallet page
router.post('/wallet', function (req, res) {
   Wallet.find({}).then(function(value){
    let user = req.cookies.user;
    Wallet.findByIdAndUpdate(
        {_id: value[0]._id },
        {
            name: req.body.name,
            address: req.body.address,
        },
        function (err, docs) {
          if (err) {
            res.status(400).send({ message: "failed to update" });
          } else {
           Profile.find({}).then(function(prof){



            var perPage = 5;
            var page = req.params.page || 1;
            Profile.findOne({ user: mongoose.Types.ObjectId(user) }).skip((perPage * page) - perPage)
                .limit(perPage).exec(function (err, prof) {
                  
                    if (err) throw err;
                    Profile.countDocuments({}).exec((err, count) => {
                        res.redirect('admin/1');

                    });
                });




           })
           
          }
        }
      )
   })
});




// index page
router.get('/plan', function (req, res) {
    res.render('pages/plan');
});





router.get('/newpassword/:email', function (req, res) {
    res.render('pages/newpassword', {email: req.params.email, message: "null"});
});



function getRandomString(length) {
    var randomChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    return result;
  }



  router.post("/newpassword/:email", async (req, res, next) => {
   
    User.findOne({ email: req.params.email })
      .then(function (user) {
  
        let newPassword = req.body.password;
  
        bcrypt.hash(newPassword, saltRounds, function (err, hashedPassword) {
          User.updateOne({ email: req.params.email }, { password: hashedPassword })
            .then(function (update) {
              User.findOne({ email: req.params.email }).then(function (info) {
                Profile.findOne({ user: info._id }).then(async function (
                  userinfo
                ) {
                  let mailOptions = {
                    from: "broadtrademining@gmail.com",
                    to: req.params.email,
                    subject: 'broadtrademining reset password',
                    text: `Your password is now ${newPassword}`,
                  };
  
                  

                  transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        res.render('pages/newpassword', {email: req.params.email, message: "Failed to reset"});
                        // res.render(`/newpassword/${req.params.email}`)
                    } else {
                        res.render('pages/newpassword', {email: req.params.email, message: "Reset password successful"});
                        // res.render(`/newpassword/${req.params.email}`)
                    }
                });




                });
              });
            })
            .catch(next);
        });
        
      })
      .catch(next);
  });




router.post("/forget", async (req, res, next) => {
    if (!validateEmail(req.body.email)) {
        res.render("pages/forget", { message: "user does not exist" })
    }
    User.findOne({ email: req.body.email })
      .then(function (user) {
        if (!user) {
          res.render("pages/forget", { message: "user does not exist" })
        }



        let mailOptions = {
            from: "broadtrademining@gmail.com",
            to: req.body.email,
            subject: 'broadtrademining reset password',
            text: `Open Link to Reset your password https://broadtrademining.com/newpassword/${req.body.email}`,
          };

          


          transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
                res.render("pages/forget", { message: err.toString() })
            } else {
                res.render("pages/forget", {message: "Your reset link have been sent to your mailbox"})
            }
        });
  
        

      })
      .catch(next);
  });
  
  

  router.get('/forget', function (req, res) {
    res.render('pages/forget', {message: "null"});
});



router.get('/sendmail', function (req, res) {
    res.render('pages/sendmail', {message:"null"});
});



router.get('/registration', function (req, res) {
    res.render('pages/registration');
});



router.get('/edit/:name/:email/:totalProfit/:totalDeposit/:totalWithdraw/:user', function (req, res) {
    res.render('pages/edit', {
        name: req.params.name,
        message: "null",
        email: req.params.email,
        totalProfit: req.params.totalProfit,
        totalDeposit: req.params.totalDeposit,
        totalWithdraw: req.params.totalWithdraw,
        user: req.params.user,
    });
});


module.exports = router;