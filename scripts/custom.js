//Se ejecuta cuando el html esta completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  //Recibe el selector calendar atributo id
  var calendarEl = document.getElementById("calendar");

  //Recibir el selector de la ventana modal
  const registrarModal = new bootstrap.Modal(
    document.getElementById("registrarModal")
  );

  //Recibe el selector "msgViewEvento"
  const msgViewEvento = document.getElementById("msgViewEvento");

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
    initialDate: "2025-06-12",
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
        paciente: "Donkey Kong",
        dni: "888999000",
        especialidad: "Fisioterapia",
        doctor: "Pedro Jiménez",
        descripcion: "Lesión en hombro por lanzar barriles",
        start: "2025-06-08T10:00:00",
        end: "2025-06-08T11:30:00",
      },
      {
        paciente: "Yoshi",
        dni: "111000999",
        especialidad: "Nutrición",
        doctor: "Ana Torres",
        descripcion: "Problemas digestivos por comer demasiadas frutas",
        start: "2025-06-12T13:00:00",
        end: "2025-06-12T14:30:00",
      },
      {
        paciente: "Toad",
        dni: "222333444",
        especialidad: "Neurología",
        doctor: "Javier Ruiz",
        descripcion: "Mareos al girar rápido con hongo",
        start: "2025-06-05T16:00:00",
        end: "2025-06-05T17:00:00",
      },
      {
        paciente: "Bowser Koopa",
        dni: "666777888",
        especialidad: "Odontología",
        doctor: "Laura Fernández",
        descripcion: "Dolor en colmillos por morder castillos",
        start: "2025-06-20T11:00:00",
        end: "2025-06-20T12:00:00",
      },
      {
        paciente: "Mario Bros",
        dni: "123456789",
        especialidad: "Cardiologia",
        doctor: "Carlos Mendoza",
        descripcion: "Cuando come su hongo no crece",
        start: "2025-06-13T10:30:00",
        end: "2025-06-13T12:30:00",
      },
      {
        paciente: "Princesa Peach",
        dni: "555444333",
        especialidad: "Dermatología",
        doctor: "Carlos Mendoza",
        descripcion: "Irritación en la piel por contacto con flores de fuego",
        start: "2025-06-10T14:00:00",
        end: "2025-06-10T15:30:00",
      },
      {
        paciente: "Luigi Bros",
        dni: "987654321",
        especialidad: "Traumatología",
        doctor: "Ana Torres",
        descripcion: "Dolor de espalda por saltar en tuberías",
        start: "2025-06-15T09:00:00",
        end: "2025-06-15T10:00:00",
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
      //registrarModal esta arriba en el document listener,
      // por lo que no es necesario volver a declararlo

      //Almacenar el evento actual para edición (Esto lo use para simular en funcionamiento de editar evento)
      window.eventoActual = info.event;

      //Evitar que se abra la ventana modal al hacer click en el evento
      info.jsEvent.preventDefault();

      //Recibir el selector de la ventana modal
      const visualizarModal = new bootstrap.Modal(
        document.getElementById("visualizarModal")
      );

      //**IMPORTANTE: Si modificas algo acá que se congruente con el html
      //Enviar los datos del evento a la ventana modal mostrar detalle de cita
      document.getElementById("visualizar_fecha").innerText =
        info.event.start.toLocaleString();
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

      //Enviar los datos del evento a la ventana modal editar cita
      document.getElementById("edit_fecha").value = convertirFecha(
        info.event.start
      );
      document.getElementById("edit_paciente").value =
        info.event.extendedProps.paciente;
      document.getElementById("edit_dni").value = info.event.extendedProps.dni;
      document.getElementById("edit_especialidad").value =
        info.event.extendedProps.especialidad;
      document.getElementById("edit_doctor").value =
        info.event.extendedProps.doctor;
      document.getElementById("edit_descripcion").value =
        info.event.extendedProps.descripcion;

      //Abrir ventana modal para ver detalle de cita
      visualizarModal.show();
    },

    //Para registrar un evento al hacer click en un día
    select: function (info) {
      //para captar fecha de calendario usando esta funcion
      document.getElementById("cad_fecha").value = convertirFecha(info.start);

      //Abrir la ventana modal para agregar una cita
      registrarModal.show();
    },
  });

  //Renderizar el calendario
  calendar.render();

  //Convertir fecha
  function convertirFecha(fecha) {
    //convierte a cadena un objeto date
    const fechaObj = new Date(fecha);

    //Obtener el año
    const año = fechaObj.getFullYear();

    //Obtener el mes y agregar 1 porque los meses en JavaScript van de 0 a 11
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0"); // Mes (0-11, por eso +1)

    //Obtener el día y agregar 0 al inicio si es necesario
    const dia = String(fechaObj.getDate()).padStart(2, "0"); // Día (1-31)

    //Obtener la hora y agregar 0 al inicio si es necesario
    const hora = String(fechaObj.getHours()).padStart(2, "0"); // Hora (0-23)

    //Obtener el minuto y agregar 0 al inicio si es necesario
    const minuto = String(fechaObj.getMinutes()).padStart(2, "0"); // Minuto (0-59)

    //Retornar la fecha en formato YYYY-MM-DD HH:mm
    return `${año}-${mes}-${dia} ${hora}:${minuto}`;
  }

  //Recibir el selector del formulario de registro de eventos
  const formCadEvento = document.getElementById("formCadEvento");

  //Recibir el selector del mensaje de éxito
  //Este mensaje se mostrará cuando se registre una cita correctamente
  const msg = document.getElementById("msg");

  //Recibir el selector del botón de registrar evento (puedes usarlo tambien para cambiar el texto del botón)
  //Este botón se usa para abrir la ventana modal de registro de eventos
  const btnCadEvento = document.getElementById("btnCadEvento");

  //Aca usarias la API para obtener los pacientes, doctores, especialidades, etc.
  //Por ahora, solo se muestra el formulario de registro de eventos
  //Si el formulario existe, agregar un evento submit
  if (formCadEvento) {
    formCadEvento.addEventListener("submit", function (e) {
      e.preventDefault(); // Evitar el envío del formulario

      btnCadEvento.value = "Registrando..."; // Cambiar el texto del botón

      //Obtener los valores de los campos del formulario
      const fecha = document.getElementById("cad_fecha").value;
      const paciente = document.getElementById("cad_paciente").value;
      const dni = document.getElementById("cad_dni").value;
      const especialidad = document.getElementById("cad_especialidad").value;
      const doctor = document.getElementById("cad_doctor").value;
      const descripcion = document.getElementById("cad_descripcion").value;

      // Convertir la fecha a objeto Date para comparaciones
      const nuevaFecha = new Date(fecha);

      // Obtener todos los eventos existentes
      const eventos = calendar.getEvents();

      // Verificar conflictos
      let conflicto = false;
      let mensajeError = "";

      eventos.forEach((evento) => {
        const eventoFecha = evento.start;

        // Verificar si es la misma hora
        if (eventoFecha.getTime() === nuevaFecha.getTime()) {
          // Verificar si el doctor ya tiene una cita a esa hora
          if (evento.extendedProps.doctor === doctor) {
            conflicto = true;
            mensajeError =
              "El doctor ya tiene una cita programada en este horario.";
            return;
          }

          // Verificar si el paciente ya tiene una cita a esa hora
          if (evento.extendedProps.dni === dni) {
            conflicto = true;
            mensajeError =
              "El paciente ya tiene una cita programada en este horario.";
            return;
          }

          // Verificar si el paciente tiene cita con otro doctor a la misma hora
          if (
            evento.extendedProps.paciente === paciente &&
            evento.extendedProps.doctor !== doctor
          ) {
            conflicto = true;
            mensajeError =
              "El paciente ya tiene una cita con otro doctor en este horario.";
            return;
          }
        }
      });

      // Si hay conflicto, mostrar mensaje de error
      if (conflicto) {
        msg.innerHTML = `<div class="alert alert-danger" role="alert">
          ${mensajeError}
        </div>`;
        btnCadEvento.value = "Registrar"; // Restaurar texto del botón
        removerMsg();
        return;
      }

      //Crear objeto con los datos del formulario
      const nuevoEvento = {
        start: fecha,
        extendedProps: {
          paciente: paciente,
          dni: dni,
          especialidad: especialidad,
          doctor: doctor,
          descripcion: descripcion,
        },
      };

      //Agregar el nuevo evento al calendario
      calendar.addEvent(nuevoEvento);

      //Limpiar el formulario
      formCadEvento.reset();

      //Mostrar mensaje de éxito
      msg.innerHTML = `<div class="alert alert-success" role="alert">
        Cita registrada correctamente.
      </div>`;

      //Remover el mensaje de éxito después de 3 segundos
      removerMsg();

      //Cerrar la ventana modal
      registrarModal.hide();
    });
  }

  //funcion para remover el mensaje de éxito después de 3 segundos
  function removerMsg() {
    setTimeout(() => {
      document.getElementById("msg").innerHTML = "";
    }, 3000);
  }

  //Recibir el selector de ocultar el formulario de evento y presentar el de editar evento
  const btnViewEditEvento = document.getElementById("btnViewEditEvento");

  //Verificar que existe el selector btnViewEditEvento
  //Si existe, agregar un evento click para ocultar la ventana modal de ver evento
  if (btnViewEditEvento) {
    btnViewEditEvento.addEventListener("click", () => {
      //Mostrar la ventana modal de ver evento
      document.getElementById("visualizarEvento").style.display = "none";
      document.getElementById("visualizarModalLabel").style.display = "none";

      //ocualtar la ventana modal de editar evento
      document.getElementById("editarEvento").style.display = "block";
      document.getElementById("editarModalLabel").style.display = "block";
    });
  }

  //Recibir el selector del botón de ver evento y presenta detalles del evento
  const btnViewEvento = document.getElementById("btnViewEvento");

  //Verificar que existe el selector btnViewEvento
  //Si existe, agregar un evento click para ocultar la ventana modal de ver evento
  if (btnViewEvento) {
    btnViewEvento.addEventListener("click", () => {
      //Ocultar la ventana modal de ver evento
      document.getElementById("visualizarEvento").style.display = "block";
      document.getElementById("visualizarModalLabel").style.display = "block";

      //Mostrar la ventana modal de editar evento
      document.getElementById("editarEvento").style.display = "none";
      document.getElementById("editarModalLabel").style.display = "none";
    });
  }

  //Recibir el selector del formulario de editar evento
  //Este formulario se usa para editar los detalles de un evento existente
  const formEditEvento = document.getElementById("formEditEvento");

  //Recibir el selector del mensaje de éxito para editar evento msgEditEvento
  const msgEditEvento = document.getElementById("msgEditEvento");

  //Recibir el selector del botón de editar evento
  const btnEditEvento = document.getElementById("btnEditEvento");

  //Verificar que existe el selector formEditEvento
  //Si existe, agregar un evento submit para editar el evento
  if (formEditEvento) {
    formEditEvento.addEventListener("submit", function (e) {
      e.preventDefault(); // Evitar el envío del formulario

      btnEditEvento.value = "Editando..."; // Cambiar el texto del botón

      // Obtener los valores de los campos del formulario
      const fecha = document.getElementById("edit_fecha").value;
      const paciente = document.getElementById("edit_paciente").value;
      const dni = document.getElementById("edit_dni").value;
      const especialidad = document.getElementById("edit_especialidad").value;
      const doctor = document.getElementById("edit_doctor").value;
      const descripcion = document.getElementById("edit_descripcion").value;

      // Convertir la fecha a objeto Date para comparaciones
      const nuevaFecha = new Date(fecha);

      // Obtener todos los eventos existentes
      const eventos = calendar.getEvents();

      // Obtener el evento que se está editando (podrías almacenarlo en una variable global cuando se hace click)
      let eventoEditando = null;

      // Necesitarías una manera de identificar qué evento estás editando
      // Esto podría hacerse almacenando el ID del evento cuando se hace click en él
      // Por ahora asumiremos que tienes una variable global que guarda el evento actual
      if (window.eventoActual) {
        eventoEditando = window.eventoActual;
      }

      // Verificar conflictos (excluyendo el evento que se está editando)
      let conflicto = false;
      let mensajeError = "";

      eventos.forEach((evento) => {
        // Saltar el evento que estamos editando
        if (eventoEditando && evento.id === eventoEditando.id) {
          return;
        }

        const eventoFecha = evento.start;

        // Verificar si es la misma hora
        if (eventoFecha.getTime() === nuevaFecha.getTime()) {
          // Verificar si el doctor ya tiene una cita a esa hora
          if (evento.extendedProps.doctor === doctor) {
            conflicto = true;
            mensajeError =
              "El doctor ya tiene una cita programada en este horario.";
            return;
          }

          // Verificar si el paciente ya tiene una cita a esa hora
          if (evento.extendedProps.dni === dni) {
            conflicto = true;
            mensajeError =
              "El paciente ya tiene una cita programada en este horario.";
            return;
          }

          // Verificar si el paciente tiene cita con otro doctor a la misma hora
          if (
            evento.extendedProps.paciente === paciente &&
            evento.extendedProps.doctor !== doctor
          ) {
            conflicto = true;
            mensajeError =
              "El paciente ya tiene una cita con otro doctor en este horario.";
            return;
          }
        }
      });

      // Si hay conflicto, mostrar mensaje de error
      if (conflicto) {
        msgEditEvento.innerHTML = `<div class="alert alert-danger" role="alert">
                ${mensajeError}
            </div>`;
        btnEditEvento.value = "Guardar cambios"; // Restaurar texto del botón
        setTimeout(() => {
          msgEditEvento.innerHTML = "";
        }, 3000);
        return;
      }

      // Actualizar el evento
      if (eventoEditando) {
        // Actualizar las propiedades del evento
        eventoEditando.setStart(fecha);
        eventoEditando.setExtendedProp("paciente", paciente);
        eventoEditando.setExtendedProp("dni", dni);
        eventoEditando.setExtendedProp("especialidad", especialidad);
        eventoEditando.setExtendedProp("doctor", doctor);
        eventoEditando.setExtendedProp("descripcion", descripcion);

        // Mostrar mensaje de éxito
        msgEditEvento.innerHTML = `<div class="alert alert-success" role="alert">
                Cita actualizada correctamente.
            </div>`;

        // Restaurar texto del botón
        btnEditEvento.value = "Guardar cambios";

        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          msgEditEvento.innerHTML = "";
          const visualizarModal = bootstrap.Modal.getInstance(
            document.getElementById("visualizarModal")
          );
          if (visualizarModal) {
            visualizarModal.hide();
          }

          // Restablecer vista del modal
          document.getElementById("visualizarEvento").style.display = "block";
          document.getElementById("visualizarModalLabel").style.display =
            "block";
          document.getElementById("editarEvento").style.display = "none";
          document.getElementById("editarModalLabel").style.display = "none";
        }, 2000);
      }
    });
  }

  //Recibir el selector del botón de eliminar evento
  document.getElementById("btnEliminarEvento");

  //Verificar que existe el selector btnEliminarEvento
  if (btnEliminarEvento) {
    //
    btnEliminarEvento.addEventListener("click", async () => {
      //Confirmar si el usuario desea eliminar el evento
      const confirmacion = window.confirm(
        "Este seguro de eliminar este evento?"
      );

      if (confirmacion) {
        //En esta parte consumirías la API para eliminar el evento
        //Por ahora, solo simula eliminación del evento del calendario

        msgViewEvento.innerHTML = `<div class="alert alert-danger" role="alert">
          Cita eliminada correctamente.
        </div>`;

        msg.innerHTML = `<div class="alert alert-success" role="alert">
          Cita eliminada correctamente.
        </div>`;

        msgViewEvento.innerHTML = "";

        removerMsg();

        await window.eventoActual.remove(); // Eliminar el evento actual

        //quitar modal de visualizar evento
        const visualizarModal = bootstrap.Modal.getInstance(
          document.getElementById("visualizarModal")
        );
        if (visualizarModal) {
          visualizarModal.hide();
        }
        //Restablecer vista del modal
        document.getElementById("visualizarEvento").style.display = "block";
      }
    });
  }

  // Guarda los eventos originales para restaurar al quitar el filtro
  let eventosOriginales = [];

  // Después de calendar.render();
  calendar.render();

  // Guardar los eventos originales (solo una vez)
  eventosOriginales = calendar.getEvents().map((ev) => ({
    paciente: ev.extendedProps.paciente,
    dni: ev.extendedProps.dni,
    especialidad: ev.extendedProps.especialidad,
    doctor: ev.extendedProps.doctor,
    descripcion: ev.extendedProps.descripcion,
    start: ev.start,
    end: ev.end,
  }));

  // Filtrar eventos por doctor
  const userDoctorSelect = document.getElementById("user_doctor");
  const userPacienteSelect = document.getElementById("user_paciente");

  function filtrarEventos() {
    // Obtener valores seleccionados
    const doctorId = userDoctorSelect ? userDoctorSelect.value : "";
    const pacienteNombre = userPacienteSelect ? userPacienteSelect.value : "";

    // Lista de doctores para buscar nombre por id
    const doctores = [
      { id: "1", nombre: "Pedro Jiménez" },
      { id: "2", nombre: "Ana Torres" },
      { id: "3", nombre: "Javier Ruiz" },
      { id: "4", nombre: "Laura Fernández" },
      { id: "5", nombre: "Carlos Mendoza" },
    ];
    const doctorSeleccionado = doctores.find((d) => d.id === doctorId);

    // Limpiar eventos actuales
    calendar.removeAllEvents();

    // Filtrar eventos según selección
    let filtrados = eventosOriginales;

    if (doctorSeleccionado && pacienteNombre) {
      // Filtrar por ambos
      filtrados = filtrados.filter(
        (ev) =>
          ev.doctor === doctorSeleccionado.nombre &&
          ev.paciente === pacienteNombre
      );
    } else if (doctorSeleccionado) {
      // Solo doctor
      filtrados = filtrados.filter(
        (ev) => ev.doctor === doctorSeleccionado.nombre
      );
    } else if (pacienteNombre) {
      // Solo paciente
      filtrados = filtrados.filter((ev) => ev.paciente === pacienteNombre);
    }

    // Agregar eventos filtrados
    filtrados.forEach((ev) => calendar.addEvent(ev));
  }

  // Asignar eventos a los selects
  if (userDoctorSelect) {
    userDoctorSelect.addEventListener("change", filtrarEventos);
  }
  if (userPacienteSelect) {
    userPacienteSelect.addEventListener("change", filtrarEventos);
  }

  // Obtner el elemento doctor con el id "user_doctor"
  // Este elemento debe tener el atributo data-user-id con el ID del usuario
  const user = document.getElementById("user_doctor");

  if (user) {
    //**IMPORTANTE: En esta parte consumirías la API para listar todos los doctores
    //Por ahora, solo simula la carga de eventos del doctor
    const doctores = [
      { id: "1", nombre: "Pedro Jiménez" },
      { id: "2", nombre: "Ana Torres" },
      { id: "3", nombre: "Javier Ruiz" },
      { id: "4", nombre: "Laura Fernández" },
      { id: "5", nombre: "Carlos Mendoza" },
    ];

    // Cargar doctores en el select de registro de cita
    const selectCadDoctor = document.getElementById("cad_doctor");
    if (selectCadDoctor) {
      // Limpia las opciones excepto la de "Seleccione..."
      selectCadDoctor.innerHTML = `
      <option selected disabled value="">Seleccione...</option>
    `;
      doctores.forEach((doctor) => {
        const option = document.createElement("option");
        option.value = doctor.nombre;
        option.textContent = doctor.nombre;
        selectCadDoctor.appendChild(option);
      });
    }

    // Cargar doctores en el select de edición de cita
    const selectEditDoctor = document.getElementById("edit_doctor");
    if (selectEditDoctor) {
      // Limpia las opciones excepto la de "Seleccione..."
      selectEditDoctor.innerHTML = `
      <option selected disabled value="">Seleccione...</option>
    `;
      doctores.forEach((doctor) => {
        const option = document.createElement("option");
        option.value = doctor.nombre;
        option.textContent = doctor.nombre;
        selectEditDoctor.appendChild(option);
      });
    }

    // Simular la carga de eventos del doctor
    doctores.forEach((doctor) => {
      const option = document.createElement("option");
      option.value = doctor.id;
      option.textContent = doctor.nombre;
      user.appendChild(option);
    });
  }

  // Lista de pacientes (puedes traerla de una API si lo necesitas)
  const pacientes = [
    { id: "1", nombre: "Donkey Kong" },
    { id: "2", nombre: "Yoshi" },
    { id: "3", nombre: "Toad" },
    { id: "4", nombre: "Bowser Koopa" },
    { id: "5", nombre: "Mario Bros" },
    { id: "6", nombre: "Princesa Peach" },
    { id: "7", nombre: "Luigi Bros" },
  ];

  // Cargar pacientes en el select de filtrado por pacienet
  const selectCadPaciente = document.getElementById("user_paciente");
  if (selectCadPaciente) {
    pacientes.forEach((paciente) => {
      const option = document.createElement("option");
      option.value = paciente.nombre;
      option.textContent = paciente.nombre;
      selectCadPaciente.appendChild(option);
    });
  }
});
