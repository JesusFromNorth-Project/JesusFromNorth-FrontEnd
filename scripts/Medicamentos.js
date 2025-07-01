// =============================================
// 1. IMPORTACIONES
// =============================================
import { verificarAutenticacion, limpiarSesion, AUTH_KEYS } from "/scripts/utils/auth.js";

// =============================================
// 2. CONSTANTES Y URLS
// =============================================
const API_BASE_URL = "http://localhost:8080/system_clinic/api/v0.1/medicine";

// =============================================
// 3. FUNCIONES SINCRÓNICAS
// =============================================

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
  
  // Buscar el contenedor principal del contenido
  const mainContainer = document.querySelector(".contenido-principal");
  if (mainContainer) {
    mainContainer.insertAdjacentElement("afterbegin", alertDiv);
  } else {
    // Si no se encuentra, insertar al principio del body
    document.body.insertAdjacentElement("afterbegin", alertDiv);
  }
  
  // Eliminar el mensaje después de 5 segundos
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
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

// =============================================
// 4. FUNCIONES ASÍNCRONAS
// =============================================

/**
 * Obtiene la lista de medicamentos paginados
 * @param {number} page - Número de página a cargar
 * @returns {Promise<Array>} - Lista de medicamentos
 */
async function obtenerMedicamentos(page = 0) {
  try {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    const response = await fetch(`${API_BASE_URL}/list?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener la lista de medicamentos');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    mostrarError(error.message);
    return [];
  }
}

/**
 * Actualiza la tabla con la lista de medicamentos
 * @param {Array} medicamentos - Lista de medicamentos a mostrar
 */
function actualizarTablaMedicamentos(medicamentos) {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;

  // Limpiar tabla
  tbody.innerHTML = '';

  if (medicamentos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7" class="text-center">No se encontraron medicamentos</td>';
    tbody.appendChild(tr);
    return;
  }

  // Llenar tabla con los datos
  medicamentos.forEach((med, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${med.medicine_date || ''}</td>
      <td>${med.medicine_name || ''}</td>
      <td>${med.medicine_type || ''}</td>
      <td>${med.medicine_description || 'N/A'}</td>
      <td>${med.medicine_side_effect || 'N/A'}</td>
      <td>
        <button class="btn btn-primary btn-sm me-1 btn-editar" data-id="${med.id_medicine}">
          <i class="fa fa-pen"></i> Editar
        </button>
        <button class="btn btn-danger btn-sm" data-id="${med.id_medicine}">
          <i class="fa fa-trash"></i> Eliminar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Carga y muestra los medicamentos en la tabla
 * @param {number} page - Número de página a cargar (por defecto 0)
 */
async function cargarMedicamentos(page = 0) {
  try {
    const medicamentos = await obtenerMedicamentos(page);
    actualizarTablaMedicamentos(medicamentos);
  } catch (error) {
    console.error('Error al cargar medicamentos:', error);
    mostrarError('Error al cargar la lista de medicamentos');
  }
}

/**
 * Carga dinámicamente el sidebar según el rol del usuario
 */
async function cargarSidebar() {
	try {
		const role = localStorage.getItem("role");
		const sidebarPath = role === "ADMIN" ? "/components/SidebarAdmin.html" : "/components/Sidebar.html";

		const response = await fetch(sidebarPath);
		if (!response.ok) {
			throw new Error("Error al cargar el sidebar");
		}

		const html = await response.text();
		const sidebar = document.getElementById("sidebar-placeholder");

		if (!sidebar) {
			console.error('No se encontró el elemento con id "sidebar-placeholder"');
			return;
		}

		sidebar.innerHTML = html;
		document.body.classList.add("sidebar-visible");

		// Resaltar enlace activo
		const path = window.location.pathname.split("/").pop().toLowerCase();
		const links = sidebar.querySelectorAll("a.nav-link");

		links.forEach((link) => {
			const href = link.getAttribute("href")?.toLowerCase();
			if (href && href.includes(path)) {
				link.classList.remove("text-dark");
				link.classList.add("text-primary", "fw-bold");
			}
		});
	} catch (error) {
		console.error("Error al cargar sidebar:", error);
		mostrarError("Error al cargar la interfaz");
	}
}

// =============================================
// 5. INICIALIZACIÓN DEL DOM
// =============================================

/**
 * Valida los campos del formulario de medicamento
 * @param {Object} formData - Datos del formulario
 * @returns {{valido: boolean, errores: string[]}} - Resultado de la validación
 */
function validarFormulario(formData) {
	const errores = [];
	const camposRequeridos = ["medicine_date", "medicine_name", "medicine_type"];

	// Validar campos requeridos
	camposRequeridos.forEach((campo) => {
		if (!formData[campo]?.trim()) {
			const nombreCampo = campo.replace("_", " ");
			errores.push(`El campo ${nombreCampo} es obligatorio`);
		}
	});

	// Validar formato de fecha (YYYY-MM-DD)
	if (formData.medicine_date) {
		const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!fechaRegex.test(formData.medicine_date)) {
			errores.push("El formato de fecha no es válido (YYYY-MM-DD)");
		}
	}

	// Validar longitud máxima de campos de texto
	const validacionesLongitud = [
		{ campo: "medicine_name", max: 100, nombre: "nombre" },
		{ campo: "medicine_type", max: 50, nombre: "tipo" },
		{ campo: "medicine_description", max: 255, nombre: "descripción" },
		{ campo: "medicine_side_effect", max: 255, nombre: "efectos secundarios" },
	];

	validacionesLongitud.forEach(({ campo, max, nombre }) => {
		if (formData[campo] && formData[campo].length > max) {
			errores.push(`El campo ${nombre} no debe exceder los ${max} caracteres`);
		}
	});

	return {
		valido: errores.length === 0,
		errores,
	};
}

/**
 * Envía los datos del medicamento a la API
 * @param {Object} datosMedicamento - Datos del medicamento a guardar
 * @returns {Promise<Object>} - Respuesta de la API
 */
async function enviarMedicamento(datosMedicamento) {
	try {
		const token = localStorage.getItem(AUTH_KEYS.TOKEN);
		const adminId = localStorage.getItem("adminId"); // Asumiendo que el ID del admin está en localStorage

		if (!adminId) {
			throw new Error("No se encontró el ID del administrador");
		}

		const url = `${API_BASE_URL}/${adminId}`;

		const respuesta = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(datosMedicamento),
		});

		if (!respuesta.ok) {
			const errorData = await respuesta.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al guardar el medicamento");
		}

		return await respuesta.json();
	} catch (error) {
		console.error("Error al enviar el medicamento:", error);
		throw error;
	}
}

/**
 * Configura los manejadores de eventos del formulario
 */
function configurarEventosFormulario() {
  const formMedicamento = document.getElementById("form-medicamento");
  
  if (!formMedicamento) {
    console.error('No se encontró el formulario con id "form-medicamento"');
    return;
  }

  formMedicamento.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    let botonGuardar = null;
    let textoOriginal = '';
    
    try {
      // Obtener datos del formulario
      const formData = {
        medicine_date: formMedicamento.elements['medicine_date']?.value,
        medicine_name: formMedicamento.elements['medicine_name']?.value.trim(),
        medicine_type: formMedicamento.elements['medicine_type']?.value.trim(),
        medicine_description: formMedicamento.elements['medicine_description']?.value.trim() || null,
        medicine_side_effect: formMedicamento.elements['medicine_side_effect']?.value.trim() || null
      };

      // Validar formulario
      const { valido, errores } = validarFormulario(formData);

      if (!valido) {
        mostrarError(errores.join("<br>"));
        return;
      }

      // Mostrar indicador de carga
      botonGuardar = formMedicamento.querySelector('button[type="submit"]');
      if (botonGuardar) {
        textoOriginal = botonGuardar.innerHTML;
        botonGuardar.disabled = true;
        botonGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
      }

      // Enviar datos a la API
      const respuesta = await enviarMedicamento(formData);

      // Mostrar mensaje de éxito
      mostrarExito("Medicamento guardado correctamente");

      // Limpiar formulario
      formMedicamento.reset();

      // Recargar la lista de medicamentos (si existe la función)
      if (typeof cargarMedicamentos === "function") {
        await cargarMedicamentos();
      }

      return respuesta;
    } catch (error) {
      console.error("Error al guardar el medicamento:", error);
      mostrarError(error.message || "Error al guardar el medicamento");
    } finally {
      // Restaurar botón
      if (botonGuardar) {
        botonGuardar.disabled = false;
        botonGuardar.innerHTML = textoOriginal;
      }
    }
  });
}

// Variable para almacenar el ID del medicamento en edición
let medicamentoEditando = null;

/**
 * Activa el modo de edición en el formulario
 * @param {Object} medicamento - Datos del medicamento a editar
 */
function activarModoEdicion(medicamento) {
  const form = document.getElementById("form-medicamento");
  if (!form) return;

  // Guardar ID del medicamento
  medicamentoEditando = medicamento.id_medicine;

  // Llenar formulario con los datos
  if (form.elements['medicine_date']) form.elements['medicine_date'].value = medicamento.medicine_date || '';
  if (form.elements['medicine_name']) form.elements['medicine_name'].value = medicamento.medicine_name || '';
  if (form.elements['medicine_type']) form.elements['medicine_type'].value = medicamento.medicine_type || '';
  if (form.elements['medicine_description']) form.elements['medicine_description'].value = medicamento.medicine_description || '';
  if (form.elements['medicine_side_effect']) form.elements['medicine_side_effect'].value = medicamento.medicine_side_effect || '';

  // Cambiar el botón de guardar por actualizar/cancelar
  const btnContainer = form.querySelector('.btn-container');
  if (btnContainer) {
    btnContainer.innerHTML = `
      <button type="button" class="btn btn-success me-2" id="btn-actualizar">
        <i class="fa fa-save"></i> Actualizar
      </button>
      <button type="button" class="btn btn-secondary" id="btn-cancelar">
        <i class="fa fa-times"></i> Cancelar
      </button>
    `;

    // Configurar eventos de los nuevos botones
    document.getElementById('btn-actualizar').addEventListener('click', async () => {
      await actualizarMedicamento();
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => {
      cancelarEdicion();
    });
  }
}

/**
 * Cancela el modo de edición y restaura el formulario
 */
function cancelarEdicion() {
  const form = document.getElementById("form-medicamento");
  if (!form) return;

  // Restaurar botón de guardar
  const btnContainer = form.querySelector('.btn-container');
  if (btnContainer) {
    btnContainer.innerHTML = `
      <div class="col-12 text-end btn-container">
        <button type="submit" class="btn btn-primary mt-2 px-4">
          <i class="fa fa-save"></i> Guardar
        </button>
      </div>
    `;
  }

  // Limpiar formulario
  form.reset();
  medicamentoEditando = null;
}

/**
 * Actualiza un medicamento existente
 */
async function actualizarMedicamento() {
  const form = document.getElementById("form-medicamento");
  if (!form || !medicamentoEditando) return;

  try {
    // Obtener datos del formulario
    const formData = {
      medicine_date: form.elements['medicine_date']?.value,
      medicine_name: form.elements['medicine_name']?.value.trim(),
      medicine_type: form.elements['medicine_type']?.value.trim(),
      medicine_description: form.elements['medicine_description']?.value.trim() || null,
      medicine_side_effect: form.elements['medicine_side_effect']?.value.trim() || null
    };

    // Validar formulario
    const { valido, errores } = validarFormulario(formData);
    if (!valido) {
      mostrarError(errores.join("<br>"));
      return;
    }

    // Mostrar indicador de carga
    const btnActualizar = document.getElementById('btn-actualizar');
    const textoOriginal = btnActualizar?.innerHTML || '';
    if (btnActualizar) {
      btnActualizar.disabled = true;
      btnActualizar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...';
    }

    // Enviar actualización
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    const response = await fetch(`${API_BASE_URL}/${medicamentoEditando}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el medicamento');
    }

    // Mostrar mensaje de éxito y actualizar lista
    mostrarExito('Medicamento actualizado correctamente');
    await cargarMedicamentos(0);
    cancelarEdicion();

  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    mostrarError(error.message || 'Error al actualizar el medicamento');
  } finally {
    // Restaurar botón
    const btnActualizar = document.getElementById('btn-actualizar');
    if (btnActualizar) {
      btnActualizar.disabled = false;
      btnActualizar.innerHTML = textoOriginal;
    }
  }
}

