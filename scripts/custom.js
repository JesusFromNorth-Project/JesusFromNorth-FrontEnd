//Se ejecuta cuando el html esta completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  //Recibe el selector calendar atributo id
  var calendarEl = document.getElementById("calendar");

  //Instancia FullCalendar.Calendar y se asigna a la variable calendar
  // y recibe todo el contenido para que lo envie al HTML
  var calendar = new FullCalendar.Calendar(calendarEl, {
    //Incluyendo Bootstrap 5
    themeSystem: "bootstrap5",

    //Crea los encabezados
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    locale: "es",

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
        paciente: "Donkey Kong",
        dni: "888999000",
        especialidad: "Fisioterapia",
        doctor: "Pedro Jiménez",
        descripcion: "Lesión en hombro por lanzar barriles",
        start: "2023-01-08T10:00:00",
        end: "2023-01-08T11:30:00",
      },
      {
        paciente: "Yoshi",
        dni: "111000999",
        especialidad: "Nutrición",
        doctor: "Ana Torres",
        descripcion: "Problemas digestivos por comer demasiadas frutas",
        start: "2023-01-12T13:00:00",
        end: "2023-01-12T14:30:00",
      },
      {
        paciente: "Toad",
        dni: "222333444",
        especialidad: "Neurología",
        doctor: "Javier Ruiz",
        descripcion: "Mareos al girar rápido con hongo",
        start: "2023-01-05T16:00:00",
        end: "2023-01-05T17:00:00",
      },
      {
        paciente: "Bowser Koopa",
        dni: "666777888",
        especialidad: "Odontología",
        doctor: "Laura Fernández",
        descripcion: "Dolor en colmillos por morder castillos",
        start: "2023-01-20T11:00:00",
        end: "2023-01-20T12:00:00",
      },
      {
        paciente: "Mario Bros",
        dni: "123456789",
        especialidad: "Cardiologia",
        doctor: "Roberto Mosquera",
        descripcion: "Cuando come su hongo no crece",
        start: "2023-01-13T10:30:00",
        end: "2023-01-13T12:30:00",
      },
      {
        paciente: "Princesa Peach",
        dni: "555444333",
        especialidad: "Dermatología",
        doctor: "Carlos Mendoza",
        descripcion: "Irritación en la piel por contacto con flores de fuego",
        start: "2023-01-10T14:00:00",
        end: "2023-01-10T15:30:00",
      },
      {
        paciente: "Luigi Bros",
        dni: "987654321",
        especialidad: "Traumatología",
        doctor: "María González",
        descripcion: "Dolor de espalda por saltar en tuberías",
        start: "2023-01-15T09:00:00",
        end: "2023-01-15T10:00:00",
      },
    ],

    //Personalizar contenido del evento
    eventContent: function (arg) {
      // Mostrar el nombre del paciente como título
      if (arg.event.extendedProps.paciente) {
        return {
          html: `<i>Paciente:</i> <b>${arg.event.extendedProps.paciente}</b>`,
        };
      }
      return { html: "<i>Sin título</i>" };
    },

    //Para visualizar el evento al darle click
    eventClick: function (info) {
      //Recibir el selector de la ventana modal
      const visualizarModal = new bootstrap.Modal(
        document.getElementById("visualizarModal")
      );


      //Enviar los datos del evento a la ventana modal
      document.getElementById("visualizar_fecha").innerText = info.event.start.toLocaleString();
      document.getElementById("visualizar_fecha_fin").innerText = info.event.end.toLocaleString();
      document.getElementById("visualizar_paciente").innerText =
        info.event.extendedProps.paciente || "Sin paciente";
      document.getElementById("visualizar_dni").innerText =
        info.event.extendedProps.dni;
      document.getElementById("visualizar_especialidad").innerText =
        info.event.extendedProps.especialidad;
      document.getElementById("visualizar_doctor").innerText =
        info.event.extendedProps.doctor;
      document.getElementById("visualizar_descripcion").innerText =
        info.event.extendedProps.descripcion || "Sin descripción";
      
        //Abrir ventana modal
      visualizarModal.show();
    },
  });

  calendar.render();
});
