var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =======================================
// Busqueda coleccion
// =======================================
app.get('/coleccion/:coleccion/:data', (req, res) => {

    var coleccion = req.params.coleccion;
    var busqueda = req.params.data;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    // En base a lo que venga en coleccion, llamo a una promesa o a otra
    switch (coleccion.toLocaleLowerCase()) {

        case "hospitales":
            promesa = buscarHospitales(regex);
            break;
        case "medicos":
            promesa = buscarMedicos(regex);
            break;
        case "usuarios":
            promesa = buscarUsuarios(regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, hospitales y medicos',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
            break;
    }

    promesa.then(respuesta => {
        res.status(200).json({
            ok: true,
            [coleccion]: respuesta
        });
    });
});

// =======================================
// Busqueda todo 
// =======================================
app.get('/:data', (req, res, next) => {

    var busqueda = req.params.data;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar los hospitales', err);

                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar los medicos', err);

                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar los usuarios', err);

                } else {
                    resolve(usuarios);
                }
            });
    });

}

module.exports = app;