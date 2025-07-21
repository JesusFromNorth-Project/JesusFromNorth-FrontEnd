// 1. IMPORTACIONES
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/patient/";

// 3. FUNCIONES DE MANEJO DE PACIENTES
function editarPaciente(paciente) {
	const form = document.getElementById("formPaciente");
	const btnGuardar = document.getElementById("btnGuardar");
	const btnActualizar = document.getElementById("btnActualizar");
	const btnCancelar = document.getElementById("btnCancelar");

	// Llenar el formulario con los datos del paciente
	document.getElementById("pacienteId").value = paciente.id_patient;
	form.nombre.value = paciente.first_name || "";
	form.apellidos.value = paciente.last_name || "";
	form.dni.value = paciente.dni || "";
	form.birthday.value = paciente.birthdate || "";
	form.edad.value = paciente.age || "";
	form.direccion.value = paciente.address || "";
	form.telefono.value = paciente.phone || "";
	form.celular.value = paciente.landline_phone || "";
	form.email.value = paciente.email || "";
	form.antecedente.value = paciente.antecedent || "";

	// Seleccionar el género
	if (paciente.gender) {
		const generoInput = document.querySelector(`input[name="genero"][value="${paciente.gender}"]`);
		if (generoInput) generoInput.checked = true;
	}

	// Cambiar a modo edición
	btnGuardar.classList.add("d-none");
	btnActualizar.classList.remove("d-none");
	btnCancelar.classList.remove("d-none");

	// Desplazar al formulario
	form.scrollIntoView({ behavior: "smooth" });
}

/**
 * Cancela el modo de edición y limpia el formulario
 */
function cancelarEdicion() {
	const form = document.getElementById("formPaciente");
	const btnGuardar = document.getElementById("btnGuardar");
	const btnActualizar = document.getElementById("btnActualizar");
	const btnCancelar = document.getElementById("btnCancelar");

	// Restaurar botones
	btnGuardar.classList.remove("d-none");
	btnActualizar.classList.add("d-none");
	btnCancelar.classList.add("d-none");

	// Limpiar formulario
	form.reset();
	document.getElementById("pacienteId").value = "";
}

/**
 * Actualiza un paciente existente
 */
async function actualizarPaciente() {
	const idPaciente = document.getElementById("pacienteId").value;
	if (!idPaciente) return;

	const form = document.getElementById("formPaciente");
	const formData = new FormData(form);
	const generoSeleccionado = document.querySelector('input[name="genero"]:checked');

	const pacienteData = {
		first_name: formData.get("nombre"),
		last_name: formData.get("apellidos"),
		dni: formData.get("dni"),
		birthdate: formData.get("birthday"),
		age: parseInt(formData.get("edad"), 10) || 0,
		address: formData.get("direccion"),
		phone: formData.get("telefono"),
		landline_phone: formData.get("celular"),
		email: formData.get("email"),
		gender: generoSeleccionado ? generoSeleccionado.value : null,
		antecedent: formData.get("antecedente"),
	};

	try {
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		if (!token) throw new Error("No se encontró el token de autenticación");

		const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(pacienteData),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Error al actualizar el paciente");
		}

		// Actualizar la lista de pacientes
		const pacientes = await cargarPacientes(0);
		actualizarTablaPacientes(pacientes);

		// Limpiar formulario
		cancelarEdicion();

		mostrarExito("Paciente actualizado correctamente");
	} catch (error) {
		console.error("Error al actualizar paciente:", error);
		mostrarError(error.message || "Error al actualizar el paciente");
	}
}

/**
 * Elimina un paciente
 * @param {string} idPaciente - ID del paciente a eliminar
 */
async function eliminarPaciente(idPaciente) {
	if (!idPaciente || !confirm("¿Está seguro de eliminar este paciente?")) {
		return;
	}

	try {
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		if (!token) throw new Error("No se encontró el token de autenticación");

		const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Error al eliminar el paciente");
		}

		// Actualizar la lista de pacientes
		const pacientes = await cargarPacientes(0);
		actualizarTablaPacientes(pacientes);

		mostrarExito("Paciente eliminado correctamente");
	} catch (error) {
		console.error("Error al eliminar paciente:", error);
		mostrarError(error.message || "Error al eliminar el paciente");
	}
}

// 3. FUNCIONES SÍNCRONAS
/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string} fechaNacimiento - Fecha en formato YYYY-MM-DD
 * @returns {number} Edad en años
 */
