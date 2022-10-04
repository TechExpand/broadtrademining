






 module.exports = async (req, res, next)=>{
    // const token = req.header('Authorization');
    const admin = req.cookies.isadmin;

    if(admin === true){
        res.redirect("/admin/1")
    }else{
        next();
    }

    
}

