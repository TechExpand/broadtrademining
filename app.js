var express = require('express');
var app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors());
app.use(cookieParser());




const mongoose = require('mongoose');
// const uri = "mongodb+srv://ediku126:ediku126@cluster0.flaukda.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://ediku126:ediku126@cluster0.7xzwjnh.mongodb.net/?retryWrites=true&w=majority";

// mongosh "mongodb+srv://cluster0.flaukda.mongodb.net/myFirstDatabase" --apiVersion 1 --username ediku126
// const uri = "mongodb://localhost:27017/davidfriend"
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB Connected…")
  })
  .catch(err => console.log(err))



// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));

// use res.render to load up an ejs view file




app.use('/',  require('./routes/home.js'));


app.use(function(err,req,res,next){
	res.status(422).send({error: err.message});
  });


  app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
  });



app.listen(process.env.PORT || 8080);
console.log('Server is listening on port 8080');