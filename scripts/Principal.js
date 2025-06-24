// Mostrar el modal cuando la página se carga completamente
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia del modal
    var myModal = new bootstrap.Modal(document.getElementById('imagenModal'));
    
    // Mostrar el modal
   // myModal.show();
    
    // Opcional: Guardar en localStorage para no mostrar el modal en futuras visitas
    // if(!localStorage.getItem('modalShown')) {
    //     myModal.show();
    //     localStorage.setItem('modalShown', 'true');
    // }
});