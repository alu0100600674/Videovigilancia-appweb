/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');
var Camara = require('../../app/models/camara');
var Utilities = require('./utilities');
var Seguridad = require('./seguridad');
var nodemailer = require('nodemailer');

var firebase = require('firebase');
var config = {
    apiKey: "AIzaSyC0ERiCV6lAJA2a9I1fMR2JCeE5GgwlZs0",
    authDomain: "robocam-3e863.firebaseapp.com",
    databaseURL: "https://robocam-3e863.firebaseio.com",
    projectId: "robocam-3e863",
    storageBucket: "robocam-3e863.appspot.com",
    messagingSenderId: "609973164692"
};
firebase.initializeApp(config);
var database = firebase.database()

var error = {'response' : 404};
var error_400 = {'response' : 400};
var ok = {'response' : 201};

/********** Generar clave compartida ***********/
var Seguridad = require('./seguridad');
var clientpub = Seguridad.certificado.leerClaveDeFichero('./certificados/clientpub.txt');
var serverpub = Seguridad.certificado.leerClaveDeFichero('./certificados/serverpub.txt');
var serverpri = Seguridad.certificado.leerClaveDeFichero('./certificados/serverpri.txt');

var pub = Seguridad.ecdh.generarClavePublica(clientpub);
var pri = Seguridad.ecdh.generarClavePrivada(serverpri);
var com = Seguridad.ecdh.generarClaveCompartida(pri, pub);
Seguridad.aes.setClave(com.toString('base64'));
/***********************************************/

/* Views Responce */
exports.index = function (req, res) {
    res.render('camaras');
//    if (req.isAuthenticated()){
//        res.render('signals');
//    }else{
//        res.render('home');
//    }
};

exports.addindex = function (req, res) {
    res.render('add_camara');
};

exports.listindex = function (req, res) {
    res.render('list_camara');
};

exports.contactindex = function (req, res) {
    res.render('contact');
};

exports.emailsent = function (req, res) {
    res.render('emailsent');
};
    
exports.emailerror = function (req, res) {
    res.render('emailerror');
};


/************************************************************************************/
/*******    API Responces                                                  **********/
/************************************************************************************/
/* All cams */
exports.getall = function (request, response) {
    Camara.find(function (err, camaras) {
        if (!err) {
            response.send(camaras);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* All cams */
exports.getalllive = function (request, response) {
    Camara.find({online : true}, function (err, camaras) {
        if (!err) {
            response.send(camaras);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* Delete */
exports.delete = function (request, response) {
    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        camara.remove();
        response.send(ok);
    });
};

/* New camera sin cifrado */
// exports.new = function (request, response) {
//     if ( Utilities.isEmpty(request.body.name)) return response.send(error_400);
//     if ( Utilities.isEmpty(request.body.server)) return response.send(error_400);
//     if ( Utilities.isEmpty(request.body.ipcamara)) return response.send(error_400);
//     Camara.find({name: request.body.name}).exec(function (err, camaras) {
//         if (err) return response.send(error);
//         if (!Utilities.isEmpty(camaras)) return response.send(error);
//         var server = "rtmp://" + request.body.server + request.body.name;
//         var camaranueva = new Camara({ server: server, name: request.body.name, ip: request.body.ipcamara});
//         camaranueva.save();
//         response.send(ok);
//     });
// };

/* New camera con cifrado */
exports.new = function (request, response) {
    if ( Utilities.isEmpty(Seguridad.aes.descifrar(request.body.name))) return response.send(error_400);
    if ( Utilities.isEmpty(Seguridad.aes.descifrar(request.body.server))) return response.send(error_400);
    if ( Utilities.isEmpty(Seguridad.aes.descifrar(request.body.ipcamara))) return response.send(error_400);
    Camara.find({name: Seguridad.aes.descifrar(request.body.name)}).exec(function (err, camaras) {
        if (err) return response.send(error);

        if (!Utilities.isEmpty(camaras)){ // Actualizar si ya existe
            Camara.find({name: Seguridad.aes.descifrar(request.body.name)}).exec(function (err, camara) {
                if (err) response.send(error_400);
                if (Utilities.isEmpty(camara)) return response.send(error_400);
                camara[0].online = false;
                camara[0].ip = Seguridad.aes.descifrar(request.body.ipcamara); // Actualizar la ip de la cámara.
                camara[0].nickname = Seguridad.aes.descifrar(request.body.nombrecamara); // Actualizar el alias de la cámara.
                camara[0].server = "rtmp://" + Seguridad.aes.descifrar(request.body.server) + Seguridad.aes.descifrar(request.body.name); // Actualizar la ip del servidor de streaming.
                camara[0].save();
                return response.send(ok);
            });

        } else { // Crear nueva
            var server = "rtmp://" + Seguridad.aes.descifrar(request.body.server) + Seguridad.aes.descifrar(request.body.name);
            var camaranueva = new Camara({ server: server, name: Seguridad.aes.descifrar(request.body.name), ip: Seguridad.aes.descifrar(request.body.ipcamara), nickname: Seguridad.aes.descifrar(request.body.nombrecamara) });
            camaranueva.save();
            response.send(ok);
        }
    });
};

/* ¿on Live? sin cifrado */
// exports.getisonline = function (request, response) {
//     if (Utilities.isEmpty(request.params.id)) return response.send(error_400);
//     Camara.findOne({_id: request.params.id}, function (err, camara) {
//         if (err) return response.send(error);
//         if (Utilities.isEmpty(camara)) return response.send(error);
//         response.send(camara.online);
//     });
// };

/* ¿on Live? con cifrado */
exports.getisonline = function (request, response) {
    if (Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        response.send(camara.online);
    });
};

/* on Live sin cifrado */
// exports.putonline = function (request, response) {
//     if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
//     Camara.find({name: request.params.name}).exec(function (err, camara) {
//         if (err) response.send(error_400);
//         if (Utilities.isEmpty(camara)) return response.send(error_400);
//         camara[0].online = true;
//         camara[0].ip = request.body.ipcamara; // Actualizar la ip de la cámara.
//         camara[0].server = "rtmp://" + request.body.server + request.body.name; // Actualizar la ip del servidor de streaming.
//         camara[0].save();
//         response.send(ok);
//     });
// };

/* on Live con cifrado */
exports.putonline = function (request, response) {
    if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
    Camara.find({name: request.params.name}).exec(function (err, camara) {
        if (err) response.send(error_400);
        if (Utilities.isEmpty(camara)) return response.send(error_400);
        camara[0].online = true;
        camara[0].ip = Seguridad.aes.descifrar(request.body.ipcamara); // Actualizar la ip de la cámara.
        camara[0].nickname = Seguridad.aes.descifrar(request.body.nombrecamara); // Actualizar el alias de la cámara.
        camara[0].server = "rtmp://" + Seguridad.aes.descifrar(request.body.server) + Seguridad.aes.descifrar(request.body.name); // Actualizar la ip del servidor de streaming.
        camara[0].save();
        response.send(ok);
    });
};

/* off Live sin cifrado */
// exports.putoffline = function (request, response) {
//     if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
//     Camara.find({name: request.params.name}).exec(function (err, camara) {
//         if (err) response.send(error_400);
//         if (Utilities.isEmpty(camara)) return response.send(error_400);
//         camara[0].online = false;
//         camara[0].save();
//         response.send(ok);
//     });
// };

/* off Live con cifrado */
exports.putoffline = function (request, response) {
    if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
    Camara.find({name: request.params.name}).exec(function (err, camara) {
        if (err) response.send(error_400);
        if (Utilities.isEmpty(camara)) return response.send(error_400);
        camara[0].online = false;
        camara[0].save();
        response.send(ok);
    });
};

/* Start streaming */
exports.startstreaming = function (request, response) {
    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);

        var comando = 'robocamstartstreaming';
        // var cifrado = Seguridad.aes.cifrar(comando);
        var updates = {};
        updates[camara.ip] = comando;
        firebase.database().ref().update(updates);

        response.send(ok);
    });
};

/* Start deteccion de movimiento */
exports.startmov = function (request, response) {
    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);

        var comando = 'robocamstartmotiondetection';
        // var cifrado = Seguridad.aes.cifrar(comando);
        var updates = {};
        updates[camara.ip] = comando;
        firebase.database().ref().update(updates);

        response.send(ok);
    });
};

