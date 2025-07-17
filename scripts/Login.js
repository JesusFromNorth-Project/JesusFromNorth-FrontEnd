// 1. IMPORTACIONES
import { AUTH_KEYS, limpiarSesion } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_URL = "http://localhost:8080/system_clinic/api/v0.1";

// 3. FUNCIONES SÍNCRONAS
function mostrarError(mensaje) {
	const errorDiv = document.getElementById("errorMessage");
	if (errorDiv) {
		errorDiv.textContent = mensaje;
		errorDiv.style.display = "block";
		// Ocultar el mensaje después de 5 segundos
		setTimeout(() => {
			errorDiv.style.display = "none";
		}, 5000);
	} else {
		// Fallback si no existe el div de error
		console.error("Error:", mensaje);
		alert(mensaje);
	}
}

function resetLoginButton(btnLogin) {
	btnLogin.disabled = false;
	btnLogin.textContent = "Iniciar sesión";
}

async function iniciarSesion(username, password, btnLogin) {
	try {
		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		});

		const data = await response.json();

		if (response.ok) {
			// 1. Guardar el token
			localStorage.setItem(AUTH_KEYS.TOKEN, data.token);

			// 2. Obtener el ID del usuario (admin o doctor)
			const userId = data.data?.id_admin || data.data?.id_doctor;
			const usernameToStore = data.data?.username || username;

			if (!userId) {
				throw new Error("No se pudo obtener el ID del usuario");
			}

			// 3. Guardar la información de autenticación
			localStorage.setItem(AUTH_KEYS.USER_ID, userId);
			localStorage.setItem(AUTH_KEYS.USERNAME, usernameToStore);
			localStorage.setItem(AUTH_KEYS.ROLE, data.role || "user");

			console.log("Datos de autenticación guardados:", {
				userId: userId,
				username: usernameToStore,
				role: data.role || "user",
			});

			console.log("Datos guardados en localStorage:", {
				userId: userId,
				username: usernameToStore,
				role: data.role || "user",
				isAdmin: data.role === "ADMIN",
			});

			const userRole = data.role || "user";
			if (userRole.toLowerCase() === "admin") {
				window.location.href = "Dashboard.html";
			} else {
				window.location.href = "DashboardDoctor.html";
			}
		} else {
			mostrarError(data.message || "Credenciales incorrectas");
			resetLoginButton(btnLogin);
		}
	} catch (error) {
		console.error("Error en la autenticación:", error);
		mostrarError("Error de conexión con el servidor");
		resetLoginButton(btnLogin);
	}
}

// 5. EVENTOS Y ASIGNACIONES GLOBALES
document.addEventListener("DOMContentLoaded", () => {
	limpiarSesion();

	const form = document.getElementById("loginForm");
	if (!form) {
		console.error("No se encontró el formulario de login");
		return;
	}

	const btnLogin = form.querySelector("button[type='submit']");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Validar que el botón exista
		if (!btnLogin) {
			console.error("No se encontró el botón de envío");
			return;
		}

		// Deshabilitar el botón para evitar múltiples envíos
		btnLogin.disabled = true;
		btnLogin.innerHTML =
			'<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando...';

		const username = form.username?.value.trim();
		const password = form.password?.value;

		// Validar campos vacíos
		if (!username || !password) {
			mostrarError("Por favor ingrese usuario y contraseña");
			resetLoginButton(btnLogin);
			return;
		}

		// Iniciar proceso de autenticación
		await iniciarSesion(username, password, btnLogin);
	});
});