function calcularEdad(fechaNacimiento) {
	if (!fechaNacimiento) return 0;

	const hoy = new Date();
	const nacimiento = new Date(fechaNacimiento);

	// Validar que la fecha sea válida y no sea futura
	if (isNaN(nacimiento.getTime()) || nacimiento > hoy) {
		return 0;
	}

	let edad = hoy.getFullYear() - nacimiento.getFullYear();
	const mes = hoy.getMonth() - nacimiento.getMonth();

	// Ajustar si aún no ha pasado el mes de cumpleaños
	if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
		edad--;
	}

	return Math.max(0, edad); // Asegurar que no sea negativo
}

/**
 * Configura el manejador de eventos para el cálculo automático de edad
 */
function configurarCalculoEdad() {
	const fechaNacimientoInput = document.querySelector('input[name="birthday"]');
	const edadInput = document.getElementById("edadInput");

	if (fechaNacimientoInput && edadInput) {
		fechaNacimientoInput.addEventListener("change", (e) => {
			const edad = calcularEdad(e.target.value);
			edadInput.value = edad > 0 ? edad : "";
		});
	}
}
/**
 * Muestra un mensaje en la interfaz
 * @param {string} mensaje - Texto del mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (danger, success, etc.)
 */
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

/**
 * Muestra un mensaje de éxito
 * @param {string} mensaje - Texto del mensaje
 */
function mostrarExito(mensaje) {
	mostrarMensaje(mensaje, "success");
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Texto del mensaje de error
 */
function mostrarError(mensaje) {
	mostrarMensaje(mensaje, "danger");
}

/**
 * Obtiene los headers de autenticación para las peticiones a la API
 * @returns {Object} Headers de autenticación
 */
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

/**
 * Cierra la sesión del usuario y redirige al login
 */
function cerrarSesion() {
	limpiarSesion();
	window.location.href = "Login.html";
}

function validarFormularioPacientes(formData) {
	const errors = [];
	const telefono = formData.get("telefono")?.trim() || "";
	const celular = formData.get("celular")?.trim() || "";
	const genero = formData.get("genero");

	// 1. Validar Nombre (obligatorio)
	if (!formData.get("nombre")?.trim()) {
		errors.push("El nombre es obligatorio");
	}

	// 2. Validar Apellidos (obligatorio)
	if (!formData.get("apellidos")?.trim()) {
		errors.push("Los apellidos son obligatorios");
	}

	// 3. Validar DNI (obligatorio, 8 dígitos)
	const dni = formData.get("dni")?.trim() || "";
	if (!dni) {
		errors.push("El DNI es obligatorio");
	} else if (!/^[0-9]{8}$/.test(dni)) {
		errors.push("El DNI debe tener exactamente 8 dígitos numéricos");
	}

	// 4. Validar Fecha de Nacimiento (obligatoria)
	const fechaNacimiento = formData.get("birthday")?.trim();
	if (!fechaNacimiento) {
		errors.push("La fecha de nacimiento es obligatoria");
	}

	// 5. Calcular y validar Edad automáticamente
	const edadInput = document.getElementById("edadInput");
	if (fechaNacimiento) {
		const edadCalculada = calcularEdad(fechaNacimiento);
		if (edadInput) {
			edadInput.value = edadCalculada > 0 ? edadCalculada : "";
		}
	}

	// 6. Validar Dirección (obligatoria)
	if (!formData.get("direccion")?.trim()) {
		errors.push("La dirección es obligatoria");
	}

	// 7. Validar Teléfono (obligatorio, 7-9 dígitos)
	if (!telefono) {
		errors.push("El teléfono es obligatorio");
	} else if (!/^[0-9]{7,9}$/.test(telefono)) {
		errors.push("El teléfono debe tener entre 7 y 9 dígitos numéricos");
	}

	// 8. Validar Celular (obligatorio, 9 dígitos)
	if (!celular) {
		errors.push("El número de celular es obligatorio");
	} else if (!/^[0-9]{9}$/.test(celular)) {
		errors.push("El celular debe tener exactamente 9 dígitos numéricos");
	}

	// 9. Validar Correo Electrónico (opcional pero con formato válido si se ingresa)
	const email = formData.get("email")?.trim();
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.push("El formato del correo electrónico no es válido");
	}

	// 10. Validar Género (obligatorio)
	if (!genero) {
		errors.push("Debe seleccionar un género (Hombre o Mujer)");
	}

	// 11. Validar Antecedente (opcional, máximo 1000 caracteres)
	const antecedente = formData.get("antecedente")?.trim() || "";
	if (antecedente.length > 1000) {
		errors.push("El antecedente no debe exceder los 1000 caracteres");
	}

	return errors;
}

