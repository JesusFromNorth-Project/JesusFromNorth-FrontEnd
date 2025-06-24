// 1. IMPORTACIONES
import { AUTH_KEYS, limpiarSesion } from "./utils/auth.js";

// 2. CONSTANTES Y URLS
const API_URL = "http://localhost:8080/system_clinic/api/v0.1";

// 3. FUNCIONES SÍNCRONAS
/**
 * Muestra un mensaje de error en la interfaz
 * @param {string} mensaje - Mensaje de error a mostrar
 */
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

/**
 * Restablece el estado del botón de inicio de sesión
 * @param {HTMLButtonElement} btnLogin - Elemento del botón de inicio de sesión
 */
function resetLoginButton(btnLogin) {
  btnLogin.disabled = false;
  btnLogin.textContent = "Iniciar sesión";
}

// 4. FUNCIONES ASÍNCRONAS
/**
 * Realiza el proceso de autenticación
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @param {HTMLButtonElement} btnLogin - Elemento del botón de inicio de sesión
 */
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

      // 2. Verificar si es administrador o doctor
      const adminId = data.data?.id_admin;
      const usernameToStore = data.data?.username || username;

      if (adminId) {
        // Es administrador
        localStorage.setItem(AUTH_KEYS.USER_ID, adminId);
      } else {
        // Es doctor
        console.log("Iniciando sesión como doctor");
        localStorage.setItem(AUTH_KEYS.USER_ID, usernameToStore);
      }

      // 3. Guardar la información de autenticación común
      localStorage.setItem(AUTH_KEYS.USERNAME, usernameToStore);
      localStorage.setItem(AUTH_KEYS.ROLE, data.role || "user");

      console.log("Datos guardados en localStorage:", {
        userId: adminId || usernameToStore,
        username: usernameToStore,
        role: data.role || "user",
        isAdmin: !!adminId,
      });

      // Redirigir al dashboard
      window.location.href = "Dashboard.html";
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
// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  // Limpiar sesión previa al cargar la página de login
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
