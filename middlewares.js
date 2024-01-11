const isLoggedIn = (req, res, next)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "Please LoginIn");
        return res.redirect("/home/login");
    }
    next();
}
module.exports = isLoggedIn;