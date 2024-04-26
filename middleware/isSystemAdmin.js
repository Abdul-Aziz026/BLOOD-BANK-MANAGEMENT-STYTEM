const isLoggedIn = (req, res, next)=>{
    if (!req.session.user) {
        req.flash("error", "Please LoginIn");
        return res.redirect("/auth/login");
    }
    if (req.session.user.role == 3) {
        req.flash("error", "You are not allowed in this page.");
        return res.redirect("/home");
    }
    next();
}
module.exports = isLoggedIn;