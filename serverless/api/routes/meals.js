const express = require ('express')
const Meals = require ('../models/Meals')


const router = express.Router()

router.get('/', (req, res) => { //ver elementos
    Meals.find() //buscara todos los elementos que hay en meals
        .exec() //devuelve promesa
        .then(x => res.status(200).send(x))
})

router.get('/:id', (req,res) =>{
    Meals.findById(req.params.id)
        .exec()
        .then(x => res.status(200).send(x))
}) //buscar un elemento por id

router.post('/', (req, res) => {// agregar elemento
    Meals.create(req.body).then(x => res.status(201).send(x))
})

router.put('/:id', (req,res) => {
    Meals.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
})//actualizar un dato nuevo 

router.delete('/:id', (req, res) => {
    Meals.findOneAndDelete(req.params.id).exec().then(() => res.sendStatus(204))
})

module.exports =  router