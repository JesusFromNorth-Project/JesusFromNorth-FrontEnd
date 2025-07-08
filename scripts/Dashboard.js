// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1";
const APPOINTMENTS_URL = `${API_BASE_URL}/appointments`;
const DOCTORS_URL = `${API_BASE_URL}/doctor`;
const PATIENTS_URL = `${API_BASE_URL}/patient`;

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
async function cargarDoctores() {
	try {
		const response = await fetch(`${DOCTORS_URL}/list?page=0`, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error("Error al cargar la lista de doctores");
		}

		const result = await response.json();
		if (result.data && Array.isArray(result.data)) {
			const select = document.getElementById("selectDoctor");

			// Clear existing options except the first one
			while (select.options.length > 1) {
				select.remove(1);
			}

			// Add new doctor options
			result.data.forEach((doctor) => {
				const option = document.createElement("option");
				option.value = doctor.id_doctor || doctor.id;
				option.textContent = `${doctor.first_name || ""} ${doctor.last_name || ""} - ${
					doctor.specialty.specialty_name || "Sin especialidad"
				}`.trim();
				select.appendChild(option);
			});
		}
	} catch (error) {
		console.error("Error al cargar doctores:", error);
		mostrarError("No se pudieron cargar los doctores");
	}
}
async function inicializarSelect2() {
	// Inicializar select2 para doctores
	$("#selectDoctor").select2({
		placeholder: "Buscar doctor...",
		allowClear: true,
		minimumInputLength: 2,
		ajax: {
			url: `${DOCTORS_URL}/list`,
			dataType: "json",
			delay: 250,
			headers: getAuthHeaders(),
			data: function (params) {
				return {
					search: params.term || "",
					page: 0,
				};
			},
			processResults: function (data) {
				if (data && data.data) {
					return {
						results: data.data.map((doctor) => ({
							id: doctor.id_doctor || doctor.id,
							text: `${doctor.first_name || ""} ${doctor.last_name || ""} - ${
								doctor.specialty_name || doctor.specialty?.name || "Sin especialidad"
							}`.trim(),
						})),
					};
				}
				return { results: [] };
			},
			error: function (xhr, status, error) {
				console.error("Error al cargar doctores:", error);
				mostrarError("Error al cargar la lista de doctores");
			},
		},
	});
}

async function mostrarModalNuevaCita() {
	// Limpiar el formulario
	document.getElementById("formNuevaCita").reset();

	// Mostrar el modal
	const modal = new bootstrap.Modal(document.getElementById("modalNuevaCita"));
	modal.show();

	// Cargar doctores cuando se muestra el modal
	cargarDoctores();
}

async function buscarPacientePorDNI() {
	const dniInput = document.getElementById("dniPaciente");
	const nombrePacienteInput = document.getElementById("nombrePaciente");
	const idPacienteInput = document.getElementById("idPaciente");

	const dni = dniInput.value.trim();
	if (!dni) {
		mostrarError("Por favor ingrese un DNI");
		return;
	}

	try {
		// Usar el endpoint específico para búsqueda por DNI
		const url = new URL(`${PATIENTS_URL}/`);
		url.searchParams.append("dni", dni);

		const response = await fetch(url, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error("No se encontró ningún paciente con ese DNI");
			}
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Error al buscar el paciente");
		}

		const result = await response.json();
		if (result.data) {
			const paciente = result.data;
			nombrePacienteInput.value = `${paciente.first_name || ""} ${paciente.last_name || ""}`.trim();
			idPacienteInput.value = paciente.id_patient || paciente.id;
			nombrePacienteInput.classList.remove("is-invalid");
			dniInput.classList.remove("is-invalid");
			mostrarExito("Paciente encontrado correctamente");
		} else {
			throw new Error("No se encontraron datos del paciente");
		}
	} catch (error) {
		console.error("Error al buscar paciente:", error);
		nombrePacienteInput.value = "";
		idPacienteInput.value = "";
		nombrePacienteInput.classList.add("is-invalid");
		dniInput.classList.add("is-invalid");
		mostrarError(error.message || "Error al buscar el paciente");
	}
}

