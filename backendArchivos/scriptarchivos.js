"use strict";
const URL_API = "http://localhost:9999/";
function ObtenerEliminar(dato) {
    let obj = dato.getAttribute("data-obj");
    let obj_dato = JSON.parse(obj);
    document.getElementById("txtlegajo_e").value = obj_dato.legajo;
}
function Limpiar() {
    document.getElementById("txtlegajo").value = "";
    document.getElementById("txtnombre").value = "";
    document.getElementById("txtapellido").value = "";
    document.getElementById("txtlegajo_m").value = "";
    document.getElementById("txtnombre_m").value = "";
    document.getElementById("txtapellido_m").value = "";
    document.getElementById("txtlegajo_e").value = "";
}
function LimpiarFoto() {
    Limpiar();
    document.getElementById("foto").value = "";
    document.getElementById("imgFoto_m").src = "";
    document.getElementById("foto_m").value = "";
}
window.addEventListener("load", () => {
    let btnTraer = document.getElementById("btnTraer");
    let btnAgregar = document.getElementById("btnAgregar");
    let btnModificar = document.getElementById("btnModificar");
    let btnEliminar = document.getElementById("btnEliminar");
    btnTraer.addEventListener("click", TraerListadoProductoFoto);
    btnAgregar.addEventListener("click", AgregarProductoArchivo);
    btnModificar.addEventListener("click", ModificarProductoFoto);
    btnEliminar.addEventListener("click", EliminarProductoArchivo);
});
function TraerListadoProductoFoto() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", URL_API + "alumnos", true);
    xhttp.send();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let prod_string_array = JSON.parse(xhttp.responseText);
            let prod_obj_array = [];
            prod_string_array.forEach((obj_str) => {
                if (obj_str !== "") {
                    prod_obj_array.push(JSON.parse(obj_str));
                }
            });
            let div = document.getElementById("divListado");
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
function AsignarManejadoresSeleccionProductoFoto() {
    document.getElementsByName("btnSeleccionar").forEach((elemento) => {
        elemento.addEventListener("click", () => { ObtenerModificarProductoFoto(elemento); });
        elemento.addEventListener("click", () => { ObtenerEliminar(elemento); });
    });
}
function AgregarProductoArchivo() {
    let legajo = parseInt(document.getElementById("txtlegajo").value);
    let nombre = document.getElementById("txtnombre").value;
    let apellido = document.getElementById("txtapellido").value;
    let foto = document.getElementById("foto");
    let data = {
        legajo: legajo,
        nombre: nombre,
        apellido: apellido
    };
    let xhttp = new XMLHttpRequest();
    let form = new FormData();
    form.append('foto', foto.files[0]);
    form.append('obj', JSON.stringify(data));
    xhttp.open("POST", URL_API + "alumnos", true);
    console.log(JSON.stringify(data));
    xhttp.setRequestHeader("enctype", "multipart/form-data");
    xhttp.send(form);
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let mensaje = xhttp.responseText;
            alert(mensaje);
            TraerListadoProductoFoto();
        }
    };
}
function ObtenerModificarProductoFoto(dato) {
    let obj = dato.getAttribute("data-obj");
    let obj_dato = JSON.parse(obj);
    document.getElementById("txtlegajo_m").value = obj_dato.legajo;
    document.getElementById("txtnombre_m").value = obj_dato.nombre;
    document.getElementById("txtapellido_m").value = obj_dato.apellido;
    document.getElementById("imgFoto_m").src = URL_API + obj_dato.path;
}
function ModificarProductoFoto() {
    let legajo = parseInt(document.getElementById("txtlegajo_m").value);
    let nombre = document.getElementById("txtnombre_m").value;
    let apellido = document.getElementById("txtapellido_m").value;
    let foto = document.getElementById("foto_m");
    let data = {
        "legajo": legajo,
        "nombre": nombre,
        "apellido": apellido
    };
    let form = new FormData();
    form.append('foto', foto.files[0]);
    form.append('obj', JSON.stringify(data));
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", URL_API + "alumnos/modificar", true);
    xhttp.setRequestHeader("enctype", "multipart/form-data");
    xhttp.send(form);
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let mensaje = xhttp.responseText;
            alert(mensaje);
            TraerListadoProductoFoto();
        }
    };
}
function EliminarProductoArchivo() {
    let legajo = parseInt(document.getElementById("txtlegajo_e").value);
    let data = {
        "legajo": legajo,
    };
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", URL_API + "alumnos/eliminar", true);
    xhttp.setRequestHeader("content-type", "application/json");
    xhttp.send(JSON.stringify(data));
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let mensaje = xhttp.responseText;
            alert(mensaje);
            TraerListadoProductoFoto();
        }
    };
}
//# sourceMappingURL=scriptarchivos.js.map