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
    if (!tbody) {
        console.error("No se encontró el cuerpo de la tabla de citas");
        return;
    }

    tbody.innerHTML = "";

    if (!citas || citas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p class="mb-0">No se encontraron citas programadas</p>
                </td>
            </tr>`;
        return;
    }

    // Ordenar citas por fecha (más recientes primero)
    const citasOrdenadas = [...citas].sort((a, b) => {
        return new Date(b.date_attention) - new Date(a.date_attention);
    });

    citasOrdenadas.forEach((cita, index) => {
        const tr = document.createElement("tr");
        
        // Formatear la fecha para mostrar
        const fechaHora = formatearFechaHora(cita.date_attention || cita.appointmentDate);
        const [fecha, hora] = fechaHora.split(' ');
        
        // Determinar si la cita está vencida
        const ahora = new Date();
        const fechaCita = new Date(cita.date_attention || cita.appointmentDate);
        const esVencida = fechaCita < ahora;
        
        // Clases CSS según el estado de la cita
        const claseFila = esVencida ? 'table-secondary' : '';
        const textoBoton = esVencida ? 'Registrar Tardíamente' : 'Realizar Atención';
        const iconoBoton = esVencida ? 'fa-clock' : 'fa-stethoscope';
        
        tr.innerHTML = `
            <td class="${claseFila}">${index + 1}</td>
            <td class="${claseFila}" data-fecha="${cita.date_attention || cita.appointmentDate}">
                <div class="fw-bold">${fecha}</div>
                <div class="text-muted small">${hora}</div>
            </td>
            <td class="${claseFila}">${cita.patient?.dni || 'N/A'}</td>
            <td class="${claseFila}">
                <div class="fw-bold">${cita.patient?.first_name || ''} ${cita.patient?.last_name || ''}</div>
                <div class="text-muted small">${cita.patient?.email || ''}</div>
            </td>
            <td class="${claseFila}">${cita.specialty?.name || cita.description || 'N/A'}</td>
            <td class="${claseFila}">${cita.doctor?.first_name || ''} ${cita.doctor?.last_name || 'N/A'}</td>
            <td class="${claseFila}">${cita.description || ''}</td>
            <td class="text-center ${claseFila}">
                <button class="btn btn-sm ${esVencida ? 'btn-warning' : 'btn-primary'} btn-realizar-atencion" 
                        data-id="${cita.id_appointment || cita.id}"
                        title="${textoBoton}">
                    <i class="fas ${iconoBoton} me-1"></i> ${textoBoton}
                </button>
            </td>`;
            
        tbody.appendChild(tr);
    });

    // Usar delegación de eventos para los botones de realizar atención
    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-realizar-atencion");
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const citaId = btn.dataset.id;
        if (!citaId) {
            console.error("No se encontró el ID de la cita");
            mostrarError("Error al cargar los datos de la cita");
            return;
        }
        
        // Encontrar la cita en la lista
        const cita = citas.find(c => (c.id_appointment || c.id) == citaId);
        if (!cita) {
            console.error("No se encontró la cita con ID:", citaId);
            mostrarError("No se pudo encontrar la cita seleccionada");
            return;
        }
        
        // Cargar los datos de la cita
        cargarDatosCita(cita);
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

async function cargarDatosCita(cita) {
    try {
        console.log("Cargando datos de la cita:", cita);
        
        // Verificar que la cita tenga los datos necesarios
        if (!cita || !cita.id_appointment) {
            throw new Error("Datos de la cita no válidos");
        }

        // Obtener los detalles completos de la cita por su ID
        const response = await fetch(`${BASE_URL}/appointments/${cita.id_appointment}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al cargar los detalles de la cita");
        }

        const citaDetallada = await response.json();
        console.log("Datos detallados de la cita:", citaDetallada);
        
        // Guardar la cita seleccionada
        citaSeleccionada = citaDetallada.data || citaDetallada;
        
        // Obtener referencias a los elementos del formulario
        const form = document.getElementById("formAtencion");
        if (!form) {
            throw new Error("No se encontró el formulario de atención");
        }

        // Llenar datos de la cita en el formulario
        const pacienteNombre = document.getElementById("pacienteNombre");
        const pacienteDNI = document.getElementById("pacienteDNI");
        const fechaCita = document.getElementById("fechaCita");
        const especialidad = document.getElementById("especialidad");
        const diagnostico = document.getElementById("diagnostico");
        const tratamiento = document.getElementById("tratamiento");
        const tipoAtencion = document.getElementById("tipoAtencion");
        
        // Verificar que todos los elementos existen
        if (!pacienteNombre || !pacienteDNI || !fechaCita || !especialidad || 
            !diagnostico || !tratamiento || !tipoAtencion) {
            throw new Error("Elementos del formulario no encontrados");
        }

        // Llenar los campos con los datos de la cita
        if (citaDetallada.patient) {
            pacienteNombre.value = [
                citaDetallada.patient.first_name || '',
                citaDetallada.patient.last_name || ''
            ].join(' ').trim() || 'N/A';
            
            pacienteDNI.value = citaDetallada.patient.dni || 'N/A';
        } else {
            pacienteNombre.value = 'N/A';
            pacienteDNI.value = 'N/A';
        }

        fechaCita.value = formatearFechaHora(citaDetallada.date_attention || citaDetallada.appointmentDate);
        especialidad.value = citaDetallada.specialty?.name || citaDetallada.description || "N/A";
        
        // Limpiar campos de diagnóstico y tratamiento
        diagnostico.value = "";
        tratamiento.value = "";
        tipoAtencion.value = "CONSULTATION"; // Valor por defecto

        // Limpiar lista de medicamentos
        const listaMedicamentos = document.getElementById("listaMedicamentos");
        if (listaMedicamentos) {
            listaMedicamentos.innerHTML = '';
            medicamentos = [];
            actualizarListaMedicamentos();
        }

        // Cargar medicamentos disponibles si no están cargados
        if (listaMedicamentosDisponibles.length === 0) {
            await cargarMedicamentos();
        }

        // Mostrar el modal
        const modalElement = document.getElementById("modalAtencion");
        if (!modalElement) {
            throw new Error("No se encontró el modal de atención");
        }
        
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();

    } catch (error) {
        console.error("Error al cargar datos de la cita:", error);
        mostrarError(`Error al cargar los datos de la cita: ${error.message}`);
    }
}

