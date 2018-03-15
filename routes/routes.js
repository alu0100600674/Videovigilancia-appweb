//App routes
module.exports = function (app) {

    var user = require('../app/controllers/user');
    var utilities = require('../app/controllers/utilities');
    var camaras = require('../app/controllers/camaras');
    var sessionController = require('../app/controllers/session');
    var passport = require('passport');

    /* Home Page */
    app.get('/', utilities.index);

    // Camaras
    // Vistas
    app.get('/live', camaras.index); // index de todas las cámaras en directo
    app.get('/addcamara', sessionController.loginRequired, camaras.addindex); // vista para añadir camara
    app.get('/listcamaras', sessionController.loginRequired, camaras.listindex); // vista para añadir camara
    app.get('/contact', camaras.contactindex); // Contacto
    app.get('/emailsent', camaras.emailsent); // Email enviado satisfactoriamente
    app.get('/emailerror', camaras.emailerror); // Fallo al enviar el email

    app.get('/login', sessionController.new); // Formulario de login
    app.post('/login', sessionController.create); // Crear sesión
    app.get('/logout', sessionController.destroy); // Destruir sesión

    // API
    app.post('/camara', camaras.new); // crear nueva camara --> registro
    app.delete('/camara/:id', camaras.delete);

    app.get('/camaras', camaras.getall); // json con todas las camaras del servidor
    app.get('/livecameras', camaras.getalllive); // json con todas las camaras onlive del servidor

    app.get('/online/:id', camaras.getisonline); // poner una cámara onLive
    app.put('/online/:name', camaras.putonline); // poner una cámara onLive
    app.put('/offline/:name', camaras.putoffline); // poner una cámara offLive

    app.post('/robot', camaras.enviarComando); // Enviar comando para el robot
    app.put('/startstreaming/:id', camaras.startstreaming); // Enviar al smartphone orden de iniciar streaming
    app.put('/startmov/:id', camaras.startmov); // Enviar a smartphone orden de iniciar deteccion de movimiento

    app.post('/contactemail', camaras.contactEmail); // Envía un correo cuando se pulsa el botón de "Enviar"

//    //petición get para acceder a la página de login
//    app.get('/login', utilities.index);
//    //petición post para hacer el login
//    app.post('/login', user.authenticate);
//    //petición post para registrar un usuario
//    app.post('/signup', user.signup);
//
//    app.post('/logout', function(req, res){
//        req.logout();
//        res.redirect('/');
//    });
//
//    app.get('/register', utilities.login);
//
//    // route middleware to make sure a user is logged in
//    function isLoggedIn(req, res, next) {
//
//        // if user is authenticated in the session, carry on
//        if (req.isAuthenticated())
//            return next();
//
//        // if they aren't redirect them to the home page
//        res.redirect('/');
//    }

}