/**
 * Configura los manejadores de eventos de la tabla
 */
function configurarEventosTabla() {
  // Delegación de eventos para los botones de editar
  document.addEventListener('click', async (e) => {
    // Manejar clic en botón editar
    if (e.target.closest('.btn-editar')) {
      const btn = e.target.closest('.btn-editar');
      const id = btn.dataset.id;
      if (id) {
        try {
          const token = localStorage.getItem(AUTH_KEYS.TOKEN);
          const response = await fetch(`${API_BASE_URL}/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            activarModoEdicion(result.data);
          } else {
            throw new Error('Error al cargar los datos del medicamento');
          }
        } catch (error) {
          console.error('Error:', error);
          mostrarError(error.message);
        }
      }
    }
  });

  // Configurar búsqueda
  const buscarInput = document.getElementById("buscar-medicamento-nombre");
  if (buscarInput) {
    buscarInput.addEventListener("input", (e) => {
      // Lógica de búsqueda
    });
  }
}

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener("DOMContentLoaded", async () => {
	// Verificar autenticación
	if (!verificarAutenticacion()) {
		return;
	}

	try {
		// Cargar el sidebar
		await cargarSidebar();

		// Configurar el nombre de usuario en el sidebar
		const username = localStorage.getItem(AUTH_KEYS.USERNAME);
		if (username) {
			const usernameElement = document.getElementById("username");
			if (usernameElement) {
				usernameElement.textContent = username;
			}
		}

		// Configurar eventos de la interfaz
		configurarEventosFormulario();
		configurarEventosTabla();

		// Cargar lista inicial de medicamentos
		await cargarMedicamentos(0);

		// Configurar cierre de sesión
		const logoutLink = document.getElementById("logout-link");
		if (logoutLink) {
			logoutLink.addEventListener("click", (e) => {
				e.preventDefault();
				limpiarSesion();
				window.location.href = "/pages/Login.html";
			});
		}

		// Cargar datos iniciales
		// await cargarMedicamentos();
	} catch (error) {
		console.error("Error al inicializar la aplicación:", error);
		mostrarError("Error al cargar la aplicación");
	}
});
