// Camara Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var camaraSchema = new Schema({
    server: String,
    name:  String,
    online: { type: Boolean, default: false }
});


//Export the schema
module.exports = mongoose.model('Camara', camaraSchema);