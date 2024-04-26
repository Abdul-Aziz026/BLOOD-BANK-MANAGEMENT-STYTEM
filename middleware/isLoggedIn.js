const isLoggedIn = (req, res, next)=>{
    if (!req.session.user) {
        req.flash("error", "Please LoginIn");
        return res.redirect("/auth/login");
    }
    next();
}
module.exports = isLoggedIn;