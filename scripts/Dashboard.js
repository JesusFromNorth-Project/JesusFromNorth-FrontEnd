// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1";
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;

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

		// Resaltar el enlace activo según la página actual
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

// 4. Funciones Asíncronas
async function cargarCitas(pagina = 0) {
    try {
        const response = await fetch(`${APPOINTMENTS_URL}/?page=${pagina}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al cargar las citas');
        }

        const data = await response.json();
        if (data.status !== 200) {
            throw new Error(data.message || 'Error al cargar las citas');
        }

        actualizarTablaCitas(data.data);
    } catch (error) {
        console.error("Error al cargar citas:", error);
        mostrarError(error.message);
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function actualizarTablaCitas(citas) {
    const tbody = document.getElementById("appointmentsTableBody");
    if (!tbody) {
        console.error("No se encontró el elemento tbody para la tabla de citas");
        return;
    }

    if (!citas || citas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No hay citas programadas.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = citas
        .map((cita, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${formatearFecha(cita.appointmentDate)}</td>
                <td>${cita.patient?.dni || ''}</td>
                <td>${cita.patient?.fullName || ''}</td>
                <td>${cita.specialty?.name || ''}</td>
                <td>${cita.doctor?.fullName || ''}</td>
                <td>${cita.description || 'Sin descripción'}</td>
                <td>
                    <button class="btn btn-success btn-sm me-1" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalAtencion" 
                            data-id="${cita.id}">
                        <i class="fa fa-notes-medical"></i> Realizar Atención
                    </button>
                </td>
            </tr>
        `).join('');
}

// 5. Eventos DOM
document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAutenticacion()) {
        return;
    }

    await cargarSidebar();
    await cargarCitas(0);
});

// 6. Funciones Globales
window.cargarCitas = cargarCitas;
