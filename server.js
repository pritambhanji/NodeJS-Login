if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()

}

const express = require('express')
const app = express()

const bcrypt = require('bcrypt')
const passport = require('passport')

const flash = require('express-flash')
const session = require('express-session')

const initPassport = require('./passport-config')
initPassport(passport, 
    email => {
        return users.find(user => user.email == email)
    }, 
    id => { 
        return users.find(user => user.id == id)
    })

const users = []


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, resp) => {
    resp.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, resp) => {
    resp.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, resp) => {
    resp.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, resp) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email
        })
        resp.redirect('/login')

    } catch {
        resp.redirect('/register')

    }
})

function checkAuthenticated(req, resp, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        resp.redirect('/login')
    }
}

function checkNotAuthenticated(req, resp, next) {
    if (req.isAuthenticated()) {
        return resp.redirect('/')
    } else {
        next()
    }
}



app.listen(3000)