// 4. FUNCIONES ASÍNCRONAS
// Cargar el sidebar basado en el rol del usuario
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

/**
 * Mapea los datos del formulario al formato esperado por la API
 * @param {FormData} formData - Datos del formulario
 * @returns {Object} Objeto con los datos mapeados
 */
function mapearDatosPaciente(formData) {
	return {
		first_name: formData.get("nombre"),
		last_name: formData.get("apellidos"),
		dni: formData.get("dni"),
		birthdate: formData.get("birthday"),
		age: parseInt(formData.get("edad"), 10),
		address: formData.get("direccion"),
		phone: formData.get("telefono") || "",
		landline_phone: formData.get("celular") || "",
		gender: formData.get("genero") === "H" ? "MALE" : "FEMALE",
		email: formData.get("email")?.trim() || "",
		antecedent: formData.get("antecedente") || "",
	};
}

/**
 * Crea un nuevo paciente en el sistema
 * @param {Object} datosPaciente - Datos del paciente a crear
 * @returns {Promise<Object>} Datos del paciente creado
 */
async function crearPaciente(datosPaciente) {
	try {
		// Obtener el ID del administrador del localStorage
		const adminId = localStorage.getItem(AUTH_KEYS.USER_ID);
		if (!adminId) {
			throw new Error("No se encontró el ID del administrador. Por favor, inicie sesión nuevamente.");
		}

		// Verificar autenticación
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		if (!token) {
			throw new Error("No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.");
		}

		// Realizar la petición POST
		const response = await fetch(`${API_BASE_URL}${adminId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(datosPaciente),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Error al crear el paciente");
		}

		const result = await response.json();
		mostrarExito("Paciente creado exitosamente");
		return result.data;
	} catch (error) {
		console.error("Error al crear paciente:", error);
		mostrarError(error.message || "Error al crear el paciente");
		throw error;
	}
}

/**
 * Maneja el envío del formulario de paciente
 * @param {Event} event - Evento de envío del formulario
 */
async function manejarEnvioFormulario(event) {
	event.preventDefault();

	const form = event.target;
	const formData = new FormData(form);

	// Validar el formulario
	const errores = validarFormularioPacientes(formData);
	if (errores.length > 0) {
		mostrarError(errores.join("<br>"));
		return;
	}

	const btnSubmit = form.querySelector('button[type="submit"]');
	const btnOriginalText = btnSubmit?.innerHTML;

	try {
		// Mostrar indicador de carga
		if (btnSubmit) {
			btnSubmit.disabled = true;
			btnSubmit.innerHTML =
				'<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
		}

		// Mapear y enviar los datos
		const datosPaciente = mapearDatosPaciente(formData);
		const pacienteCreado = await crearPaciente(datosPaciente);

		// Actualizar la tabla con el nuevo paciente
		if (pacienteCreado) {
			actualizarTablaPaciente(pacienteCreado);
		}

		// Limpiar el formulario después de un envío exitoso
		form.reset();
	} catch (error) {
		console.error("Error al procesar el formulario:", error);
		// El error ya fue mostrado por la función crearPaciente
	} finally {
		// Restaurar el botón
		if (btnSubmit) {
			btnSubmit.disabled = false;
			btnSubmit.innerHTML = btnOriginalText || "Guardar";
		}
	}
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES
// Configurar el manejador del formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
	// Verificar autenticación
	if (!verificarAutenticacion()) {
		return;
	}

	// Configurar el formulario
	const formPaciente = document.getElementById("formPaciente");
	if (formPaciente) {
		formPaciente.addEventListener("submit", async (e) => {
			e.preventDefault();

			// Verificar si estamos en modo edición
			const idPaciente = document.getElementById("pacienteId").value;
			if (idPaciente) {
				await actualizarPaciente();
			} else {
				await manejarEnvioFormulario(e);
			}
		});
	}

	// Configurar botones de actualizar y cancelar
	const btnActualizar = document.getElementById("btnActualizar");
	const btnCancelar = document.getElementById("btnCancelar");

	if (btnActualizar) {
		btnActualizar.addEventListener("click", actualizarPaciente);
	}

	if (btnCancelar) {
		btnCancelar.addEventListener("click", cancelarEdicion);
	}

	// Cargar el sidebar
	cargarSidebar();
});

/**
 * Obtiene un paciente por su ID
 * @param {string} idPaciente - ID único del paciente (UUID)
 * @returns {Promise<Object>} Promesa que resuelve con los datos del paciente
 */
async function obtenerPacientePorId(idPaciente) {
	try {
		// Verificar autenticación
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		if (!token) {
			throw new Error("No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.");
		}

		// Realizar la petición GET
		const response = await fetch(`${API_BASE_URL}${idPaciente}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			// Si el servidor devuelve un error 404 (paciente no encontrado)
			if (response.status === 404) {
				throw new Error("No se encontró ningún paciente con el ID proporcionado");
			}

			// Para otros errores, intentar obtener el mensaje del servidor
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Error al obtener los datos del paciente");
		}

		const result = await response.json();
		return result.data; // Retorna los datos del paciente
	} catch (error) {
		console.error("Error al obtener paciente:", error);
		mostrarError(error.message || "Error al cargar los datos del paciente");
		throw error; // Relanzar el error para que pueda ser manejado por el llamador
	}
}

