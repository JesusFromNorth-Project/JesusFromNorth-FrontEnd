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

// 4. Funciones Asíncronas

// 4.1 Funciones de API

// Variable para almacenar el ID de la cita en edición
let citaEditandoId = null;

/**
 * Obtiene los datos de una cita por su ID
 * @param {string} id - ID de la cita
 * @returns {Promise<Object>} Datos de la cita
 */
async function obtenerCitaPorId(id) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al obtener la cita");
		}

		const result = await response.json();
		return result.data;
	} catch (error) {
		console.error("Error en obtenerCitaPorId:", error);
		throw error;
	}
}

/**
 * Actualiza una cita existente
 * @param {string} id - ID de la cita
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function actualizarCita(id, data) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeaders(),
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al actualizar la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en actualizarCita:", error);
		throw error;
	}
}

// 4.1 Funciones de API

async function crearCita(appointmentData) {
	try {
		const response = await fetch(APPOINTMENTS_URL, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(appointmentData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al crear la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en crearCita:", error);
		throw error;
	}
}

/**
 * Busca un paciente por DNI
 * @param {string} dni - DNI del paciente
 * @returns {Promise<Object>} Datos del paciente
 */
async function buscarPacientePorDNI(dni) {
	try {
		const response = await fetch(`${PATIENT_URL}?dni=${encodeURIComponent(dni)}`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Paciente no encontrado");
		}

		const result = await response.json();
		return result.data; // Retorna solo los datos del paciente
	} catch (error) {
		console.error("Error en buscarPacientePorDNI:", error);
		throw error;
	}
}

async function obtenerDoctores(page = 0) {
	try {
		const response = await fetch(`${DOCTOR_URL}list?page=${page}`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al obtener la lista de doctores");
		}

		const result = await response.json();
		return result.data; // Retorna solo la lista de doctores
	} catch (error) {
		console.error("Error en obtenerDoctores:", error);
		throw error;
	}
}

