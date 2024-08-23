const router = require('express').Router()
const mongoose = require('mongoose')
const ModelUsuario = require('../models/usuario')
const bcrypt = require('bcryptjs')
const passport = require('passport')

//REGISTRAR

router.get('/registro',(req,res)=>{
    res.render('usuario/registro')
})

router.post('/registro', (req, res)=>{
    const error = []
    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null) error.push({text:'Nome inválido'})
    if(!req.body.email || req.body.email == undefined || req.body.email == null) error.push({text:'E-mail inválido'})
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null) error.push({text:'Senha inválido'})
    if(req.body.senha < 4) error.push({text:'Senha muito curta'})
    if(req.body.senha != req.body.senha02) error.push({text:'Senhas diferentes'})
    if(error.length > 0){
        res.render('usuario/registro', {error:error})
    }

    ModelUsuario.findOne({email: req.body.email}).lean().then((usuario)=>{
        if(usuario){
            req.flash('error_msg','E-mail já registrado. Por Favor use outro! ')
            res.redirect('/user/registro')
        }else{
            const NovoUsuario = new ModelUsuario({
                nome:req.body.nome,
                senha:req.body.senha,
                email:req.body.email
            })
            bcrypt.genSalt(10,(erro,salt)=>{
                bcrypt.hash(NovoUsuario.senha, salt,(erro,hash)=>{
                    if(erro){
                        req.flash('error_msg', 'Erro ao salvar usuário')
                        res.redirect('/user/registro')
                    }
                    NovoUsuario.senha = hash

                    NovoUsuario.save().then(()=>{
                        req.flash('success_msg', 'Conta criada com sucesso')
                        res.redirect('/')
                    }).catch((err)=>{
                        req.flash(()=>{
                            req.flash('error_msg','Erro ao tentar registrar conta')
                            res.redirect('/user/registro')
                        })
                    })
                })
            })
        }

        
    }).catch((err)=>{
        req.flash('error_msg', 'Erro interno')
        res.redirect('/')
    })
    
})


//LOGIN

router.get('/login',(req,res)=>{
    res.render('usuario/login')
})
router.post('/login',(req, res, next)=>{
    try {
        passport.authenticate('local',{
            successRedirect:'/',
            failureRedirect:'/user/login',
            failureFlash: true
        })(req,res,next)
       
    
    } catch (error) {
        console.error(error)
    }
   
})

//logout

router.get('/logout',(req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash('success_msg','Deslogado com sucesso')
        res.redirect('/')
    })
   
})
module.exports = router