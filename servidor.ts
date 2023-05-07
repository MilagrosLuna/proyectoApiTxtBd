// #region INICIO SERVER Y CONFIGS
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors({credentials: true, origin: true}));
//AGREGO MULTER
const multer = require('multer');
//AGREGO MIME-TYPES
const mime = require('mime-types');
//AGREGO STORAGE
const storage = multer.diskStorage({
    destination: "public/fotos/",
});
const upload = multer({
    storage: storage
});

//AGREGO FILE SYSTEM
const fs = require('fs');
//AGREGO JSON
app.use(express.json());

//INDICO RUTA HACIA EL ARCHIVO
const path_archivo = "./backendArchivos/archivos/alumnos.txt";

//INDICO RUTA PARA EL ARCHIVO PRODUCTOS-FOTOS
const path_archivo_foto = "./backendArchivos/archivos/alumnos.txt";



//AGREGO MYSQL y EXPRESS-MYCONNECTION
const mysql = require('mysql');
const myconn = require('express-myconnection');
const db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'alumnosapi'
};

//AGREGO MW 
app.use(myconn(mysql, db_options, 'single'));// el 3 parametro es forma de conexion simple o multiple

//AGREGO CORS (por default aplica a http://localhost)

// el cors es para los servidores cruzados
//AGREGO MW 
//app.use(cors());
    /* 
    let listaBlanca = ["http://localhost/api/backendArchivos/indexArchivo.html", "http://localhost/api/"];

    let corsOptions = {
        origin: (origin:any, callback:any)=>{
            if(listaBlanca.indexOf(origin) != -1)
                callback(null, true);
            else
                callback(new Error("no permitido por CORS."));
        }
    }
    routes.get("/", cors(corsOptions), (request:any, response:any)=>{
        response.send("Solo accedia si se encuentra en la 'lista blanca'");
    });
    */

//DIRECTORIO DE ARCHIVOS ESTÁTICOS
app.use(express.static("public"));
app.set('puerto', 9999);
app.get('/', (request:any, response:any)=>{
    response.send('GET - servidor NodeJS');
});
//LISTAR BD
app.get('/alumnos_bd', (request:any, response:any)=>{

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("select * from alumnos_tabla_api", (err:any, rows:any)=>{

            if(err) throw("Error en consulta de base de datos.");

            //response.json(rows);
            response.send(JSON.stringify(rows));
        });
    });

});
//AGREGAR BD
app.post('/alumnos_bd', upload.single("archivo"), (request:any, response:any)=>{
   
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);// la renombras y la alojas en el path q vos dijiste

    obj.path = path.split("public/")[1];

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");
                                                    // obj tiene q ser un array
        conn.query("insert into alumnos_tabla_api set ?", [obj], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            response.send("alumno agregado a la bd.");
        });
    });
});
//MODIFICAR BD
app.post('/alumnos_bd/modificar', upload.single("archivo"), (request:any, response:any)=>{
    
    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let obj_modif : any = {};
    //para excluir la pk (codigo)
    obj_modif.nombre = obj.nombre;
    obj_modif.apellido = obj.apellido;
    obj_modif.path = obj.path;

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("update alumnos_tabla_api set ? where legajo = ?", [obj_modif, obj.legajo], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            response.send("alumno modificado en la bd.");
        });
    });
});
//ELIMINAR BD
app.post('/alumnos_bd/eliminar', (request:any, response:any)=>{
   
    let obj = request.body;
    let path_foto : string = "public/";

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        //obtengo el path de la foto del producto a ser eliminado
        conn.query("select path from alumnos_tabla_api where legajo = ?", [obj.legajo], (err:any, result:any)=>{

            if(err) throw("Error en consulta de base de datos.");
            //console.log(result[0].path);
            path_foto += result[0].path;
        });
    });

    request.getConnection((err:any, conn:any)=>{

        if(err) throw("Error al conectarse a la base de datos.");

        conn.query("delete from alumnos_tabla_api where legajo = ?", [obj.legajo], (err:any, rows:any)=>{

            if(err) {console.log(err); throw("Error en consulta de base de datos.");}

            fs.unlink(path_foto, (err:any) => {
                if (err) throw err;
                console.log(path_foto + ' fue borrado.');
            });

            response.send("alumno eliminado de la bd.");
        });
    });
});