async function obtenerCitas(page = 0) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}?page=${page}`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al obtener las citas");
		}

		const result = await response.json();
		return result.data || [];
	} catch (error) {
		console.error("Error en obtenerCitas:", error);
		throw error;
	}
}

// 4.2 Funciones de UI

/**
 * Habilita el modo edición para una cita
 * @param {string} id - ID de la cita a editar
 */
async function habilitarModoEdicion(id) {
	try {
		// Obtener datos de la cita
		const cita = await obtenerCitaPorId(id);
		citaEditandoId = id;

		// Rellenar formulario con datos de la cita
		document.getElementById("fechaAtencion").value = cita.date_attention.slice(0, 16);
		document.getElementById("descripcion").value = cita.description || "";

		// Establecer el doctor seleccionado y deshabilitar el select
		const selectDoctor = document.getElementById("selectDoctor");
		if (cita.doctor?.id_doctor) {
			selectDoctor.value = cita.doctor.id_doctor;
		}
		selectDoctor.disabled = true;

		// Mostrar datos de solo lectura
		document.getElementById("dniPaciente").value = cita.patient?.dni || "";
		document.getElementById("nombrePaciente").value = `${cita.patient?.first_name || ""} ${
			cita.patient?.last_name || ""
		}`.trim();

		// Deshabilitar campos que no se pueden editar
		document.getElementById("dniPaciente").disabled = true;
		document.getElementById("btnBuscarPaciente").disabled = true;
		// No deshabilitar el selectDoctor para permitir cambiar el doctor si es necesario
		// document.getElementById("selectDoctor").disabled = true;

		// Cambiar botones
		document.getElementById("btnGuardar").classList.add("d-none");
		document.getElementById("btnActualizar").classList.remove("d-none");
		document.getElementById("btnCancelarEdicion").classList.remove("d-none");

		// Desplazarse al formulario
		document.getElementById("formCita").scrollIntoView({ behavior: "smooth" });
	} catch (error) {
		console.error("Error al habilitar modo edición:", error);
		mostrarError("Error al cargar los datos de la cita");
	}
}

/**
 * Deshabilita el modo edición y restaura el formulario
 */
function deshabilitarModoEdicion() {
	citaEditandoId = null;

	// Restaurar campos
	document.getElementById("formCita").reset();
	document.getElementById("dniPaciente").disabled = false;
	document.getElementById("btnBuscarPaciente").disabled = false;
	document.getElementById("selectDoctor").disabled = false;
	document.getElementById("idPaciente").value = "";
	document.getElementById("nombrePaciente").value = "";

	// Restaurar botones
	document.getElementById("btnGuardar").classList.remove("d-none");
	document.getElementById("btnActualizar").classList.add("d-none");
	document.getElementById("btnCancelarEdicion").classList.add("d-none");
}

/**
 * Maneja la actualización de una cita
 * @param {Event} event - Evento del formulario
 */
async function manejarActualizacionCita(event) {
	event.preventDefault();

	try {
		// Validar que haya una cita en edición
		if (!citaEditandoId) {
			throw new Error("No hay una cita en edición");
		}

		// Obtener datos del formulario
		const formData = new FormData(event.target);
		const fechaAtencion = formData.get("responseDTO.date_attention");
		const fechaAtencionISO = new Date(fechaAtencion).toISOString();

		const data = {
			date_appointment: fechaAtencionISO,
			date_attention: fechaAtencionISO,
			description: formData.get("responseDTO.description"),
		};

		// Enviar actualización
		await actualizarCita(citaEditandoId, data);

		// Actualizar interfaz
		mostrarExito("Cita actualizada correctamente");
		await cargarCitas();
		deshabilitarModoEdicion();
	} catch (error) {
		console.error("Error al actualizar la cita:", error);
		mostrarError(error.message || "Error al actualizar la cita");
	}
}

// 4.2 Funciones de UI

function actualizarTablaCitas(citas) {
	const tbody = document.getElementById("appointmentsTableBody");
	if (!tbody) return;

	tbody.innerHTML = ""; // Limpiar tabla

	if (citas.length === 0) {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td colspan="8" class="text-center">No hay citas registradas</td>
        `;
		tbody.appendChild(tr);
		return;
	}

	citas.forEach((cita, index) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(cita.date_attention).toLocaleString()}</td>
            <td>${cita.patient?.dni || "N/A"}</td>
            <td>${cita.patient?.first_name || "N/A"} ${cita.patient?.last_name || ""}</td>
            <td>${cita.doctor?.specialty?.specialty_name || "N/A"}</td>
            <td>${cita.doctor?.first_name || "N/A"} ${cita.doctor?.last_name || ""}</td>
            <td>${cita.description || "Sin descripción"}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-1" onclick="habilitarModoEdicion('${cita.id_appointment}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-success me-1" onclick="generarBoleta('${cita.id_appointment}')" title="Generar Boleta">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCita('${cita.id_appointment}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
		tbody.appendChild(tr);
	});
}

/**
 * Elimina una cita después de confirmación del usuario
 * @param {string} id - ID de la cita a eliminar
 */
async function eliminarCita(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar la cita');
        }

        const result = await response.json();
        mostrarExito('Cita eliminada correctamente');
        await cargarCitas(); // Recargar la lista de citas
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        mostrarError(error.message || 'Error al eliminar la cita');
    }
}

/**
 * Genera una boleta en PDF para una cita específica
 * @param {string} id - ID de la cita
 */
async function generarBoleta(id) {
    try {
        // Abrir en una nueva pestaña
        const url = `${APPOINTMENTS_URL}invoice/${id}`;
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al generar la boleta');
        }

        // Crear un blob del PDF y abrirlo en una nueva pestaña
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        
        // Limpiar el objeto URL después de abrir el PDF
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
    } catch (error) {
        console.error('Error al generar la boleta:', error);
        mostrarError(error.message || 'Error al generar la boleta');
    }
}

