var users = {
    admin: {id:1, username:"admin", password:"atlas"},
};

exports.auth = function(login, password, callback) {

    if(users[login]){

        if(password === users[login].password) {
            console.log(users[login]);
            callback(null, users[login]);
        } else {
            callback(new Error('Contraseña errónea.'));
        }
    } else {
        callback(new Error('El usuario introducido no existe.'));
    }
}; 