async function cargarMedicamentos() {
    try {
        const response = await fetch(`${MEDICINE_URL}/list?page=0&size=100`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al cargar los medicamentos");
        }

        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            listaMedicamentosDisponibles = data.data;
            console.log("Medicamentos cargados:", listaMedicamentosDisponibles);
            return data.data;
        } else {
            throw new Error("Formato de respuesta inesperado al cargar medicamentos");
        }
    } catch (error) {
        console.error("Error al cargar medicamentos:", error);
        mostrarError(`No se pudieron cargar los medicamentos: ${error.message}`);
        return [];
    }
}

async function agregarMedicamento() {
    const listaMedicamentos = document.getElementById("listaMedicamentos");
    const template = document.getElementById("templateMedicamento");
    
    // Verificar si existe el template
    if (!template) {
        console.error("No se encontró el template de medicamento");
        mostrarError("Error al cargar el formulario de medicamentos");
        return;
    }

    // Clonar el template
    const nuevoMedicamento = template.content.cloneNode(true);
    const select = nuevoMedicamento.querySelector(".medicamento-select");
    
    try {
        // Cargar medicamentos si no están cargados
        if (listaMedicamentosDisponibles.length === 0) {
            await cargarMedicamentos();
        }

        // Verificar que hay medicamentos disponibles
        if (listaMedicamentosDisponibles.length === 0) {
            throw new Error("No hay medicamentos disponibles");
        }

        // Llenar el select con los medicamentos disponibles
        select.innerHTML = '<option value="">Seleccione un medicamento</option>';
        
        listaMedicamentosDisponibles.forEach((med) => {
            // Verificar que el medicamento tenga los campos requeridos
            if (!med.id_medicine || !med.name) {
                console.warn("Medicamento con datos incompletos:", med);
                return; // Saltar medicamentos sin ID o nombre
            }
            
            const option = document.createElement("option");
            option.value = med.id_medicine;
            
            // Construir el texto mostrado en el select
            let displayText = med.name;
            if (med.concentration) {
                displayText += ` (${med.concentration}`;
                if (med.unit) {
                    displayText += ` ${med.unit}`;
                }
                displayText += ") ";
            }
            
            if (med.laboratory) {
                displayText += ` - ${med.laboratory}`;
            }
            
            option.textContent = displayText;
            select.appendChild(option);
        });

        // Agregar evento para mostrar detalles del medicamento seleccionado
        select.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const medicamento = listaMedicamentosDisponibles.find(m => m.id_medicine == selectedId);
            if (medicamento) {
                // Actualizar tooltips o información adicional si es necesario
                const item = e.target.closest('.medicamento-item');
                if (item) {
                    const dosisInput = item.querySelector('.medicamento-dosis');
                    if (dosisInput) {
                        dosisInput.placeholder = `Ej: 1 ${medicamento.unit || 'unidad'}`;
                    }
                }
            }
        });

        // Limpiar mensaje de "No hay medicamentos" si es la primera vez
        if (listaMedicamentos.querySelector("p.text-muted")) {
            listaMedicamentos.innerHTML = "";
        }

        // Agregar el nuevo medicamento a la lista
        listaMedicamentos.appendChild(nuevoMedicamento);
        
        // Hacer scroll al nuevo elemento
        listaMedicamentos.lastElementChild.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error("Error al agregar medicamento:", error);
        mostrarError(`No se pudo agregar el medicamento: ${error.message}`);
        
        // Mostrar mensaje si no hay medicamentos
        if (listaMedicamentos.children.length === 0) {
            listaMedicamentos.innerHTML = 
                '<div class="alert alert-warning">No se encontraron medicamentos disponibles</div>';
        }
    }
}

