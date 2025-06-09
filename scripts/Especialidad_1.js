const apiUrl = "http://localhost:8080/system_clinic/api/v0.1/specialty/";

// Verificar autenticación
function verificarAutenticacion() {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
        window.location.href = "/pages/Login.html";
        return false;
    }
    return true;
}

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.main-content').insertAdjacentElement('afterbegin', alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function mostrarExito(mensaje) {
    mostrarMensaje(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'danger');
}

// Renderizar tabla de especialidades
async function renderTabla() {
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${apiUrl}list`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("adminId")}`
            }
        });
        
        if (res.status === 401 || res.status === 403) {
            // Token expirado o inválido
            localStorage.removeItem("adminId");
            localStorage.removeItem("adminName");
            window.location.href = "/pages/Login.html";
            return;
        }
        
        const response = await res.json();
        const especialidades = response.data || [];

        const tbody = document.getElementById("tablaEspecialidades");
        tbody.innerHTML = "";
        
        if (especialidades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay especialidades registradas.</td></tr>';
            return;
        }

        especialidades.forEach((esp) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${esp.id_specialty || ''}</td>
                <td>${esp.specialty_name || ''}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEspecialidad('${esp.id_specialty || ''}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn btn-info btn-sm ms-2" onclick="verServicios('${esp.id_specialty || ''}')">
                        <i class="fas fa-list"></i> Ver Servicios
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error al cargar las especialidades");
    }
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
    if (!verificarAutenticacion()) return;

    // Configurar formulario
    document.getElementById("especialidadForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const specialty_name = this.specialty_name.value.trim();
        
        if (!specialty_name) {
            mostrarError("El nombre de la especialidad es requerido");
            return;
        }

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("adminId")}`
                },
                body: JSON.stringify({
                    name_specialty: specialty_name
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                mostrarExito("Especialidad guardada exitosamente");
                this.reset();
                await renderTabla();
            } else {
                mostrarError(data.message || "Error al guardar la especialidad");
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError("Error de conexión con el servidor");
        }
    });

    // Cargar datos iniciales
    renderTabla();
});

// Eliminar especialidad
async function eliminarEspecialidad(id) {
    if (!verificarAutenticacion()) return;
    
    if (!confirm("¿Está seguro de eliminar esta especialidad?")) return;

    try {
        const res = await fetch(`${apiUrl}${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("adminId")}`
            }
        });

        if (res.status === 204) {
            mostrarExito("Especialidad eliminada exitosamente");
            await renderTabla();
        } else {
            const data = await res.json();
            mostrarError(data.message || "Error al eliminar la especialidad");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error de conexión con el servidor");
    }
}

// Ver servicios de la especialidad
async function verServicios(id) {
    if (!verificarAutenticacion()) return;

    try {
        const res = await fetch(`${apiUrl}/${id}/services`);
        const data = await res.json();
        
        if (res.ok) {
            const servicios = data.data.services || [];
            // Aquí puedes mostrar los servicios en un modal o en otra sección
            console.log('Servicios:', servicios);
        } else {
            mostrarError(data.message || "Error al obtener los servicios");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError("Error de conexión con el servidor");
    }
}