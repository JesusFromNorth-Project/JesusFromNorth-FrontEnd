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
		await mostrarInfoDoctor();
		await cargarTablaAtenciones();
		
		// Configurar eventos de búsqueda
		const btnBuscar = document.querySelector('button i.fa-search')?.parentElement;
		const btnMostrarTodos = document.querySelector('button i.fa-list')?.parentElement;
		const inputBusqueda = document.querySelector('input[placeholder="Ingrese DNI del paciente"]');
		
		if (btnBuscar) {
			btnBuscar.addEventListener("click", buscarAtenciones);
		}
		
		if (btnMostrarTodos) {
			btnMostrarTodos.addEventListener("click", cargarTablaAtenciones);
		}
		
		if (inputBusqueda) {
			inputBusqueda.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
					buscarAtenciones();
				}
			});
		}
		
	} catch (error) {
		mostrarError("Error al cargar los datos iniciales");
	}
}

// Mostrar información del doctor en la interfaz
async function mostrarInfoDoctor() {
	const role = localStorage.getItem("role");
	const userName = localStorage.getItem("userName");
	
	if (role === "DOCTOR" && userName) {
		const tituloElement = document.querySelector("h2");
		if (tituloElement) {
			const infoDoctor = document.createElement("p");
			infoDoctor.className = "text-muted mb-3";
			infoDoctor.innerHTML = `<i class="fa fa-user-md"></i> Atenciones del Dr. ${userName}`;
			tituloElement.insertAdjacentElement("afterend", infoDoctor);
		}
	}
}

// 4.2 Funciones de API para Atenciones

// Obtener todas las atenciones del doctor autenticado
async function obtenerAtenciones() {
	try {
		const doctorId = localStorage.getItem("userId");
		const role = localStorage.getItem("role");
		
		let url = APPOINTMENTS_URL;
		
		// Si es doctor, filtrar por sus atenciones
		if (role === "DOCTOR" && doctorId) {
			url = `${APPOINTMENTS_URL}doctor/${doctorId}`;
		}
		// Si es admin, mostrar todas las atenciones
		
		const response = await fetch(url, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const atenciones = await response.json();
		return atenciones;
	} catch (error) {
		console.error("Error al obtener atenciones:", error);
		mostrarError("Error al cargar las atenciones");
		return [];
	}
}

// Obtener una atención por ID
async function obtenerAtencionPorId(id) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error al obtener atención:", error);
		mostrarError("Error al cargar la atención");
		return null;
	}
}

// Crear nueva atención
async function crearAtencion(atencionData) {
	try {
		const doctorId = localStorage.getItem("userId");
		const role = localStorage.getItem("role");
		
		// Si es doctor, asociar automáticamente la atención al doctor
		if (role === "DOCTOR" && doctorId) {
			atencionData.doctorId = doctorId;
		}
		
		const response = await fetch(APPOINTMENTS_URL, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(atencionData),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const nuevaAtencion = await response.json();
		mostrarExito("Atención creada exitosamente");
		return nuevaAtencion;
	} catch (error) {
		console.error("Error al crear atención:", error);
		mostrarError("Error al crear la atención");
		return null;
	}
}

// Actualizar atención existente
async function actualizarAtencion(id, atencionData) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(atencionData),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const atencionActualizada = await response.json();
		mostrarExito("Atención actualizada exitosamente");
		return atencionActualizada;
	} catch (error) {
		console.error("Error al actualizar atención:", error);
		mostrarError("Error al actualizar la atención");
		return null;
	}
}

