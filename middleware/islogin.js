






 module.exports = async (req, res, next)=>{
    // const token = req.header('Authorization');
    const user = req.cookies.user;

    if(user){
        next();
    }else{
        res.render('pages/home', {message: "pop"})
    }

    
}

