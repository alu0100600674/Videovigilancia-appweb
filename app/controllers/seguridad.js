/* AES 256 CBC */
var crypto = require('crypto');

exports.aes = (function(clave) {
  var cipher_descifrar, cipher_cifrar, descifrar, setClave, cifrar, iv, key;
  key = crypto.createHash("sha256").update("somepassword").digest();
  iv = '4e5Wa71fYoT7MFEX';
  cipher_descifrar = function(mode, data) {
    var encipher, encoded;
    encipher = crypto[mode]("aes-256-cbc", key, iv);
    encoded = encipher.update(data,'base64','utf8');
    encoded += encipher.final('utf8');
    return encoded;
  };
  cipher_cifrar = function(mode, data) {
    var encipher, encoded;
    encipher = crypto[mode]("aes-256-cbc", key, iv);
    encoded = encipher.update(data,'utf8','base64');
    encoded += encipher.final('base64');
    return encoded;
  };
  cifrar = function(data) {
    return cipher_cifrar("createCipheriv", data);
    console.log("cifrado");
  };
  descifrar = function(data) {
    return cipher_descifrar("createDecipheriv", data);
  };
  setClave = function(clave){
      key = crypto.createHash("sha256").update(clave).digest();
  };
  getClave = function(){
      return key;
  };
  return {
    cifrar: cifrar,
    descifrar: descifrar,
    setClave : setClave,
    getClave : getClave
  };
})();


exports.certificado = (function(){
    var fs = require('fs');
    var leerClaveDeFichero;
    leerClaveDeFichero = function(filename){
        return fs.readFileSync(filename, 'utf8');
    };
    return{
        leerClaveDeFichero : leerClaveDeFichero
    };
})();

exports.ecdh = (function(){
    var ecdh = require('ecdh');
    var curve = ecdh.getCurve('secp128r1');
    var generarClavePublica, generarClavePrivada, generarClaveCompartida;
    generarClavePublica = function(clave){
        var buf = new Buffer(clave, 'base64');
        var publica = ecdh.PublicKey.fromBuffer(curve, buf);
        return publica;
    };
    generarClavePrivada = function(clave){
        var buf = new Buffer(clave, 'base64');
        var publica = ecdh.PrivateKey.fromBuffer(curve, buf);
        return publica;
    };
    generarClaveCompartida = function(privada, publica){
        var compartida = privada.deriveSharedSecret(publica);
        return compartida.toString('base64');
    };
    return{
        generarClavePublica : generarClavePublica,
        generarClavePrivada : generarClavePrivada,
        generarClaveCompartida : generarClaveCompartida
    }
})();
