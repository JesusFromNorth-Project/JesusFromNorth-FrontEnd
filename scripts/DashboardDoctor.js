// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const BASE_URL = "http://localhost:8080/system_clinic/api/v0.1";
const APPOINTMENTS_URL = `${BASE_URL}/appointments`;
const ATTENTION_URL = `${BASE_URL}/attention`;
const MEDICINE_URL = `${BASE_URL}/medicine`;

// 3. Funciones de Utilidad
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

// 4. Funciones de Interfaz
async function cargarSidebar() {
	try {
		const role = localStorage.getItem("role");
		const sideBarPath = role === "ADMIN" ? "../components/SidebarAdmin.html" : "../components/SidebarDoctor.html";

		const response = await fetch(sideBarPath);
		if (!response.ok) throw new Error("Error al cargar el sidebar");

		const html = await response.text();
		const sidebarElement = document.getElementById("sidebar-placeholder");
		if (!sidebarElement) {
			console.error('No se encontró el elemento con id "sidebar-placeholder"');
			return;
		}

		sidebarElement.innerHTML = html;
		resaltarEnlaceActivo();
	} catch (error) {
		console.error("Error al cargar sidebar:", error);
		mostrarError("Error al cargar la interfaz");
	}
}

function resaltarEnlaceActivo() {
	const path = window.location.pathname.split("/").pop().toLowerCase();
	const links = document.querySelectorAll("#sidebar-placeholder a.nav-link");

	links.forEach((link) => {
		const href = link.getAttribute("href")?.toLowerCase();
		if (href && href.includes(path)) {
			link.classList.remove("text-dark");
			link.classList.add("text-primary");
		}
	});
}

// 5. Variables Globales
let citaSeleccionada = null;
let medicamentos = []; // Lista de medicamentos en el formulario
let listaMedicamentosDisponibles = []; // Lista de medicamentos disponibles desde la API

// 6. Funciones de Citas
async function cargarCitasDoctor() {
	try {
		// Obtener el ID del doctor del localStorage usando las claves correctas
		const doctorId = localStorage.getItem(AUTH_KEYS.USER_ID);

		if (!doctorId) {
			throw new Error("No se encontró el ID del doctor. Por favor, inicia sesión nuevamente.");
		}
		console.log("Obteniendo citas para el doctor ID:", doctorId);

		// Obtener las citas del doctor
		const response = await fetch(`${APPOINTMENTS_URL}/doctor/${doctorId}?page=0`, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al cargar las citas");
		}

		const data = await response.json();
		console.log("Respuesta de citas:", data);

		if (data.data && Array.isArray(data.data)) {
			mostrarCitasEnTabla(data.data);
		} else {
			mostrarError("No se encontraron citas para mostrar");
		}
	} catch (error) {
		console.error("Error al cargar citas:", error);
		mostrarError(error.message || "Error al cargar las citas");
	}
}

