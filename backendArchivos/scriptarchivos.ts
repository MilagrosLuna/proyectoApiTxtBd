const URL_API : string = "http://localhost:9999/";

function ObtenerEliminar(dato:any) {

    let obj = dato.getAttribute("data-obj");

    let obj_dato = JSON.parse(obj);

    (<HTMLInputElement>document.getElementById("txtlegajo_e")).value = obj_dato.legajo;
}
function Limpiar(){

    (<HTMLInputElement>document.getElementById("txtlegajo")).value = "";
    (<HTMLInputElement>document.getElementById("txtnombre")).value = "";
    (<HTMLInputElement>document.getElementById("txtapellido")).value = "";


    (<HTMLInputElement>document.getElementById("txtlegajo_m")).value = "";
    (<HTMLInputElement>document.getElementById("txtnombre_m")).value = "";
    (<HTMLInputElement>document.getElementById("txtapellido_m")).value = "";

    (<HTMLInputElement>document.getElementById("txtlegajo_e")).value = "";

}
function LimpiarFoto(){

    Limpiar();
    
    (<HTMLInputElement> document.getElementById("foto")).value = "";
    
    (<HTMLImageElement>document.getElementById("imgFoto_m")).src = "";
    (<HTMLInputElement> document.getElementById("foto_m")).value = "";
}
window.addEventListener("load", ()=>{

    let btnTraer = <HTMLButtonElement>document.getElementById("btnTraer");
    let btnAgregar = <HTMLInputElement>document.getElementById("btnAgregar");
    let btnModificar = <HTMLInputElement>document.getElementById("btnModificar");
    let btnEliminar = <HTMLButtonElement>document.getElementById("btnEliminar");

    btnTraer.addEventListener("click", TraerListadoProductoFoto);
    btnAgregar.addEventListener("click", AgregarProductoArchivo);
    btnModificar.addEventListener("click", ModificarProductoFoto);
    btnEliminar.addEventListener("click", EliminarProductoArchivo);
});

function TraerListadoProductoFoto() {
    
    let xhttp : XMLHttpRequest = new XMLHttpRequest();

    xhttp.open("GET", URL_API + "alumnos", true);

    //ENVIO DE LA PETICION
    xhttp.send();

    //FUNCION CALLBACK
    xhttp.onreadystatechange = () => {
        
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            let prod_string_array = JSON.parse(xhttp.responseText);
            let prod_obj_array: any[] = [];

            prod_string_array.forEach((obj_str: string) => {
                if (obj_str !== "") {
                    prod_obj_array.push(JSON.parse(obj_str));
                }
            });

            let div = <HTMLDivElement>document.getElementById("divListado");

            let tabla = `<table>
                            <tr>
                                <th>legajo</th><th>nombre</th><th>apellido</th><th>FOTO</th><th>ACCIÓN</th>
                            </tr>`;
            for (let index = 0; index < prod_obj_array.length; index++) {
                const dato = prod_obj_array[index];
                tabla += `<tr><td>${dato.legajo}</td><td>${dato.nombre}</td><td>${dato.apellido}</td>
                            <td><img src="${URL_API}${dato.path}" width="50px" hight="50px"></td>
                            <td><input type="button" id="" data-obj='${JSON.stringify(dato)}' 
                                value="Seleccionar" name="btnSeleccionar"></td></tr>`;
            }  
            
            tabla += `</table>`;

            div.innerHTML = tabla;

            AsignarManejadoresSeleccionProductoFoto();

            LimpiarFoto();
        }
    };
}

function AsignarManejadoresSeleccionProductoFoto(){

    document.getElementsByName("btnSeleccionar").forEach((elemento)=>{

        elemento.addEventListener("click", ()=>{ ObtenerModificarProductoFoto(elemento)});
        elemento.addEventListener("click", ()=>{ ObtenerEliminar(elemento)});
    });
}

function AgregarProductoArchivo() {
    
    let legajo:number = parseInt((<HTMLInputElement>document.getElementById("txtlegajo")).value);
    let nombre:string = (<HTMLInputElement>document.getElementById("txtnombre")).value;
    let apellido:string = (<HTMLInputElement>document.getElementById("txtapellido")).value;
    let foto : any = (<HTMLInputElement> document.getElementById("foto"));
    let data = {
        legajo : legajo,
        nombre : nombre,
        apellido : apellido
    };
    let xhttp : XMLHttpRequest = new XMLHttpRequest();   
    let form : FormData = new FormData();
    form.append('foto', foto.files[0]);
    form.append('obj',JSON.stringify(data)); 
    xhttp.open("POST", URL_API + "alumnos", true);    
    console.log(JSON.stringify(data)); 
    xhttp.setRequestHeader("enctype", "multipart/form-data");  
    xhttp.send(form);

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            let mensaje : string = xhttp.responseText;

            alert(mensaje);

           TraerListadoProductoFoto();
        }
    };
}

function ObtenerModificarProductoFoto(dato:any) {

    let obj = dato.getAttribute("data-obj");
    console.log(obj);
    console.log(JSON.parse(obj));
    let obj_dato = JSON.parse(obj);

    (<HTMLInputElement>document.getElementById("txtlegajo_m")).value = obj_dato.legajo;
    (<HTMLInputElement>document.getElementById("txtnombre_m")).value = obj_dato.nombre;
    (<HTMLInputElement>document.getElementById("txtapellido_m")).value = obj_dato.apellido;       
    (<HTMLImageElement>document.getElementById("imgFoto_m")).src = URL_API + obj_dato.path;
}

function ModificarProductoFoto(){

    let legajo:number = parseInt((<HTMLInputElement>document.getElementById("txtlegajo_m")).value);
    let nombre:string = (<HTMLInputElement>document.getElementById("txtnombre_m")).value;
    let apellido:string = (<HTMLInputElement>document.getElementById("txtapellido_m")).value;    
    let foto : any = (<HTMLInputElement> document.getElementById("foto_m"));

    let data = {
        "legajo" : legajo,
        "nombre" : nombre,
        "apellido" : apellido
    };

    let form : FormData = new FormData();
    form.append('foto', foto.files[0]);
    form.append('obj', JSON.stringify(data));

    let xhttp : XMLHttpRequest = new XMLHttpRequest();

    xhttp.open("POST", URL_API + "alumnos/modificar", true);
	
    xhttp.setRequestHeader("enctype", "multipart/form-data");
    
    xhttp.send(form);

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            let mensaje : string = xhttp.responseText;

            alert(mensaje);

            TraerListadoProductoFoto();
        }
    };
}

function EliminarProductoArchivo(){

    let legajo:number = parseInt((<HTMLInputElement>document.getElementById("txtlegajo_e")).value);

    let data = {
        "legajo" : legajo,
    };

    let xhttp : XMLHttpRequest = new XMLHttpRequest();

    xhttp.open("POST", URL_API + "alumnos/eliminar", true);
	
    xhttp.setRequestHeader("content-type","application/json");
    
    xhttp.send(JSON.stringify(data));

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            let mensaje : string = xhttp.responseText;

            alert(mensaje);

            TraerListadoProductoFoto();
        }
    };
}