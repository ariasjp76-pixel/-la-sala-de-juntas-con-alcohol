/Copyright 2025 Juan Pablo Arias Cruz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License./ ======================================================
// BASE DE DATOS LOCAL
// ======================================================
let empleados = JSON.parse(localStorage.getItem('empleados')) || [];
let notificaciones = JSON.parse(localStorage.getItem('notificaciones')) || [];
let usuarioLogueado = null;

// ======================================================
// GUARDAR CAMBIOS
// ======================================================
function guardarDatos() {
    localStorage.setItem('empleados', JSON.stringify(empleados));
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
}

// ======================================================
// CAMBIO DE VISTAS
// ======================================================
function mostrarVista(id) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.getElementById(id).classList.add('activa');

    // Cargar contenido dinámico según la vista
    if (id === "notificaciones") {
        cargarNotificaciones();
    }

    if (id === "baja") {
        cargarBajas();
    }

    if (id === "horas") {
        cargarHoras();
    }

    if (id === "nomina") {
        cargarNomina();
    }
}

// ======================================================
// LOGIN ÚNICO
// ======================================================
function loginUnico() {
    const user = document.getElementById('login-usuario').value.trim();
    const pass = document.getElementById('login-password-general').value.trim();

    // ADMIN
    if (user === "admin" && pass === "1234") {
        usuarioLogueado = { rol: "admin" };
        mostrarVista("admin");
        return;
    }

    // EMPLEADO
    const empleado = empleados.find(e => e.numero === user && e.password === pass && e.activo !== false);

    if (empleado) {
        usuarioLogueado = empleado;
        cargarDatosEmpleado();
        mostrarVista("empleado");
        return;
    }

    alert("Usuario o contraseña incorrectos.");
}

// ======================================================
// CERRAR SESIÓN
// ======================================================
function cerrarSesion() {
    usuarioLogueado = null;
    mostrarVista("inicio");
}

// ======================================================
// PANEL EMPLEADO
// ======================================================
function cargarDatosEmpleado() {
    document.getElementById("emp-nombre").innerText = usuarioLogueado.nombre;
    document.getElementById("emp-numero").innerText = usuarioLogueado.numero;
    document.getElementById("emp-correo").innerText = usuarioLogueado.correo || "—";
    document.getElementById("emp-contacto").innerText = usuarioLogueado.contacto || "—";
    document.getElementById("emp-ingreso").innerText = usuarioLogueado.ingreso || "—";
}

// ======================================================
// REGISTRO DE ENTRADA Y SALIDA
// ======================================================
function registrarEntrada() {
    const hoy = new Date().toLocaleString();
    usuarioLogueado.entrada = Date.now();
    alert("Entrada registrada: " + hoy);
    guardarDatos();
}

function registrarSalida() {
    if (!usuarioLogueado.entrada) {
        alert("No tienes una entrada registrada.");
        return;
    }

    const salida = Date.now();
    const horas = ((salida - usuarioLogueado.entrada) / 3600000).toFixed(2);

    usuarioLogueado.horas = (usuarioLogueado.horas || 0) + parseFloat(horas);
    usuarioLogueado.entrada = null;

    alert("Salida registrada. Horas trabajadas hoy: " + horas);

    guardarDatos();
}

// ======================================================
// HORAS TRABAJADAS
// ======================================================
function cargarHoras() {
    document.getElementById("horas-hoy").innerText = usuarioLogueado.entrada ? "En curso" : "0";
    document.getElementById("horas-semana").innerText = usuarioLogueado.horas || 0;
    document.getElementById("horas-mes").innerText = usuarioLogueado.horas || 0;
}

// ======================================================
// NÓMINA
// ======================================================
function cargarNomina() {
    const tarifa = 50; // sueldo por hora
    const horas = usuarioLogueado.horas || 0;
    const total = horas * tarifa;

    document.getElementById("nomina-horas").innerText = horas;
    document.getElementById("nomina-tarifa").innerText = tarifa;
    document.getElementById("nomina-total").innerText = total;
}