function actualizarListaMedicamentos() {
    const listaMedicamentos = document.getElementById("listaMedicamentos");
    if (!listaMedicamentos) {
        console.error("No se encontró el contenedor de medicamentos");
        return;
    }

    // Contar solo los elementos que son medicamentos (no mensajes de error o advertencia)
    const itemsMedicamentos = listaMedicamentos.querySelectorAll('.medicamento-item');
    
    if (itemsMedicamentos.length === 0) {
        // Verificar si ya hay un mensaje mostrado
        const existingMessage = listaMedicamentos.querySelector('.alert-warning, .text-muted');
        if (!existingMessage) {
            listaMedicamentos.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center py-4">
                    <i class="fas fa-pills fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">No hay medicamentos agregados</p>
                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="agregarMedicamento()">
                        <i class="fas fa-plus me-1"></i> Agregar Medicamento
                    </button>
                </div>`;
        }
    }
}

async function guardarAtencion() {
    if (!citaSeleccionada) {
        mostrarError("No se ha seleccionado ninguna cita");
        return;
    }

    const form = document.getElementById("formAtencion");
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    // Mostrar carga
    const btnGuardar = document.getElementById("btnGuardarAtencion");
    const btnText = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';

    try {
        // Recolectar datos del formulario
        const atencionData = {
            diagnosis: document.getElementById("diagnostico").value.trim(),
            treatment: document.getElementById("tratamiento").value.trim(),
            attentionType: document.getElementById("tipoAtencion").value,
            prescriptions: [],
        };

        // Validar que se haya seleccionado un tipo de atención
        if (!atencionData.attentionType) {
            throw new Error("Por favor seleccione un tipo de atención");
        }

        // Recolectar medicamentos
        const itemsMedicamentos = document.querySelectorAll(".medicamento-item");
        itemsMedicamentos.forEach((item) => {
            const medicamentoId = item.querySelector(".medicamento-select").value;
            const dosis = parseFloat(item.querySelector(".medicamento-dosis").value);
            const frecuencia = parseFloat(item.querySelector(".medicamento-frecuencia").value);
            const duracion = item.querySelector(".medicamento-duracion").value.trim();

            // Validar campos de medicamento
            if (!medicamentoId) {
                throw new Error("Por favor seleccione un medicamento");
            }
            if (isNaN(dosis) || dosis <= 0) {
                throw new Error("La dosis debe ser un número mayor a cero");
            }
            if (isNaN(frecuencia) || frecuencia <= 0) {
                throw new Error("La frecuencia debe ser un número mayor a cero");
            }
            if (!duracion) {
                throw new Error("La duración es requerida");
            }

            atencionData.prescriptions.push({
                id_medicine: medicamentoId,
                dose: dosis,
                frequency: frecuencia,
                duration: duracion,
                medicationFormat: "TABLETS", // Valor por defecto
            });
        });

        // Realizar la petición al servidor
        const response = await fetch(`${ATTENTION_URL}/appointment/${citaSeleccionada.id_appointment}`, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(atencionData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error al guardar la atención (${response.status})`);
        }

        const data = await response.json();
        
        // Mostrar mensaje de éxito
        mostrarExito(data.message || "Atención registrada correctamente");

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalAtencion"));
        modal.hide();

        // Actualizar la lista de citas
        await cargarCitasDoctor();
        
    } catch (error) {
        console.error("Error al guardar atención:", error);
        mostrarError(error.message || "Error al procesar la atención. Por favor, intente nuevamente.");
    } finally {
        // Restaurar el botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = btnText;
    }
}