/**
 * Busca un paciente por su número de DNI
 * @param {string} dni - Número de documento de identidad del paciente
 * @returns {Promise<Object>} Promesa que resuelve con los datos del paciente
 * @throws {Error} Si el DNI no es válido o si ocurre un error en la petición
 */
async function buscarPacientePorDNI(dni) {
	try {
		// Validar el DNI
		const dniRegex = /^\d{8,15}$/;
		if (!dniRegex.test(dni)) {
			throw new Error("El DNI debe contener entre 8 y 15 dígitos numéricos");
		}

		// Verificar autenticación
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		if (!token) {
			throw new Error("No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.");
		}

		// Construir la URL
		const url = new URL(API_BASE_URL);
		url.searchParams.append("dni", dni);

		// Realizar la petición GET
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			// error 404
			if (response.status === 404) {
				throw new Error(`No se encontró ningún paciente con el DNI: ${dni}`);
			}

			// otros errores, desde el backend
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Error al buscar el paciente por DNI");
		}

		const result = await response.json();
		return result.data;
	} catch (error) {
		console.error("Error al buscar paciente por DNI:", error);
		mostrarError(error.message || "Error al buscar el paciente por DNI");
		throw error;
	}
}

/**
 * Actualiza la tabla de pacientes con la lista de pacientes proporcionada
 * @param {Array} pacientes - Lista de pacientes a mostrar en la tabla
 */
function actualizarTablaPacientes(pacientes) {
	const tbody = document.getElementById("tablaPacientes");
	if (!tbody) {
		console.error("No se encontró el elemento tbody para la tabla de pacientes");
		return;
	}

	// Si no hay pacientes o el array está vacío, mostrar mensaje
	if (!pacientes || pacientes.length === 0) {
		tbody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center">No hay pacientes registrados.</td>
      </tr>
    `;
		return;
	}

	tbody.innerHTML = pacientes
		.map(
			(paciente, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${paciente.first_name || ""}</td>
        <td>${paciente.last_name || ""}</td>
        <td>${paciente.dni || ""}</td>
        <td>${paciente.email || ""}</td>
        <td>${paciente.phone || ""}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-primary btn-editar" data-id="${paciente.id_patient}" 
                  data-paciente='${JSON.stringify(paciente).replace(/'/g, "&#39;")}'>
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-sm btn-danger btn-eliminar ms-1" data-id="${paciente.id_patient}">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </td>
      </tr>
    `
		)
		.join("");

	// Agregar event listeners a los botones de editar y eliminar
	document.querySelectorAll(".btn-editar").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			const pacienteData = JSON.parse(e.currentTarget.getAttribute("data-paciente").replace(/&#39;/g, "'"));
			editarPaciente(pacienteData);
		});
	});

	document.querySelectorAll(".btn-eliminar").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			const idPaciente = e.currentTarget.getAttribute("data-id");
			eliminarPaciente(idPaciente);
		});
	});

	console.log("Tabla de pacientes actualizada:", pacientes);
}

/**
 * Actualiza la tabla con un solo paciente (para búsquedas)
 * @param {Object} paciente - Datos del paciente a mostrar
 */
function actualizarTablaPaciente(paciente) {
	actualizarTablaPacientes(paciente ? [paciente] : []);
}

/**
 * Maneja la búsqueda de paciente por DNI
 * @param {string} dni - Número de DNI a buscar
 */
