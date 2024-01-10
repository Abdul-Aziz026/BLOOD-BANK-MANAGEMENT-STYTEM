const isLoggedIn = (req, res, next)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "Please Login for create Post");
        return res.redirect("/home/login");
    }
    next();
}
module.exports = isLoggedIn;