// Eliminar atención
async function eliminarAtencion(id) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}${id}`, {
			method: "DELETE",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		mostrarExito("Atención eliminada exitosamente");
		return true;
	} catch (error) {
		console.error("Error al eliminar atención:", error);
		mostrarError("Error al eliminar la atención");
		return false;
	}
}

// Buscar atenciones por DNI del paciente (del doctor autenticado)
async function buscarAtencionesPorDniPaciente(dni) {
	try {
		const doctorId = localStorage.getItem("userId");
		const role = localStorage.getItem("role");
		
		let url = `${APPOINTMENTS_URL}search?patientDni=${encodeURIComponent(dni)}`;
		
		// Si es doctor, agregar filtro por doctor
		if (role === "DOCTOR" && doctorId) {
			url += `&doctorId=${doctorId}`;
		}
		
		const response = await fetch(url, {
			method: "GET",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const atenciones = await response.json();
		return atenciones;
	} catch (error) {
		console.error("Error al buscar atenciones:", error);
		mostrarError("Error al buscar atenciones por DNI");
		return [];
	}
}

// 4.3 Funciones de interfaz de usuario

// Cargar y mostrar atenciones en la tabla
async function cargarTablaAtenciones() {
	const tbody = document.querySelector("table tbody");
	if (!tbody) return;

	try {
		// Mostrar loading
		tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fa fa-spinner fa-spin"></i> Cargando...</td></tr>';

		const atenciones = await obtenerAtenciones();
		
		if (atenciones.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay atenciones registradas</td></tr>';
			return;
		}

		tbody.innerHTML = atenciones.map((atencion, index) => `
			<tr>
				<td>${index + 1}</td>
				<td>${atencion.diagnosis || 'N/A'}</td>
				<td>${atencion.treatment || 'N/A'}</td>
				<td>${atencion.appointmentType || 'N/A'}</td>
				<td>${atencion.appointmentDateTime ? new Date(atencion.appointmentDateTime).toLocaleString('es-ES') : 'N/A'}</td>
				<td>${atencion.patient?.dni || 'N/A'}</td>
				<td>
					<button class="btn btn-info btn-sm me-1" onclick="verDetalleAtencion(${atencion.id})">
						<i class="fa fa-eye"></i> Ver Detalle
					</button>
					<button class="btn btn-warning btn-sm me-1" onclick="editarAtencion(${atencion.id})">
						<i class="fa fa-edit"></i> Editar
					</button>
					<button class="btn btn-danger btn-sm" onclick="confirmarEliminarAtencion(${atencion.id})">
						<i class="fa fa-trash"></i> Eliminar
					</button>
				</td>
			</tr>
		`).join('');
	} catch (error) {
		tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar las atenciones</td></tr>';
	}
}

// Confirmar eliminación de atención
function confirmarEliminarAtencion(id) {
	if (confirm('¿Está seguro de que desea eliminar esta atención?')) {
		eliminarAtencionYRefrescar(id);
	}
}

// Eliminar atención y refrescar tabla
async function eliminarAtencionYRefrescar(id) {
	const exito = await eliminarAtencion(id);
	if (exito) {
		await cargarTablaAtenciones();
	}
}

// Buscar atenciones por DNI del paciente
async function buscarAtenciones() {
	const dniInput = document.querySelector('input[placeholder="Ingrese DNI del paciente"]');
	if (!dniInput) return;

	const dni = dniInput.value.trim();
	
	if (!dni) {
		await cargarTablaAtenciones();
		return;
	}

	const tbody = document.querySelector("table tbody");
	if (!tbody) return;

	try {
		tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fa fa-spinner fa-spin"></i> Buscando...</td></tr>';
		
		const atenciones = await buscarAtencionesPorDniPaciente(dni);
		
		if (atenciones.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No se encontraron atenciones para ese DNI</td></tr>';
			return;
		}

		tbody.innerHTML = atenciones.map((atencion, index) => `
			<tr>
				<td>${index + 1}</td>
				<td>${atencion.diagnosis || 'N/A'}</td>
				<td>${atencion.treatment || 'N/A'}</td>
				<td>${atencion.appointmentType || 'N/A'}</td>
				<td>${atencion.appointmentDateTime ? new Date(atencion.appointmentDateTime).toLocaleString('es-ES') : 'N/A'}</td>
				<td>${atencion.patient?.dni || 'N/A'}</td>
				<td>
					<button class="btn btn-info btn-sm me-1" onclick="verDetalleAtencion(${atencion.id})">
						<i class="fa fa-eye"></i> Ver Detalle
					</button>
					<button class="btn btn-warning btn-sm me-1" onclick="editarAtencion(${atencion.id})">
						<i class="fa fa-edit"></i> Editar
					</button>
					<button class="btn btn-danger btn-sm" onclick="confirmarEliminarAtencion(${atencion.id})">
						<i class="fa fa-trash"></i> Eliminar
					</button>
				</td>
			</tr>
		`).join('');
	} catch (error) {
		tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al buscar atenciones</td></tr>';
	}
}

// Variables globales para edición
let atencionEditandoId = null;

// Editar atención (función placeholder)
function editarAtencion(id) {
	console.log('Editar atención:', id);
	atencionEditandoId = id;
	// Aquí podrías implementar un modal de edición o navegar a otra página
}

// Ver detalle de la atención
async function verDetalleAtencion(id) {
	try {
		const atencion = await obtenerAtencionPorId(id);
		if (!atencion) return;

		// Crear modal para mostrar el detalle
		const modalHtml = `
			<div class="modal fade" id="modalDetalleAtencion" tabindex="-1">
				<div class="modal-dialog modal-lg">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">
								<i class="fa fa-eye"></i> Detalle de la Atención
							</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body">
							<div class="row">
								<div class="col-md-6">
									<h6><i class="fa fa-notes-medical"></i> Información de la Atención</h6>
									<p><strong>Diagnóstico:</strong> ${atencion.diagnosis || 'N/A'}</p>
									<p><strong>Tratamiento:</strong> ${atencion.treatment || 'N/A'}</p>
									<p><strong>Tipo de Atención:</strong> ${atencion.appointmentType || 'N/A'}</p>
									<p><strong>Fecha y Hora:</strong> ${atencion.appointmentDateTime ? new Date(atencion.appointmentDateTime).toLocaleString('es-ES') : 'N/A'}</p>
								</div>
								<div class="col-md-6">
									<h6><i class="fa fa-user"></i> Información del Paciente</h6>
									<p><strong>Nombre:</strong> ${atencion.patient?.name || 'N/A'}</p>
									<p><strong>DNI:</strong> ${atencion.patient?.dni || 'N/A'}</p>
									<p><strong>Teléfono:</strong> ${atencion.patient?.phone || 'N/A'}</p>
									<p><strong>Email:</strong> ${atencion.patient?.email || 'N/A'}</p>
									
									<h6><i class="fa fa-user-md"></i> Información del Doctor</h6>
									<p><strong>Nombre:</strong> ${atencion.doctor?.name || 'N/A'}</p>
									<p><strong>Especialidad:</strong> ${atencion.doctor?.specialty || 'N/A'}</p>
								</div>
							</div>
							${atencion.notes ? `
								<div class="row mt-3">
									<div class="col-12">
										<h6><i class="fa fa-comment"></i> Notas Adicionales</h6>
										<p>${atencion.notes}</p>
									</div>
								</div>
							` : ''}
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
								<i class="fa fa-times"></i> Cerrar
							</button>
						</div>
					</div>
				</div>
			</div>
		`;

		// Remover modal anterior si existe
		const modalAnterior = document.getElementById('modalDetalleAtencion');
		if (modalAnterior) {
			modalAnterior.remove();
		}

		// Agregar modal al DOM
		document.body.insertAdjacentHTML('beforeend', modalHtml);

		// Mostrar modal
		const modal = new bootstrap.Modal(document.getElementById('modalDetalleAtencion'));
		modal.show();

	} catch (error) {
		console.error('Error al mostrar detalle:', error);
		mostrarError('Error al cargar el detalle de la atención');
	}
}

// 5. Eventos DOM

document.addEventListener("DOMContentLoaded", inicializarPagina);

// 6. Funciones Globales
window.editarAtencion = editarAtencion;
window.confirmarEliminarAtencion = confirmarEliminarAtencion;
window.verDetalleAtencion = verDetalleAtencion;
