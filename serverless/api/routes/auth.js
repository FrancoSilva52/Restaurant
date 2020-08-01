const express = require ('express')
const crypto = require ('crypto') //encriptacionde contraseñas
const jwt = require ('jsonwebtoken') //encriptacionde users
const Users = require ('../models/Users')
const {isAuthenticated} = require('../auth')

const router = express.Router()

const signToken = (_id) => { //definicionde y asignacion de valores 
    return jwt.sign({_id}, 'mi-secreto', { //que va a tocar y duracion del jwt
        expiresIn: 60 * 60 * 24 * 365, 
    } )
}

router.post('/register', (req, res) => {// agregar elemento
    const { email, password } = req.body
    crypto.randomBytes(16, (err, salt) => {
        const newSalt= salt.toString('base64') //string largo para confundir
        crypto.pbkdf2(password, newSalt, 1000, 64 , 'sha1', (err, key) =>{
            const encryptedPassword = key.toString('base64')
            Users.findOne({email}).exec()
                .then(user => {
                    if (user){
                        return res.send('Usuario ya existe')
                    }
                    Users.create({
                        email,
                        password: encryptedPassword,
                        salt: newSalt,
                    }).then(() => {
                        res.send('Usuario creado con éxito')
                    })
                })

        } )
    })
})

router.post('/login', (req, res) => {// agregar elemento
    const { email, password} = req.body
    Users.findOne({email}).exec()
        .then (user => {
            if (!user) {
                return res.send('Email y/o constraseña ingresado incorrecto')
            }
            crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
                const encryptedPassword= key.toString('base64')
                if (user.password === encryptedPassword) {
                    const token = signToken (user._id)
                    return res.send({token})
                }
                return res.send('El email y/o contraseña ingresado es incorrecto')
            })
        })
})

router.get('/me', isAuthenticated, (req, res) => { //obtener los datos del usuario
    res.send(req.user)
})

module.exports =  router