// Login form
exports.new = function(req, res) {
    
    var errors = req.session.errors || {};
    req.session.errors = {};
    
    res.render('login', {errors: errors});
};
    
// POST login
exports.create = function(req, res) {
    
    var login = req.body.login;
    var password = req.body.password;
    
    var userController = require('./user.js');
    userController.auth(login, password, function(error, user){
    
        if(error){
            res.redirect('/login');
            return;
        }
    
        req.session.user = { id : user.id, username : user.username };
        res.redirect('/');
    });
};
    
// Logout
exports.destroy = function(req, res){
  
    delete req.session.user;
    res.redirect('/');
}
    
// Check login
exports.loginRequired = function(req, res, next){
        
    if(req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}; 