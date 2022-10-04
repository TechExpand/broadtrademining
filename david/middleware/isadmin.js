






 module.exports = async (req, res, next)=>{
    // const token = req.header('Authorization');
    const admin = req.cookies.isadmin;

    if(admin){
        next();
    }else{
        res.redirect("/dashboard/1")
    }

    
}