// ======================================================
// SERVICIOS: PERMISOS
// ======================================================
function solicitarPermiso(tipo) {
    let mensaje = `${usuarioLogueado.nombre} solicita permiso por: ${tipo}`;

    if (tipo === "Defunción") {
        alert("⚠ PERMISO URGENTE: Se notificará al administrador y se autorizarán $7,000 MXN.");
        notificaciones.push({
            tipo,
            mensaje,
            urgente: true,
            monto: 7000
        });
    } else {
        notificaciones.push({
            tipo,
            mensaje,
            urgente: false
        });
    }

    guardarDatos();
    alert("Solicitud enviada.");
}

// ======================================================
// SERVICIOS: VACACIONES
// ======================================================
function solicitarVacaciones() {
    const mensaje = `${usuarioLogueado.nombre} solicita vacaciones.`;
    notificaciones.push({ tipo: "Vacaciones", mensaje });
    guardarDatos();
    alert("Solicitud enviada.");
}

// ======================================================
// SERVICIOS: RH
// ======================================================
function enviarRH() {
    const texto = document.getElementById("mensaje-rh").value.trim();
    if (!texto) return alert("Escribe tu mensaje.");

    notificaciones.push({
        tipo: "RH",
        mensaje: `${usuarioLogueado.nombre} envió a RH: ${texto}`
    });

    document.getElementById("mensaje-rh").value = "";
    guardarDatos();
    alert("Mensaje enviado.");
}

// ======================================================
// PANEL ADMIN: ALTA DE EMPLEADO
// ======================================================
function darDeAltaEmpleado() {
    const nombre = document.getElementById("nuevo-nombre").value.trim();
    const numero = document.getElementById("nuevo-numero").value.trim();
    const correo = document.getElementById("nuevo-correo").value.trim();
    const contacto = document.getElementById("nuevo-contacto").value.trim();
    const ingreso = document.getElementById("nuevo-ingreso").value.trim();
    const password = document.getElementById("nuevo-password").value.trim();

    if (!nombre || !numero || !password) {
        alert("Faltan datos obligatorios.");
        return;
    }

    empleados.push({
        nombre,
        numero,
        correo,
        contacto,
        ingreso,
        password,
        activo: true,
        horas: 0
    });

    guardarDatos();
    alert("Empleado registrado.");
}

// ======================================================
// PANEL ADMIN: BAJA DE EMPLEADO
// ======================================================
function cargarBajas() {
    const cont = document.getElementById("lista-baja");
    cont.innerHTML = "";

    empleados.forEach(emp => {
        const div = document.createElement("div");
        div.className = "user-card";
        div.innerHTML = `
            <p>${emp.nombre} (${emp.numero})</p>
            <button class="btn cancelar" onclick="inactivarEmpleado('${emp.numero}')">Inactivar</button>
        `;
        cont.appendChild(div);
    });
}

function inactivarEmpleado(num) {
    const emp = empleados.find(e => e.numero === num);
    emp.activo = false;
    guardarDatos();
    alert("Empleado inactivado.");
    cargarBajas();
}

// ======================================================
// PANEL ADMIN: NOTIFICACIONES
// ======================================================
function cargarNotificaciones() {
    const cont = document.getElementById("lista-notificaciones");
    cont.innerHTML = "";

    notificaciones.forEach((n, i) => {
        const div = document.createElement("div");
        div.className = "user-card";

        div.innerHTML = `
            <p>${n.mensaje}</p>
            ${n.urgente ? `<p style="color:red;"><strong>URGENTE — Depositar $7,000 MXN</strong></p>` : ""}
            <button class="btn" onclick="aprobarNotificacion(${i})">Aprobar</button>
            <button class="btn cancelar" onclick="rechazarNotificacion(${i})">Rechazar</button>
        `;

        cont.appendChild(div);
    });
}

function aprobarNotificacion(i) {
    alert("Solicitud aprobada.");
    notificaciones.splice(i, 1);
    guardarDatos();
    cargarNotificaciones();
}

function rechazarNotificacion(i) {
    alert("Solicitud rechazada.");
    notificaciones.splice(i, 1);
    guardarDatos();
    cargarNotificaciones();

}