// 8. Inicialización
let eventListenersInitialized = false; // Bandera para controlar la inicialización de eventos

async function inicializarPagina() {
    // Verificar autenticación
    if (!verificarAutenticacion()) {
        return;
    }

    try {
        // Cargar la barra lateral
        await cargarSidebar();

        // Verificar que tenemos el ID del doctor
        const doctorId = localStorage.getItem(AUTH_KEYS.USER_ID);
        if (!doctorId) {
            throw new Error("No se encontró el ID del doctor. Por favor, inicia sesión nuevamente.");
        }

        console.log("ID del doctor obtenido:", doctorId);

        // Cargar citas y medicamentos en paralelo
        await Promise.all([
            cargarCitasDoctor(),
            cargarMedicamentos()
        ]);

        // Inicializar eventos solo una vez
        if (!eventListenersInitialized) {
            inicializarEventos();
            eventListenersInitialized = true;
        }

    } catch (error) {
        console.error("Error al inicializar la página:", error);
        mostrarError(error.message || "Error al cargar la aplicación");
    }
}

// Función para inicializar todos los eventos
function inicializarEventos() {
    // Configurar el botón de guardar atención (usando delegación de eventos)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btnGuardarAtencion') {
            e.preventDefault();
            guardarAtencion();
        }
        
        // Configurar el botón para agregar medicamento
        if (e.target && e.target.id === 'btnAgregarMedicamento') {
            e.preventDefault();
            e.stopPropagation(); // Prevenir doble ejecución
            agregarMedicamento();
        }
        
        // Configurar botones de eliminar medicamento
        if (e.target && e.target.closest('.btn-eliminar-medicamento')) {
            e.preventDefault();
            const item = e.target.closest('.medicamento-item');
            if (item) {
                item.remove();
                actualizarListaMedicamentos();
            }
        }
        
        // Configurar botón de limpiar formulario
        if (e.target && e.target.id === 'btnLimpiarFormulario') {
            e.preventDefault();
            limpiarFormularioAtencion();
        }
    });

    // Configurar el modal para que se reinicie al cerrarse
    const modalAtencion = document.getElementById('modalAtencion');
    if (modalAtencion) {
        // Remover cualquier listener previo para evitar duplicados
        const modalInstance = bootstrap.Modal.getInstance(modalAtencion);
        if (modalInstance) {
            modalInstance.dispose();
        }
        
        // Inicializar el modal de Bootstrap
        const modal = new bootstrap.Modal(modalAtencion);
        
        // Agregar evento para limpiar el formulario al cerrar
        modalAtencion.addEventListener('hidden.bs.modal', function () {
            limpiarFormularioAtencion();
        });
    }
}

// 9. Funciones de utilidad para el formulario
function limpiarFormularioAtencion() {
    // Limpiar campos del formulario
    const form = document.getElementById("formAtencion");
    if (form) {
        form.reset();
        form.classList.remove("was-validated");
    }

    // Limpiar lista de medicamentos
    const listaMedicamentos = document.getElementById("listaMedicamentos");
    if (listaMedicamentos) {
        listaMedicamentos.innerHTML = '';
        actualizarListaMedicamentos();
    }

    // Limpiar cita seleccionada
    citaSeleccionada = null;
    
    // Limpiar mensajes de error/éxito
    const mensajes = document.querySelectorAll('.alert-dismissible');
    mensajes.forEach(mensaje => {
        mensaje.remove();
    });
}

// 10. Eventos
document.addEventListener("DOMContentLoaded", inicializarPagina);