// Hacer las funciones accesibles globalmente
window.habilitarModoEdicion = habilitarModoEdicion;
window.eliminarCita = eliminarCita;
window.generarBoleta = generarBoleta;

async function cargarCitas() {
	try {
		const citas = await obtenerCitas(0);
		actualizarTablaCitas(citas);
	} catch (error) {
		console.error("Error al cargar citas:", error);
		mostrarError("Error al cargar la lista de citas");
	}
}

async function manejarEnvioCita(event) {
	event.preventDefault();

	try {
		// Validar que se haya seleccionado un paciente
		const idPaciente = document.getElementById("idPaciente").value;
		if (!idPaciente) {
			mostrarError("Por favor, busque y seleccione un paciente primero");
			return;
		}

		// Validar que se haya seleccionado un doctor
		const selectDoctor = document.getElementById("selectDoctor");
		const idDoctor = selectDoctor.value;
		if (!idDoctor) {
			mostrarError("Por favor, seleccione un doctor");
			return;
		}

		// Obtener datos del formulario
		const formData = new FormData(event.target);

		// Formatear fechas correctamente
		const fechaAtencion = formData.get("responseDTO.date_attention");
		const fechaAtencionISO = new Date(fechaAtencion).toISOString();

		const appointmentData = {
			id_admin: localStorage.getItem("adminId"),
			id_doctor: idDoctor,
			dni_patient: idPaciente,
			responseDTO: {
				date_appointment: fechaAtencionISO,
				date_attention: fechaAtencionISO,
				description: formData.get("responseDTO.description"),
			},
		};

		// Crear la cita
		const resultado = await crearCita(appointmentData);
		mostrarExito("Cita creada exitosamente");

		// Limpiar el formulario
		event.target.reset();
		document.getElementById("idPaciente").value = "";
		document.getElementById("nombrePaciente").value = "";

		// Actualizar la tabla de citas
		await cargarCitas();
	} catch (error) {
		mostrarError(error.message || "Error al crear la cita");
	}
}

async function buscarPaciente() {
	const dni = document.getElementById("dniPaciente").value.trim();
	if (!dni) {
		mostrarError("Por favor ingrese un DNI");
		return;
	}

	try {
		const paciente = await buscarPacientePorDNI(dni);
		document.getElementById("idPaciente").value = paciente.dni;
		document.getElementById("nombrePaciente").value = `${paciente.first_name} ${paciente.last_name}`;
		mostrarExito("Paciente encontrado");
	} catch (error) {
		mostrarError(error.message || "Error al buscar el paciente");
		document.getElementById("idPaciente").value = "";
		document.getElementById("nombrePaciente").value = "";
	}
}

async function cargarDoctores() {
	try {
		const selectDoctor = document.getElementById("selectDoctor");
		selectDoctor.innerHTML = '<option value="">Cargando doctores...</option>';

		const doctores = await obtenerDoctores(0); // Página 0 por defecto

		selectDoctor.innerHTML = '<option value="">Seleccione un doctor</option>';
		doctores.forEach((doctor) => {
			const option = document.createElement("option");
			option.value = doctor.id_doctor; // <-- Aquí estaba el error
			option.textContent = `${doctor.first_name} ${doctor.last_name} - ${
				doctor.specialty?.specialty_name || "Sin especialidad"
			}`;
			selectDoctor.appendChild(option);
		});
	} catch (error) {
		console.error("Error al cargar doctores:", error);
		mostrarError("Error al cargar la lista de doctores");
	}
}

// 4.3 Funciones de inicialización
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
		// Cargar la barra lateral
		await cargarSidebar();

		// Cargar la lista de doctores
		await cargarDoctores();

		// Configurar manejadores de eventos
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

		// Cargar citas existentes
		await cargarCitas();
	} catch (error) {
		console.error("Error al inicializar la página:", error);
		mostrarError("Error al cargar los datos iniciales");
	}
}

// 5. Eventos DOM

document.addEventListener("DOMContentLoaded", inicializarPagina);

// 6. Funciones Globales
