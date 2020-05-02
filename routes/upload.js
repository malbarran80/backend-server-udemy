var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No seleccion nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreSplit = archivo.name.split('.');
    var extensionArchivo = nombreSplit[nombreSplit.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}_${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {

        case "usuarios":

            Usuario.findById(id, (err, usuario) => {

                if (!usuario) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }
                    });
                }

                var pathAntiguo = './uploads/usuarios' + usuario.img;

                if (fs.existsSync(pathAntiguo)) {
                    fs.unlink(pathAntiguo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {

                    usuarioActualizado.password = '*******';

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });

            break;
        case "medicos":

            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Medico no existe',
                        errors: { message: 'Medico no existe' }
                    });
                }

                var pathAntiguo = './uploads/medicos' + medico.img;

                if (fs.existsSync(pathAntiguo)) {
                    fs.unlink(pathAntiguo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });

            break;
        case "hospitales":

            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }
                    });
                }

                var pathAntiguo = './uploads/hospitales' + hospital.img;

                if (fs.existsSync(pathAntiguo)) {
                    fs.unlink(pathAntiguo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });

            break;
    }
}

module.exports = app;