/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');
var Camara = require('../../app/models/camara');
var Utilities = require('./utilities');

var error = {'response' : 404};
var error_400 = {'response' : 400};
var ok = {'response' : 201};

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

/* New camera */
exports.new = function (request, response) {
    if ( Utilities.isEmpty(request.body.name)) return response.send(error_400);
    if ( Utilities.isEmpty(request.body.server)) return response.send(error_400);
    if ( Utilities.isEmpty(request.body.ipcamara)) return response.send(error_400);
    Camara.find({name: request.body.name}).exec(function (err, camaras) {
        if (err) return response.send(error);
        if (!Utilities.isEmpty(camaras)) return response.send(error);
        var server = "rtmp://" + request.body.server + request.body.name;
        var camaranueva = new Camara({ server: server, name: request.body.name, ip: request.body.ipcamara});
        camaranueva.save();
        response.send(ok);
    });
};

/* ¿on Live? */
exports.getisonline = function (request, response) {
    if (Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        response.send(camara.online);
    });
};

/* on Live */
exports.putonline = function (request, response) {
    if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
    Camara.find({name: request.params.name}).exec(function (err, camara) {
        if (err) response.send(error_400);
        if (Utilities.isEmpty(camara)) return response.send(error_400);
        camara[0].online = true;
        camara[0].save();
        response.send(ok);
    });
};

/* off Live  */
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

/* Comandos de robot */
exports.enviarComando = function (request, response) {
    switch(request.body.movimiento){
        case 'rleft':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3rotarizquierda-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
        case 'up':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3arriba-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
        case 'rright':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3rotarderecha-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
        case 'left':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3izquierda-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
        case 'down':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3abajo-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
        case 'right':
            var net = require('net');
            var client = net.connect(1234, request.body.ip);
            client.write('legoev3derecha-' + request.body.vel + '-' + request.body.tiempo + '\n');
            client.end();
            break;
    }
    console.log(request.body);
}
