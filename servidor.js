"use strict";
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors({ credentials: true, origin: true }));
const multer = require('multer');
const mime = require('mime-types');
const storage = multer.diskStorage({
    destination: "public/fotos/",
});
const upload = multer({
    storage: storage
});
const fs = require('fs');
app.use(express.json());
const path_archivo = "./backendArchivos/archivos/alumnos.txt";
const path_archivo_foto = "./backendArchivos/archivos/alumnos.txt";
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'alumnosapi'
};
app.use(myconn(mysql, db_options, 'single'));
app.use(express.static("public"));
app.set('puerto', 9999);
app.get('/', (request, response) => {
    response.send('GET - servidor NodeJS');
});
app.get('/alumnos_bd', (request, response) => {
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select * from alumnos_tabla_api", (err, rows) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            response.send(JSON.stringify(rows));
        });
    });
});
app.post('/alumnos_bd', upload.single("archivo"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("insert into alumnos_tabla_api set ?", [obj], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.send("alumno agregado a la bd.");
        });
    });
});
app.post('/alumnos_bd/modificar', upload.single("archivo"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    let obj_modif = {};
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.path = obj.path;
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("update alumnos_tabla_api set ? where legajo = ?", [obj_modif, obj.legajo], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            response.send("alumno modificado en la bd.");
        });
    });
});
app.post('/alumnos_bd/eliminar', (request, response) => {
    let obj = request.body;
    let path_foto = "public/";
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("select path from alumnos_tabla_api where legajo = ?", [obj.legajo], (err, result) => {
            if (err)
                throw ("Error en consulta de base de datos.");
            path_foto += result[0].path;
        });
    });
    request.getConnection((err, conn) => {
        if (err)
            throw ("Error al conectarse a la base de datos.");
        conn.query("delete from alumnos_tabla_api where legajo = ?", [obj.legajo], (err, rows) => {
            if (err) {
                console.log(err);
                throw ("Error en consulta de base de datos.");
            }
            fs.unlink(path_foto, (err) => {
                if (err)
                    throw err;
                console.log(path_foto + ' fue borrado.');
            });
            response.send("alumno eliminado de la bd.");
        });
    });
});
app.get('/alumnos', (request, response) => {
    fs.readFile(path_archivo_foto, "UTF-8", (err, archivo) => {
        if (err)
            throw ("Error al intentar leer el archivo con foto.");
        console.log("Archivo leído con foto.");
        let alumnos_array = archivo.split(",\r\n");
        response.send(JSON.stringify(alumnos_array));
    });
});
app.post('/alumnos', upload.single("foto"), (request, response) => {
    console.log(request.body.obj);
    console.log("messi");
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    let contenido = JSON.stringify(obj) + ",\r\n";
    fs.appendFile(path_archivo_foto, contenido, (err) => {
        if (err)
            throw ("Error al intentar agregar en archivo con foto.");
        console.log("Archivo escrito con foto.");
        response.send("Archivo alumno escrito - con foto.");
    });
});
app.post('/alumnos/modificar', upload.single("foto"), (request, response) => {
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path = file.destination + obj.legajo + "." + extension;
    fs.renameSync(file.path, path);
    obj.path = path.split("public/")[1];
    fs.readFile(path_archivo_foto, "UTF-8", (err, archivo) => {
        if (err)
            throw ("Error al intentar leer el archivo con foto.");
        let prod_array = archivo.split(",\r\n");
        let obj_array = [];
        prod_array.forEach((prod_str) => {
            if (prod_str != "" && prod_str != undefined) {
                obj_array.push(JSON.parse(prod_str));
            }
        });
        let obj_array_modif = [];
        obj_array.forEach((alumno) => {
            if (alumno.legajo == obj.legajo) {
                alumno.nombre = obj.nombre;
                alumno.apellido = obj.apellido;
            }
            obj_array_modif.push(alumno);
        });
        let alumnos = "";
        obj_array_modif.forEach((alumno) => {
            alumnos += JSON.stringify(alumno) + ",\r\n";
        });
        fs.writeFile(path_archivo_foto, alumnos, (err) => {
            if (err)
                throw ("Error al intentar escribir en archivo.");
            console.log("Archivo modificado con foto.");
            response.send("Archivo alumno modificado con foto.");
        });
    });
});
app.post('/alumnos/eliminar', (request, response) => {
    let obj = request.body;
    fs.readFile(path_archivo_foto, "UTF-8", (err, archivo) => {
        if (err)
            throw ("Error al intentar leer el archivo con foto.");
        let prod_array = archivo.split(",\r\n");
        let obj_array = [];
        prod_array.forEach((prod_str) => {
            if (prod_str != "" && prod_str != undefined) {
                obj_array.push(JSON.parse(prod_str));
            }
        });
        let obj_array_eli = [];
        let path_foto = "public/";
        obj_array.forEach((prod) => {
            if (prod.legajo != obj.legajo) {
                obj_array_eli.push(prod);
            }
            else {
                path_foto += prod.path;
            }
        });
        let alumnos = "";
        if (path_foto !== "") {
            obj_array_eli.forEach((prod) => {
                alumnos += JSON.stringify(prod) + ",\r\n";
            });
            fs.writeFile(path_archivo_foto, alumnos, (err) => {
                if (err)
                    throw ("Error al intentar escribir en archivo con foto.");
                console.log("Archivo eliminado con foto.");
                fs.unlink(path_foto, (err) => {
                    if (err)
                        throw err;
                    console.log(path_foto + ' fue borrado.');
                });
                response.send("Archivo alumnos con foto eliminado.");
            });
        }
    });
});
app.listen(app.get('puerto'), () => {
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});
//# sourceMappingURL=servidor.js.map