async function buscarYMostrarPacientePorDNI(dni) {
	const btnBuscar = document.querySelector("#searchNombre").nextElementSibling;
	const btnOriginalText = btnBuscar?.innerHTML;

	try {
		// Mostrar indicador de carga
		if (btnBuscar) {
			btnBuscar.disabled = true;
			btnBuscar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
		}

		// Realizar la búsqueda
		const paciente = await buscarPacientePorDNI(dni);

		// Actualizar la tabla con el paciente encontrado
		actualizarTablaPaciente(paciente);
	} catch (error) {
		// El error ya fue manejado por buscarPacientePorDNI
		actualizarTablaPaciente(null); // Limpiar la tabla
	} finally {
		// Restaurar el botón
		if (btnBuscar) {
			btnBuscar.disabled = false;
			btnBuscar.innerHTML = btnOriginalText || "Buscar";
		}
	}
}

/**
 * Carga una lista paginada de pacientes
 * @param {number} pagina - Número de página (0-indexado)
 * @returns {Promise<Array>} Promesa que resuelve con la lista de pacientes
 */
async function cargarPacientes(pagina = 0) {
	try {
		const headers = getAuthHeaders();
		if (Object.keys(headers).length === 0) {
			throw new Error("No se encontraron las credenciales de autenticación");
		}

		const response = await fetch(`${API_BASE_URL}list?page=${pagina}`, {
			method: "GET",
			headers: headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al obtener la lista de pacientes");
		}

		const result = await response.json();

		if (result.status !== 200) {
			throw new Error(result.message || "Error en la respuesta del servidor");
		}

		return result.data || [];
	} catch (error) {
		console.error("Error al obtener pacientes paginados:", error);
		mostrarError(error.message || "Error al cargar la lista de pacientes");
		throw error;
	}
}

// Función para exportar pacientes a Excel
async function exportarPacientesAExcel() {
	try {
		const response = await fetch(`${API_BASE_URL}export/excel`, {
			method: 'GET',
			headers: getAuthHeaders()
		});

		if (!response.ok) {
			throw new Error('Error al exportar los pacientes');
		}

		// Obtener el blob del archivo
		const blob = await response.blob();
		
		// Crear un enlace temporal para descargar el archivo
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'pacientes.xlsx';
		document.body.appendChild(a);
		a.click();
		
		// Limpiar
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
		
		mostrarExito('Exportación completada con éxito');
	} catch (error) {
		console.error('Error al exportar a Excel:', error);
		mostrarError('Error al exportar los pacientes: ' + error.message);
	}
}

// Configurar manejadores de eventos al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
	// Configurar el manejador del botón de exportar
	const btnExportar = document.getElementById('exportarPacientes');
	if (btnExportar) {
		btnExportar.addEventListener('click', exportarPacientesAExcel);
	}
    
	// Configurar el cálculo automático de edad
	configurarCalculoEdad();

	// Cargar la primera página de pacientes al iniciar
	try {
		const pacientes = await cargarPacientes(0);
		actualizarTablaPacientes(pacientes);
	} catch (error) {
		// El error ya se mostró en la función obtenerPacientesPaginados
		console.error("Error al cargar pacientes iniciales:", error);
	}
	// Configurar búsqueda por DNI
	const inputBuscarDNI = document.getElementById("searchDni");
	const btnBuscarDNI = document.getElementById("btnBuscarDni");
	const btnMostrarTodos = document.getElementById("mostrarTodos");

	// Configurar botón Mostrar Todos
	if (btnMostrarTodos) {
		btnMostrarTodos.addEventListener("click", async () => {
			try {
				const pacientes = await cargarPacientes(0);
				actualizarTablaPacientes(pacientes);
				inputBuscarDNI.value = "";
			} catch (error) {
				console.error("Error al cargar todos los pacientes:", error);
				mostrarError("Error al cargar la lista de pacientes");
			}
		});
	}

	if (inputBuscarDNI && btnBuscarDNI) {
		const buscarPorDNI = async () => {
			const dni = inputBuscarDNI.value.trim();
			if (dni) {
				try {
					const paciente = await buscarPacientePorDNI(dni);
					actualizarTablaPaciente(paciente);
				} catch (error) {
					mostrarError(error.message || "Error al buscar el paciente");
				}
			} else {
				mostrarError("Por favor ingrese un DNI para buscar");
			}
		};

		// Configurar búsqueda al hacer clic en el botón
		btnBuscarDNI.addEventListener("click", buscarPorDNI);

		// Permitir búsqueda con Enter
		inputBuscarDNI.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				buscarPorDNI();
			}
		});
	}
});

// Hacer que las funciones estén disponibles globalmente
window.crearPaciente = crearPaciente;
window.manejarEnvioFormulario = manejarEnvioFormulario;
window.obtenerPacientePorId = obtenerPacientePorId;
window.buscarPacientePorDNI = buscarPacientePorDNI;
window.buscarYMostrarPacientePorDNI = buscarYMostrarPacientePorDNI;
