const router = require('express').Router()
const mongoose = require('mongoose')
const AdicionarModel = require('../models/categoria')
const ModelPost = require('../models/post')
const {eAdmin} = require('../helpers/eAdmin')


router.get('/cartas', eAdmin, (req,res)=>{
    res.render('admin/cartas')
})
router.get('/posts',eAdmin,(req, res)=>{
    res.render('pricipal')
})






//rota categoria
router.get('/categorias',eAdmin, (req, res) =>[
    AdicionarModel.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render('admin/categorias',{categorias: categorias})
    }).catch((error)=>{
        req.flash('error_msg', 'houve um erro ao listar as categorias' + error)
        res.redirect('/admin')
    })     
])





//adicionar categoria       
router.get('/addcategorias',eAdmin, (req,res)=>{
    res.render('admin/addcategorias')
})

router.post("/categorias/nova", eAdmin,(req, res)=>{
    var error = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) error.push({text:'nome invalido'})
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) error.push({text:'slug invalido'}) 
    if(error.length > 0){
        res.render('admin/addcategorias', {error: error})
    }else{
        const AdicionandoNovaCategoriaAoBancoDeDados = new AdicionarModel({
            nome: req.body.nome,
            slug: req.body.slug
        })
        const adicionar_func = async () =>{
            try {
               await AdicionandoNovaCategoriaAoBancoDeDados.save()
                console.log('categoria adicionada')
                req.flash('success_msg' , 'categoria criada com sucesso')
                res.redirect('/admin/categorias')
            } catch (error) {
                req.flash('error_msg','houve um erro ao tentar criar categoria, tente novamente')
                res.redirect('/admin/categorias')
                console.log(`erro ao tentar adicionar nova categoria. ERRO: ${error}`)
            }
        }
        adicionar_func()
    }
    
})




//editar categoria
router.get('/categorias/edit/:id',eAdmin, async(req, res)=>{
  await AdicionarModel.findById(req.params.id).lean().then((categorias)=>{
    res.render('admin/editcategorias',{categorias: categorias})
  }).catch((error)=>{
    req.flash('error_msg','Esta categoria não existe')
    res.redirect('/admin/categorias')
  })
   
})

router.post('/editar/:id',eAdmin,async(req, res)=>{
    if(!req.body.slug){res.send()}
   await AdicionarModel.findByIdAndUpdate(req.params.id, {
    nome: req.body.nome,
    slug: req.body.slug
   }).then(()=>{
    res.redirect('/admin/categorias')
   }).catch((error)=>{
    
   })
   
})




//deletar categoria
router.get('/deletar/categoria/:id',eAdmin,(req, res)=>{
    AdicionarModel.findById(req.params.id).lean().then((categoria)=>{
        res.render('admin/deletar', {categoria: categoria})
    })
})
router.post("/deletando/categoria/:id",eAdmin, async (req, res)=>{
    await AdicionarModel.deleteOne({_id: req.params.id }).then(()=>{
        console.log('categoria deletada')
        req.flash('success_msg', 'Categoria deletada')
        res.redirect('/admin/categorias')
    }).catch((error)=>{
        console.log(error)
        req.flash('error_msg','Erro ao encontrar ou deletar categoria')
        res.redirect('/admin/categorias')
})
})










//postagem
router.get('/postagens',eAdmin,(req, res)=>{
    ModelPost.find().populate('categoria').sort({data:'desc'}).lean().then((postagem)=>{
        res.render('admin/postagens', {postagem:postagem})
    }).catch((error)=>{
        req.flash('error_msg', 'houve um erro ao listar as categorias' + error)
        res.redirect('/admin/postagem')
    })  
})
//formulario de adição de postagem
router.get('/postagens/add',eAdmin,(req, res)=>{
    AdicionarModel.find().lean().then((categoria)=>{
        res.render('admin/addpostagem', {categoria:categoria})
    }).catch((error)=>{
        req.flash('error_msg', 'Erro ao carregar o formulário')
        res.redirect('/admin/categorias')
    })
   
})

//adicionando postagem no banco de dados
router.post('/adicionando/postagem',eAdmin,async (req, res)=>{
    const erros = []
    if(req.body.categoria == '0'){erros.push({text:"Categoria inválida, resgistre uma categoria!"})}

    if(erros.length > 0){
        res.render('admin/addpostagem',{erros:erros})
    }
    else {
        try {
            const AdicionandoNovaPostagemAoBancoDeDados = new ModelPost({
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            })
         await  AdicionandoNovaPostagemAoBancoDeDados.save().then(()=>{
            console.log('postagem adicionada')
            req.flash('success_msg', 'Postagem adicionada com sucesso')
            res.redirect('/admin/postagens')
         })
        } catch (error) {
            console.log('erro ao adicionar postagem' + error)
            req.flash('error_msg','Erro ao adicionar postagem')
            res.redirect('/admin/postagens')
        }
    }
})

//editando postagens

router.get('/edit/postagem/:id',eAdmin,(req, res)=>{
    ModelPost.findOne({_id: req.params.id}).lean().then((postagem)=>{
        AdicionarModel.find().lean().then((categoria)=>{
            res.render('admin/editpostagem', {postagem: postagem, categoria: categoria})
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao procurar postagem')
        res.redirect('/admin/postagens')
    })
})


router.post('/postagem/editada',eAdmin,(req, res)=>{
    ModelPost.findByIdAndUpdate({_id: req.body.id},{
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria
    }).then(()=>{
        req.flash('success_msg', 'Postagem editada com sucesso')
        res.redirect('/admin/postagens')
    }).catch(()=>{
        req.flash('error_msg','Erro ao editar postagem')
        res.redirect('/admin/postagens')
    })
})

//deletando post
router.get('/delete/postagem/:id',eAdmin, async (req, res)=>{
   await ModelPost.deleteOne({ _id: req.params.id}).then((post)=>{
    req.flash('success_msg', 'Postagem deletada com sucesso')
    res.redirect('/admin/postagens')
   }).catch((err)=>{
    req.flash('error_msg','Erro ao editar postagem')
    res.redirect('/admin/postagens')
   })
   
})

module.exports = router