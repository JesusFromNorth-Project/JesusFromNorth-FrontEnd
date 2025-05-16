const especialidadApiUrl = "http://localhost:8080/specialty/";
const especialidadListUrl = "http://localhost:8080/specialty/list";

// Renderizar tabla de especialidades desde backend
async function renderTabla() {
	try {
		const res = await fetch(especialidadListUrl);
		const data = await res.json();
		const especialidades = data.data || [];
		const tbody = document.getElementById("tablaEspecialidades");
		tbody.innerHTML = "";
		if (especialidades.length === 0) {
			tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay especialidades registradas.</td></tr>';
			return;
		}
		especialidades.forEach((esp, idx) => {
			const tr = document.createElement("tr");
			tr.innerHTML = `
				<td>${idx + 1}</td>
				<td>${esp.specialty_name}</td>
				<td style="text-align: center;">
					<button class="btn btn-danger btn-sm" onclick="eliminarEspecialidad('${esp.id_specialty}')">Eliminar</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
	} catch (error) {
		alert("Error al cargar especialidades");
	}
}

// Guardar especialidad
window.addEventListener("DOMContentLoaded", () => {
	document.getElementById("especialidadForm").addEventListener("submit", async function (e) {
		e.preventDefault();
		const especialidad = this.especialidad.value;
		if (!especialidad) {
			alert("Completa el campo de especialidad");
			return;
		}
		const body = { specialty_name: especialidad };
		try {
			const res = await fetch(especialidadApiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (res.ok) {
				alert("Especialidad guardada exitosamente");
				this.reset();
				renderTabla();
			} else {
				const data = await res.json();
				alert(data.message || "Error al guardar especialidad");
			}
		} catch (error) {
			alert("Error de conexión con el servidor");
		}
	});
	// Render inicial
	renderTabla();
});

// Eliminar especialidad
async function eliminarEspecialidad(id) {
	if (!confirm("¿Seguro que deseas eliminar esta especialidad?")) return;
	try {
		const res = await fetch(`${especialidadApiUrl}${id}`, { method: "DELETE" });
		if (res.status === 204) {
			alert("Especialidad eliminada exitosamente");
			renderTabla();
		} else {
			const data = await res.json();
			alert(data.message || "Error al eliminar especialidad");
		}
	} catch (error) {
		alert("Error de conexión con el servidor");
	}
}
