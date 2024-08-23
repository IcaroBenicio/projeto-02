const mongoose = require("mongoose")

const novaCategoriaModel = new mongoose.Schema({
    nome:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

const AdicionarModel = mongoose.model('categorias', novaCategoriaModel)

module.exports = AdicionarModel 