//LISTAR
app.get('/alumnos', (request:any, response:any)=>{

    fs.readFile(path_archivo_foto, "UTF-8", (err:any, archivo:any)=>{

        if(err) throw("Error al intentar leer el archivo con foto.");

        console.log("Archivo leído con foto.");

        let alumnos_array = archivo.split(",\r\n");
        
        response.send(JSON.stringify(alumnos_array));

    });

});

//AGREGAR
app.post('/alumnos', upload.single("foto"), (request:any, response:any)=>{
    console.log(request.body.obj);
    console.log("messi");

    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    let contenido = JSON.stringify(obj) + ",\r\n";

    //agrega texto
    fs.appendFile(path_archivo_foto, contenido, (err:any)=>{

        if(err) throw("Error al intentar agregar en archivo con foto.");

        console.log("Archivo escrito con foto.");

        response.send("Archivo alumno escrito - con foto.");
    });

});

//MODIFICAR
app.post('/alumnos/modificar', upload.single("foto"), (request:any, response:any)=>{

    let file = request.file;
    let extension = mime.extension(file.mimetype);
    let obj = JSON.parse(request.body.obj);
    let path : string = file.destination + obj.legajo + "." + extension;

    fs.renameSync(file.path, path);

    obj.path = path.split("public/")[1];

    fs.readFile(path_archivo_foto, "UTF-8", (err:any, archivo:any)=>{

        if(err) throw("Error al intentar leer el archivo con foto.");

        let prod_array = archivo.split(",\r\n");
        let obj_array : Array<any> = [];

        prod_array.forEach( (prod_str:any) => {

            if(prod_str != "" && prod_str != undefined){

                obj_array.push(JSON.parse(prod_str));
            }
        });

        let obj_array_modif : Array<any> = [];

        obj_array.forEach( (alumno:any) => {
            
            if(alumno.legajo == obj.legajo){
                
                alumno.nombre = obj.nombre;
                alumno.apellido = obj.apellido;
            }

            obj_array_modif.push(alumno);
        });

        let alumnos : string = "";

        obj_array_modif.forEach( (alumno:any) => {

            alumnos += JSON.stringify(alumno) + ",\r\n";
        });

        //escribe texto
        fs.writeFile(path_archivo_foto, alumnos, (err:any)=>{

            if(err) throw("Error al intentar escribir en archivo.");

            console.log("Archivo modificado con foto.");

            response.send("Archivo alumno modificado con foto.");
        });
    });
});

//ELIMINAR
app.post('/alumnos/eliminar', (request:any, response:any)=>{

    let obj = request.body;

    fs.readFile(path_archivo_foto, "UTF-8", (err:any, archivo:any)=>{

        if(err) throw("Error al intentar leer el archivo con foto.");

        let prod_array = archivo.split(",\r\n");
        let obj_array : Array<any> = [];

        prod_array.forEach( (prod_str:any) => {

            if(prod_str != "" && prod_str != undefined){

                obj_array.push(JSON.parse(prod_str));
            }
        });

        let obj_array_eli : Array<any> = [];
        let path_foto : string = "public/";

        obj_array.forEach( (prod:any) => {
            
            if(prod.legajo != obj.legajo){
                //se agregan todos los alumnos, menos el que se quiere eliminar
                obj_array_eli.push(prod);
            }
            else{
                //se guarda el path de la foto a ser eliminada
                path_foto += prod.path;
            }          
        });

        let alumnos : string = "";

        if(path_foto !== "") {

            obj_array_eli.forEach( (prod:any) => {

                alumnos += JSON.stringify(prod) + ",\r\n";
            });

            //escribe texto
            fs.writeFile(path_archivo_foto, alumnos, (err:any)=>{
                if(err) throw("Error al intentar escribir en archivo con foto.");
                console.log("Archivo eliminado con foto.");
                fs.unlink(path_foto, (err:any) => {
                    if (err) throw err;
                    console.log(path_foto + ' fue borrado.');
                });
                response.send("Archivo alumnos con foto eliminado.");
            });

        }
    });
});



app.listen(app.get('puerto'), ()=>{
    console.log('Servidor corriendo sobre puerto:', app.get('puerto'));
});