function mostrarCitasEnTabla(citas) {
	const tbody = document.querySelector("#tablaCitas tbody");
	if (!tbody) return;

	tbody.innerHTML = ""; // Limpiar tabla

	if (citas.length === 0) {
		const tr = document.createElement("tr");
		tr.innerHTML = `
            <td colspan="8" class="text-center">No hay citas programadas</td>
        `;
		tbody.appendChild(tr);
		return;
	}

	citas.forEach((cita, index) => {
		const tr = document.createElement("tr");
		const pacienteNombre = cita.patient
			? `${cita.patient.first_name || ""} ${cita.patient.last_name || ""}`.trim()
			: "N/A";
		const doctorNombre = cita.doctor ? `${cita.doctor.first_name || ""} ${cita.doctor.last_name || ""}`.trim() : "N/A";

		tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatearFechaHora(cita.date_attention)}</td>
            <td>${cita.patient?.dni || "N/A"}</td>
            <td>${pacienteNombre || "N/A"}</td>
            <td>${cita.description || "N/A"}</td>
            <td>${doctorNombre}</td>
            <td>${cita.date_appointment ? new Date(cita.date_appointment).toLocaleString() : "N/A"}</td>
            <td>
                <button class="btn btn-success btn-sm me-1 btn-realizar-atencion" data-id="${cita.id_appointment}">
                    <i class="fa fa-notes-medical"></i> Realizar Atención
                </button>
            </td>
        `;
		tbody.appendChild(tr);
	});
}

function formatearFechaHora(fechaHora) {
	if (!fechaHora) return "Fecha no disponible";
	const fecha = new Date(fechaHora);
	return fecha.toLocaleString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// 7. Funciones del Formulario de Atención
function configurarEventosFormulario() {
	// Evento para el botón de agregar medicamento
	document.getElementById("btnAgregarMedicamento")?.addEventListener("click", agregarMedicamento);

	// Evento para el botón de guardar atención
	document.getElementById("btnGuardarAtencion")?.addEventListener("click", guardarAtencion);

	// Evento delegado para eliminar medicamentos
	document.getElementById("listaMedicamentos")?.addEventListener("click", (e) => {
		if (e.target.closest(".btn-eliminar-medicamento")) {
			const item = e.target.closest(".medicamento-item");
			item.remove();
			actualizarListaMedicamentos();
		}
	});

	// Evento para el botón de realizar atención en la tabla
	document.addEventListener("click", (e) => {
		const btnRealizarAtencion = e.target.closest(".btn-realizar-atencion");
		if (btnRealizarAtencion) {
			const citaId = btnRealizarAtencion.getAttribute("data-id");
			const fila = btnRealizarAtencion.closest("tr");
			const cita = {
				id: citaId,
				paciente: {
					fullName: fila.cells[3].textContent,
					dni: fila.cells[2].textContent,
				},
				appointmentDate: fila.cells[1].getAttribute("data-fecha"),
				specialty: {
					name: fila.cells[4].textContent,
				},
				description: fila.cells[6].textContent,
			};
			cargarDatosCita(cita);
		}
	});
}

function cargarDatosCita(cita) {
	citaSeleccionada = cita;

	// Llenar datos de la cita
	document.getElementById("idCita").value = cita.id;
	document.getElementById("pacienteNombre").value = cita.paciente?.fullName || "N/A";
	document.getElementById("pacienteDNI").value = cita.paciente?.dni || "N/A";
	document.getElementById("fechaCita").value = formatearFechaHora(cita.appointmentDate);
	document.getElementById("especialidad").value = cita.specialty?.name || "N/A";

	// Limpiar campos del formulario
	document.getElementById("diagnostico").value = "";
	document.getElementById("tratamiento").value = "";
	document.getElementById("tipoAtencion").value = "";

	// Limpiar lista de medicamentos
	document.getElementById("listaMedicamentos").innerHTML =
		'<p class="text-muted mb-0">No hay medicamentos agregados</p>';
	medicamentos = [];

	// Mostrar el modal
	const modal = new bootstrap.Modal(document.getElementById("modalAtencion"));
	modal.show();
}

async function cargarMedicamentos() {
	try {
		const response = await fetch(`${MEDICINE_URL}/list?page=0`, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error("Error al cargar los medicamentos");
		}

		const data = await response.json();
		if (data.data && Array.isArray(data.data)) {
			listaMedicamentosDisponibles = data.data;
			return data.data;
		} else {
			throw new Error("Formato de respuesta inesperado");
		}
	} catch (error) {
		console.error("Error al cargar medicamentos:", error);
		mostrarError("No se pudieron cargar los medicamentos");
		return [];
	}
}

async function agregarMedicamento() {
	const listaMedicamentos = document.getElementById("listaMedicamentos");
	const template = document.getElementById("templateMedicamento");
	const nuevoMedicamento = template.content.cloneNode(true);

	const select = nuevoMedicamento.querySelector(".medicamento-select");

	try {
		// Cargar medicamentos si no están cargados
		if (listaMedicamentosDisponibles.length === 0) {
			await cargarMedicamentos();
		}

		// Llenar el select con los medicamentos disponibles
		select.innerHTML = '<option value="">Seleccione un medicamento</option>';
		listaMedicamentosDisponibles.forEach((med) => {
			const option = document.createElement("option");
			option.value = med.id_medicine;
			option.textContent = `${med.name} (${med.concentration} ${med.unit || ""})`;
			select.appendChild(option);
		});
	} catch (error) {
		console.error("Error al cargar medicamentos:", error);
		mostrarError("No se pudieron cargar los medicamentos");
	}

	// Limpiar mensaje de "No hay medicamentos" si es la primera vez
	if (listaMedicamentos.querySelector("p.text-muted")) {
		listaMedicamentos.innerHTML = "";
	}

	listaMedicamentos.appendChild(nuevoMedicamento);
}

function actualizarListaMedicamentos() {
	const listaMedicamentos = document.getElementById("listaMedicamentos");
	if (listaMedicamentos.children.length === 0) {
		listaMedicamentos.innerHTML = '<p class="text-muted mb-0">No hay medicamentos agregados</p>';
	}
}

async function guardarAtencion() {
	if (!citaSeleccionada) return;

	const form = document.getElementById("formAtencion");
	if (!form.checkValidity()) {
		form.classList.add("was-validated");
		return;
	}

	// Recolectar datos del formulario
	const atencionData = {
		diagnosis: document.getElementById("diagnostico").value,
		treatment: document.getElementById("tratamiento").value,
		attentionType: document.getElementById("tipoAtencion").value,
		prescriptions: [],
	};

	// Recolectar medicamentos
	const itemsMedicamentos = document.querySelectorAll(".medicamento-item");
	itemsMedicamentos.forEach((item) => {
		atencionData.prescriptions.push({
			id_medicine: item.querySelector(".medicamento-select").value,
			dose: parseFloat(item.querySelector(".medicamento-dosis").value),
			frequency: parseFloat(item.querySelector(".medicamento-frecuencia").value),
			duration: item.querySelector(".medicamento-duracion").value,
			medicationFormat: "TABLETS", // Por defecto, podrías hacerlo seleccionable
		});
	});

	try {
		const response = await fetch(`${ATTENTION_URL}/appointment/${citaSeleccionada.id}`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(atencionData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al guardar la atención");
		}

		const data = await response.json();
		mostrarExito("Atención registrada correctamente");

		// Cerrar el modal
		const modal = bootstrap.Modal.getInstance(document.getElementById("modalAtencion"));
		modal.hide();

		// Opcional: actualizar la lista de citas
		await cargarCitasDoctor();
	} catch (error) {
		console.error("Error al guardar atención:", error);
		mostrarError(error.message || "Error al guardar la atención");
	}
}

// 8. Inicialización
async function inicializarPagina() {
	if (!verificarAutenticacion()) return;

	try {
		await cargarSidebar();

		// Verificar que tenemos el ID del doctor
		const doctorId = localStorage.getItem(AUTH_KEYS.USER_ID);
		if (!doctorId) {
			throw new Error("No se encontró el ID del doctor. Por favor, inicia sesión nuevamente.");
		}

		console.log("ID del doctor obtenido:", doctorId);

		// Cargar citas y medicamentos en paralelo
		await Promise.all([cargarCitasDoctor(), cargarMedicamentos()]);
	} catch (error) {
		console.error("Error al inicializar la página:", error);
		mostrarError(error.message || "Error al cargar la aplicación");
	}
}

// 6. Eventos
document.addEventListener("DOMContentLoaded", inicializarPagina);
