const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const AdicionarModelPost = new moongose.Schema({
    titulo:{
        type:String,
        required:true
    },
    slug:{
        type:String, 
        required:true
    },
    descricao:{
        type:String,
        required:true
    },
    conteudo:{
        type:String,
        required:true
    },
    categoria:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'categorias',
        required:true
    },
    data:{
        type:Date,
        default: Date.now
    }
})

const ModelPost = moongose.model('posts', AdicionarModelPost)

module.exports = ModelPost