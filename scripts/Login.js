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
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const btnLogin = form.querySelector("button[type='submit']");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Deshabilitar el botón para evitar múltiples envíos
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando...';
        
        const username = form.username.value.trim();
        const password = form.password.value;

        // Validar campos vacíos
        if (!username || !password) {
            mostrarError("Por favor ingrese usuario y contraseña");
            btnLogin.disabled = false;
            btnLogin.textContent = "Iniciar sesión";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar la información de autenticación
                localStorage.setItem("adminId", data.token);
                localStorage.setItem("adminName", data.username || username);
                
                // Guardar el rol del usuario si está disponible
                if (data.role) {
                    localStorage.setItem("userRole", data.role);
                }
                
                // Redirigir al dashboard
                window.location.href = "Dashboard.html";
            } else {
                mostrarError(data.message || "Credenciales incorrectas");
                btnLogin.disabled = false;
                btnLogin.textContent = "Iniciar sesión";
            }
        } catch (error) {
            console.error("Error en la autenticación:", error);
            mostrarError("Error de conexión con el servidor");
            btnLogin.disabled = false;
            btnLogin.textContent = "Iniciar sesión";
        }
    });
});
