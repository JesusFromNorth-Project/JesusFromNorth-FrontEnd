const API_URL = "http://localhost:5080/system_clinic/api/v0.1";

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = "block";
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    } else {
        alert(mensaje); // Fallback si no existe el div de error
    }
}

// Esperar a que el DOM esté listo
window.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("loginForm");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = form.username.value;
		const password = form.password.value;
		try {
			const endpoint = "/auth/login";
			const session = {
				username: username,
				password: password,
			};
			const res = await fetch(url + endpoint, {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(session),
			});
			if (res.ok) {
				// Guardar el nombre de usuario en localStorage para mostrarlo en el sidebar
				const data = await res.json();
				// Guardar el token JWT
				localStorage.setItem("adminId", data.token);
				localStorage.setItem("role", data.role);
				localStorage.setItem("adminName", username);
				window.location.href = "Dashboard.html";
			} else {
				const data = await res.json();
				alert(data.message || "Credenciales incorrectas");
			}
		} catch (error) {
			alert("Error de conexión con el servidor");
		}
	});
});
