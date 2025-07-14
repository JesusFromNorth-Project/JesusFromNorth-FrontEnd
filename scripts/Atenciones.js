// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const APPOINTMENTS_URL = "http://localhost:8080/system_clinic/api/v0.1/appointments/";
const DOCTOR_URL = "http://localhost:8080/system_clinic/api/v0.1/doctor/";
const PATIENT_URL = "http://localhost:8080/system_clinic/api/v0.1/patient/";

// 3. Funciones Síncronas
function mostrarMensaje(mensaje, tipo = "danger") {
	const alertDiv = document.createElement("div");
	alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
	alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
	document.querySelector(".main-content")?.insertAdjacentElement("afterbegin", alertDiv);
	setTimeout(() => alertDiv.remove(), 5000);
}

function mostrarExito(mensaje) {
	mostrarMensaje(mensaje, "success");
}

function mostrarError(mensaje) {
	mostrarMensaje(mensaje, "danger");
}

function getAuthHeaders() {
	const token = localStorage.getItem(AUTH_KEYS.TOKEN);
	if (!token) {
		console.error("No se encontró el token de autenticación");
		cerrarSesion();
		return {};
	}
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
	};
}

function cerrarSesion() {
	limpiarSesion();
	window.location.href = "Login.html";
}

// 4 Funciones Asíncronas

// 4.1 Funciones de inicialización
async function cargarSidebar() {
	try {
		const role = localStorage.getItem("role");
		let sideBarPath = role === "ADMIN" ? "../components/SidebarAdmin.html" : "../components/SidebarDoctor.html";

		const response = await fetch(sideBarPath);
		if (!response.ok) throw new Error("Error al cargar el sidebar");

		const html = await response.text();
		const sidebarElement = document.getElementById("sidebar-placeholder");
		if (!sidebarElement) {
			console.error('No se encontró el elemento con id "sidebar-placeholder"');
			return;
		}

		sidebarElement.innerHTML = html;

		const path = window.location.pathname.split("/").pop().toLowerCase();
		const links = document.querySelectorAll("#sidebar-placeholder a.nav-link");

		links.forEach((link) => {
			const href = link.getAttribute("href")?.toLowerCase();
			if (href && href.includes(path)) {
				link.classList.remove("text-dark");
				link.classList.add("text-primary");
			}
		});
	} catch (error) {
		console.error("Error al cargar sidebar:", error);
		mostrarError("Error al cargar la interfaz");
	}
}

async function inicializarPagina() {
	if (!verificarAutenticacion()) return;

	try {
		await cargarSidebar();
		const formCita = document.getElementById("formCita");
		if (formCita) {
			formCita.addEventListener("submit", (e) => {
				if (citaEditandoId) {
					manejarActualizacionCita(e);
				} else {
					manejarEnvioCita(e);
				}
			});
		}

		document.getElementById("btnBuscarPaciente")?.addEventListener("click", buscarPaciente);

		// Configurar botón de cancelar edición
		document.getElementById("btnCancelarEdicion")?.addEventListener("click", (e) => {
			e.preventDefault();
			deshabilitarModoEdicion();
		});

		// Configurar la fecha actual como valor por defecto
		const fechaActual = new Date();
		const fechaHoraLocal = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000)
			.toISOString()
			.slice(0, 16);
		document.querySelector('input[type="datetime-local"]')?.setAttribute("min", fechaHoraLocal);
	} catch (error) {
		mostrarError("Error al cargar los datos iniciales");
	}
}

// 5. Eventos DOM

document.addEventListener("DOMContentLoaded", inicializarPagina);

// 6. Funciones Globales
