const mongoose = require('mongoose')

const Usuario = new mongoose.Schema({
    nome:{
        type:String,
        required:true
    },
    senha:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    eAdmin:{
        type:Number,
        default:0
    },  
    data:{
        type:Date,
        default:Date.now
    }
})

const ModelUsuario = mongoose.model('usuarios', Usuario)

module.exports = ModelUsuario