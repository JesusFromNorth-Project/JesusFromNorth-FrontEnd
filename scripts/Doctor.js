const apiUrl = "http://localhost:8080/doctor";
const specialtyUrl = "http://localhost:8080/specialty/list";

window.addEventListener("DOMContentLoaded", () => {
	// Cargar especialidades en el select
	fetch(specialtyUrl)
		.then((res) => res.json())
		.then((especialidades) => {
			const select = document.getElementById("selectEspecialidad");
			especialidades.forEach((esp) => {
				const option = document.createElement("option");
				option.value = esp.id_specialty;
				option.textContent = esp.specialty_name;
				select.appendChild(option);
			});
		})
		.catch(() => {
			alert("No se pudieron cargar las especialidades");
		});

	const form = document.querySelector(".card-body form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const nombre = form.nombre.value;
		const apellido = form.apellido.value;
		const cmp = form.cmp.value;
		const correo = form.correo.value;
		const telefono = form.telefono.value;
		const specialistId = form.especialidad.value;

		const adminId = localStorage.getItem("adminId");
		if (!adminId) {
			alert("No se encontró el ID del administrador.");
			return;
		}
		if (!specialistId) {
			alert("Debes seleccionar una especialidad.");
			return;
		}

		const registerDoctorDTO = {
			name: nombre,
			lastname: apellido,
			cmp: cmp,
			email: correo,
			phone: telefono,
			username: cmp,
			password: cmp,
		};

		try {
			const endpoint = `/save/assignAdmin/${adminId}/assignSpecialty/${specialistId}`;
			const res = await fetch(apiUrl + endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(registerDoctorDTO),
			});
			if (res.ok) {
				alert("Doctor registrado exitosamente");
				form.reset();
			} else {
				const data = await res.json();
				alert(data.message || "Error al registrar doctor");
			}
		} catch (error) {
			alert("Error de conexión con el servidor");
		}
	});
});
