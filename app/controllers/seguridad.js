/* AES 256 CBC */
var crypto = require('crypto');

exports.aes = (function() {
  var cipher_descifrar, cipher_cifrar, descifrar, cifrar, iv, key;
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
  return {
    cifrar: cifrar,
    descifrar: descifrar
  };
})();
