var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =======================================
// Obtener todos los hospitales
// =======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospital) => {

                if (err) {
                    res.status(500).json({
                        ok: true,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, registros) => {

                    res.status(200).json({
                        ok: true,
                        hospital: hospital,
                        total: registros
                    });
                });
            });
});

// =======================================
// Actualizar hospital
// =======================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {

            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {

            return res.status(400).json({
                ok: true,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        })
    });
});

// =======================================
// Crear un nuevo hospital
// =======================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            res.status(400).json({
                ok: true,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// =======================================
// Borrar hospital
// =======================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            res.status(500).json({
                ok: true,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            res.status(400).json({
                ok: true,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
})

module.exports = app;