/* Comandos de robot */
exports.enviarComando = function (request, response) {
    switch(request.body.movimiento){

        case 'forwardleft':
            var comando = 'robotforwardleft-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'forward':
            var comando = 'robotforward-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'forwardright':
            var comando = 'robotforwardright-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'rotateleft':
            var comando = 'robotrotateleft-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'movestop':
            var comando = 'robotmovestop-' + request.body.vel + '-' + request.body.tiempo;
            var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'rotateright':
            var comando = 'robotrotateright-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'backwardleft':
            var comando = 'robotbackwardleft-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'backward':
            var comando = 'robotbackward-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'backwardright':
            var comando = 'robotbackwardright-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;
        
        case 'robotdock':
            var comando = 'robotdock-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'robotstartoi':
            var comando = 'robotstartoi-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'robotsafemode':
            var comando = 'robotsafemode-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'robotstopmode':
            var comando = 'robotstopmode-' + request.body.vel + '-' + request.body.tiempo;
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;

        case 'stopstreaming':
            var comando = 'robocamstopstreaming';
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;
            
        case 'flash':
            var comando = 'robocamflash';
            // var cifrado = Seguridad.aes.cifrar(comando);
            var updates = {};
            updates[request.body.ip] = comando;
            firebase.database().ref().update(updates);
            break;
    }
    console.log(request.body);
    response.send(ok);
}


/* Send an email from contact form */
exports.contactEmail = function (request, response) {
    
    var CONTACT_EMAIL = "";
    var CONTACT_PASSWORD = "";
    
    var mailOpts, smtpTrans;
        
     // Email parameters
    smtpTrans = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: CONTACT_EMAIL, pass: CONTACT_PASSWORD }
    });
   
    // Email content
    mailOpts = {
        from: request.body.name + '(' + request.body.email + ')',
        to: CONTACT_EMAIL,
        subject: request.body.subject,
        text: 'De: ' + request.body.name + ' ' + request.body.surname + ' (' + request.body.email + ')\n\n' + request.body.textemail
    };

    // Send email and response
    smtpTrans.sendMail(mailOpts, function (error, res) {
        if (error) {
            console.log(error);
            response.render('emailerror');
        } else {
            console.log("Email sent");
            response.render('emailsent');
        }
    });
};