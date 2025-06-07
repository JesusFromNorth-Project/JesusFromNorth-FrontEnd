//Se ejecuta cuando el html esta completamente cargado
document.addEventListener("DOMContentLoaded", function () {

  //Recibe el selector calendar atributo id
  var calendarEl = document.getElementById("calendar");

  //Instancia FullCalendar.Calendar y se asigna a la variable calendar
  // y recibe todo el contenido para que lo envie al HTML
  var calendar = new FullCalendar.Calendar(calendarEl, {

    //Incluyendo Bootstrap 5
    themeSystem: 'bootstrap5',

    //Crea los encabezados
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    locale: 'es',

    //Define la fecha actual (MUESTRA)
    initialDate: "2023-01-12",
    //initialDate: "2025-06-06",

    //Permite hacer click en los dias de semana
    navLinks: true, // can click day/week names to navigate views

    //Permite hacer click y arrastrar el mouse sobre varios dias
    selectable: true,

    //Indica visualmente area seleccionada antes de que el usuario suelte boton de mouse para confirmar seleccion
    selectMirror: true,


    //Permite cambiar tamaño de los eventos horizontalmente y arrastrar directamente en el calendario
    editable: true,

    //Permite agregar muchos eventos en un determinado día, si esta en true
    dayMaxEvents: true, // allow "more" link when too many events

    //Eventos estáticos ejemplos
    //**IMPORTANTE: En esta parte se consumiran las API's para citas
    events: [
      {
        title: "All Day Event",
        start: "2023-01-01",
      },
      {
        title: "Long Event",
        start: "2023-01-07",
        end: "2023-01-10",
      },
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2023-01-09T16:00:00",
      },
      {
        groupId: 999,
        title: "Repeating Event",
        start: "2023-01-16T16:00:00",
      },
      {
        title: "Conference",
        start: "2023-01-11",
        end: "2023-01-13",
      },
      {
        title: "Meeting",
        start: "2023-01-12T10:30:00",
        end: "2023-01-12T12:30:00",
      },
      {
        title: "Lunch",
        start: "2023-01-12T12:00:00",
      },
      {
        title: "Meeting",
        start: "2023-01-12T14:30:00",
      },
      {
        title: "Happy Hour",
        dni: "123456789",
        start: "2023-01-12T17:30:00",
      },
      {
        title: "Dinner",
        start: "2023-01-12T20:00:00",
      },
      {
        title: "Birthday Party",
        start: "2023-01-13T07:00:00",
      },
      {
        title: "Click for Google",
        url: "http://google.com/",
        start: "2023-01-28",
      },
    ],

    eventClick: function (info) {
      document.getElementById('tituloEvento').value = info.event.title || '';
      document.getElementById('eventModalLabel').textContent = 'Detalle del evento';

      // Si el evento es all-day, muestra solo la fecha, si no, muestra fecha y hora
      let fecha = info.event.start;
      let fechaLocal = '';
      if (fecha) {
        // Si el evento tiene hora (no all-day), muestra fecha y hora
        if (!info.event.allDay) {
          fechaLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        } else {
          // Si es all-day, solo la fecha (sin hora)
          fechaLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 10) + 'T00:00';
        }
      }
      document.getElementById('fechaSeleccionada').value = fechaLocal;

      document.getElementById('dniPaciente').value = info.event.extendedProps.dni || '';
      document.getElementById('especialidad').value = info.event.extendedProps.especialidad || '';
      document.getElementById('doctor').value = info.event.extendedProps.doctor || '';
      document.getElementById('descripcion').value = info.event.extendedProps.descripcion || '';

      var modal = new bootstrap.Modal(document.getElementById('eventModal'));
      modal.show();
    },
    select: function (info) {
      document.getElementById('tituloEvento').value = '';
      document.getElementById('dniPaciente').value = '';
      document.getElementById('especialidad').selectedIndex = 0;
      document.getElementById('doctor').selectedIndex = 0;
      document.getElementById('descripcion').value = '';

      // Muestra la fecha/hora en el input datetime-local
      let fecha = info.start;
      let fechaLocal = fecha
        ? new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
        : '';
      document.getElementById('fechaSeleccionada').value = fechaLocal;

      document.getElementById('eventModalLabel').textContent = 'Agendar cita';

      var modal = new bootstrap.Modal(document.getElementById('eventModal'));
      modal.show();
    }
  });

  calendar.render();

  // Maneja el envío del formulario para crear un nuevo evento
  document.getElementById('appointmentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var title = document.getElementById('tituloEvento').value || 'Nueva cita';
    var fechaEvento = document.getElementById('fechaSeleccionada').value;
    var dni = document.getElementById('dniPaciente').value;
    var especialidad = document.getElementById('especialidad').value;
    var doctor = document.getElementById('doctor').value;
    var descripcion = document.getElementById('descripcion').value;

    if (!fechaEvento) {
      alert('Debes seleccionar la fecha y hora.');
      return;
    }

    // Validar si ya existe un evento en la misma fecha y hora (robusto)
    var eventos = calendar.getEvents();
    var existe = eventos.some(function (ev) {
      if (!ev.start) return false;
      // Normaliza ambos a minutos para evitar problemas de segundos/milisegundos
      var evTime = new Date(ev.start);
      var evStr = evTime.getFullYear() + '-' +
        String(evTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(evTime.getDate()).padStart(2, '0') + 'T' +
        String(evTime.getHours()).padStart(2, '0') + ':' +
        String(evTime.getMinutes()).padStart(2, '0');
      return evStr === fechaEvento;
    });

    if (existe) {
      alert('Ya existe una cita en esa fecha y hora.');
      return;
    }

    // Agrega el evento al calendario
    calendar.addEvent({
      title: title,
      start: fechaEvento,
      extendedProps: {
        dni: dni,
        especialidad: especialidad,
        doctor: doctor,
        descripcion: descripcion
      }
    });

    // Cierra el modal
    var modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
    modal.hide();
  });

});