async function guardarNuevaCita(event) {
	event.preventDefault();

	const form = event.target;
	const formData = new FormData(form);

	const idDoctor = document.getElementById("selectDoctor").value;
	if (!idDoctor) {
		mostrarError("Por favor seleccione un doctor");
		return;
	}
	const idPaciente = document.getElementById("idPaciente").value;
	const adminId = localStorage.getItem("adminId");

	if (!idDoctor || !idPaciente || !adminId) {
		mostrarError("Por favor complete todos los campos obligatorios");
		return;
	}

	const citaData = {
		id_admin: adminId,
		id_doctor: idDoctor,
		dni_patient: document.getElementById("dniPaciente").value,
		responseDTO: {
			date_appointment: formData.get("fechaCita"),
			date_attention: formData.get("fechaAtencion"),
			description: formData.get("descripcion"),
		},
	};

	try {
		const response = await fetch(APPOINTMENTS_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...getAuthHeaders(),
			},
			body: JSON.stringify(citaData),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Error al guardar la cita");
		}

		const result = await response.json();
		if (result.status === 200 || result.status === 201) {
			mostrarExito("Cita guardada correctamente");
			// Cerrar el modal
			const modal = bootstrap.Modal.getInstance(document.getElementById("modalNuevaCita"));
			modal.hide();
			// Recargar la lista de citas
			await cargarCitas(0);
		} else {
			throw new Error(result.message || "Error al guardar la cita");
		}
	} catch (error) {
		console.error("Error al guardar la cita:", error);
		mostrarError(error.message || "Error al guardar la cita");
	}
}
async function cargarCitas(pagina = 0) {
	try {
		const response = await fetch(`${APPOINTMENTS_URL}/?page=${pagina}`, {
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Error al cargar las citas");
		}

		const data = await response.json();
		if (data.status !== 200) {
			throw new Error(data.message || "Error al cargar las citas");
		}

		actualizarTablaCitas(data.data);
	} catch (error) {
		console.error("Error al cargar citas:", error);
		mostrarError(error.message);
	}
}

function formatearFecha(fechaISO) {
	if (!fechaISO) return "";
	const fecha = new Date(fechaISO);
	return fecha.toLocaleString("es-PE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
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
		.map(
			(cita, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${formatearFecha(cita.appointmentDate)}</td>
                <td>${cita.patient?.dni || ""}</td>
                <td>${cita.patient?.fullName || ""}</td>
                <td>${cita.specialty?.name || ""}</td>
                <td>${cita.doctor?.fullName || ""}</td>
                <td>${cita.description || "Sin descripción"}</td>
                <td>
                    <button class="btn btn-success btn-sm me-1" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalAtencion" 
                            data-id="${cita.id}">
                        <i class="fa fa-notes-medical"></i> Realizar Atención
                    </button>
                </td>
            </tr>
        `
		)
		.join("");
}

// 5. Eventos DOM
document.addEventListener("DOMContentLoaded", async () => {
	if (!verificarAutenticacion()) {
		return;
	}

	await cargarSidebar();
	await cargarCitas(0);

	// Inicializar el modal de nueva cita
	const modalElement = document.getElementById("modalNuevaCita");
	if (modalElement) {
		modalElement.addEventListener("hidden.bs.modal", function () {
			// Resetear el formulario cuando se cierra el modal
			const form = document.getElementById("formNuevaCita");
			if (form) form.reset();

			const nombrePaciente = document.getElementById("nombrePaciente");
			const idPaciente = document.getElementById("idPaciente");
			const dniPaciente = document.getElementById("dniPaciente");

			if (nombrePaciente) nombrePaciente.value = "";
			if (idPaciente) idPaciente.value = "";
			if (dniPaciente) {
				dniPaciente.value = "";
				dniPaciente.classList.remove("is-invalid");
			}

			// Resetear select2
			const selectDoctor = $("#selectDoctor");
			if (selectDoctor.length) {
				selectDoctor.val(null).trigger("change");
			}
		});

		// Inicializar select2 cuando el modal se muestra
		modalElement.addEventListener("shown.bs.modal", function () {
			if (typeof $ !== "undefined" && $.fn.select2) {
				inicializarSelect2();
			}
		});
	}

	// Asignar manejador de eventos al formulario
	const formNuevaCita = document.getElementById("formNuevaCita");
	if (formNuevaCita) {
		formNuevaCita.addEventListener("submit", guardarNuevaCita);
	}

	// Asignar manejador de eventos al botón de búsqueda de paciente
	const btnBuscarPaciente = document.getElementById("btnBuscarPaciente");
	if (btnBuscarPaciente) {
		btnBuscarPaciente.addEventListener("click", buscarPacientePorDNI);
	}

	// Permitir búsqueda de paciente con Enter
	const dniPaciente = document.getElementById("dniPaciente");
	if (dniPaciente) {
		dniPaciente.addEventListener("keypress", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();
				buscarPacientePorDNI();
			}
		});
	}
});

// 6. Funciones Globales
window.cargarCitas = cargarCitas;
window.mostrarModalNuevaCita = mostrarModalNuevaCita;
window.buscarPacientePorDNI = buscarPacientePorDNI;
