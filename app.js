//CARREGANDO MODULOS
const express = require('express')
const handlebars = require('express-handlebars')
const body_parser = require('body-parser')
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const user = require('./routes/usuario')
const path = require('path')
const express_session = require('express-session')
const connect_flash = require('connect-flash')
const ModelPost = require('./models/post')
const ModelCategoria = require('./models/categoria')
const passport = require('passport')
require('./config/auth')(passport)

const app = express()

//CONFIGURAÇÕES 
    //session
    app.use(express_session({
        secret:'887878546821',
        resave: true,
        saveUninitialized: true
    }))
    //passaport 
    app.use(passport.initialize())
    app.use(passport.session())
    //flash
    app.use(connect_flash())

    //Middleware
    /*Middleware é um conceito em desenvolvimento de software, especialmente em frameworks web como Express.js, que se refere a funções que executam uma lógica específica durante o processamento de uma requisição HTTP. Elas atuam como uma camada intermediária entre o recebimento da requisição e a geração da resposta.

    ### Características do Middleware:
    1. **Acesso à Requisição e Resposta**: Um middleware tem acesso aos objetos de requisição (`req`) e resposta (`res`).
    2. **Encadeamento**: Vários middlewares podem ser encadeados, onde cada um pode modificar a requisição ou a resposta, ou realizar tarefas como autenticação, log, etc.
    3. **Controle de Fluxo**: Usando a função `next()`, o middleware pode passar o controle para o próximo middleware na fila. Se `next()` não for chamado, o fluxo é interrompido.

    ### Exemplos de Uso:
    - **Autenticação**: Verificar se o usuário tem permissão para acessar uma rota.
    - **Log de Requisições**: Registrar detalhes de cada requisição feita ao servidor.
    - **Tratamento de Erros**: Capturar e tratar erros antes de enviar uma resposta ao cliente.
    - **Parsing**: Processar e interpretar o corpo da requisição, como JSON ou dados de formulário.

    Em resumo, middlewares são componentes essenciais para manipular requisições e respostas de forma modular e reutilizável em aplicações web.*/
    
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })


   //body_parser // body parser foi adicionado ao express
    app.use(body_parser.urlencoded({extended: true}))
    app.use(body_parser.json())

   //handlebars 
   app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
   app.set('view engine', 'handlebars');

   //public
   app.use(express.static("public"))
 
   //mongoose
   try {
    mongoose.connect('mongodb://127.0.0.1:27017/blogapp')
    console.log(`conectado ao banco de dados.`)
   } catch (error) {
    console.log(`erro ao tentar se conectar com o banco de dados. ERROR: ${error}`)
   }

   //notas 
   // o metodo use() do express serve pra configurações de middleware
   
//ROTAS
app.get('/',(req, res)=>{
    ModelPost.find().populate('categoria').sort({data:'desc'}).lean().then((postagem)=>{
        res.render('index', {postagem:postagem})
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao carregar postagens')
        res.redirect('/404')
    })
})

app.get('/postagem/ver/:slug',(req , res)=>{
    ModelPost.findOne({slug: req.params.slug}).populate('categoria').lean().then((postagem)=>{
        res.render('postagem/index', {postagem:postagem})
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao acessar') 
        res.redirect('/')
    })
})

app.get('/404', (req, res)=>{
    res.send('error')
})

app.get('/categoria', (req, res)=>{
    ModelCategoria.find().sort({date:'desc'}).lean().then((categoria)=>{
        res.render('categoria/index',{categoria:categoria})
    }).catch((err)=>{
        req.flash('error_msg','Erro ao carregar categorias')
        res.render('/')
    })
})
app.get('/categoria/:slug',(req,res)=>{
    ModelCategoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        if(!categoria) req.flash('error_msg','erro ao listar posts com o mesmo slug'), res.redirect('/')
        ModelPost.find({categoria: categoria._id}).lean().then((postagem)=>{
            res.render('categoria/postagens',{postagem:postagem, categoria:categoria})
        }).catch((err)=>{
            req.flash('error_msg','erro ao listar posts ')
            res.redirect('/')
        })
    }).catch((err)=>{
        req.flash('error_msg','essa categoria não existe')
        res.redirect('/')
    })
})
app.use('/admin', admin)
app.use('/user', user )


//OUTROS

    const PORT = process.env.PORT || 8081
    app.listen(PORT, ()=>{
        console.log(`servidor rondando em https://localhost:${PORT}`)
    })
