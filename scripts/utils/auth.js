function verificarAutenticacion() {
    const adminId = localStorage.getItem("adminId");
    const adminName = localStorage.getItem("adminName");
    
    if (!adminId || !adminName) {
        // Limpiar cualquier dato de sesión
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminName");
        
        // Redirigir a la página de login
        window.location.href = "/pages/Login.html";
        return false;
    }
    
    return true;
}

export { verificarAutenticacion };
