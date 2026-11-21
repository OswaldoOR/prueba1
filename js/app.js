/**
 * Sistema de Control y Seguimiento de Tareas Técnicas
 * H. Ayuntamiento de Río Blanco - Departamento de Sistemas
 */

const STORAGE_KEY = 'rioblanco_sistemas_tareas_v1';

// =========================================================================
// 1. CAPA DE PERSISTENCIA
// =========================================================================

function obtenerTareas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error al leer almacenamiento:', error);
    return [];
  }
}

function guardarTareas(listaTareas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaTareas));
}

// =========================================================================
// 2. ESTADO DE LA APLICACIÓN Y REFERENCIAS AL DOM
// =========================================================================

let tareas = [];
let idTareaEnEdicion = null;

const formSolicitud = document.getElementById('form-solicitud');
const inputFecha = document.getElementById('fecha-solicitud');
const selectArea = document.getElementById('area-solicitante');
const grupoOtraArea = document.getElementById('grupo-otra-area');
const inputOtraArea = document.getElementById('otra-area-texto');
const inputEquipo = document.getElementById('equipo-afectado');
const textareaDescripcion = document.getElementById('descripcion-falla');
const previewId = document.getElementById('preview-id');

const tablaBody = document.getElementById('tabla-tareas-body');
const contenedorTabla = document.getElementById('contenedor-tabla');
const estadoVacio = document.getElementById('estado-vacio');
const contadorResultados = document.getElementById('contador-resultados');

const filtroBusqueda = document.getElementById('filtro-busqueda');
const filtroEstado = document.getElementById('filtro-estado');
const filtroTipo = document.getElementById('filtro-tipo');

const modalEstado = document.getElementById('modal-estado');
const selectNuevoEstado = document.getElementById('select-nuevo-estado');

// =========================================================================
// 3. UTILIDADES DE FECHA, ID Y NOTIFICACIONES
// =========================================================================

function obtenerFechaHoyISO() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaDDMMAAAA(fechaISO) {
  if (!fechaISO || !fechaISO.includes('-')) return fechaISO;
  const [yyyy, mm, dd] = fechaISO.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function calcularSiguienteID() {
  if (tareas.length === 0) return 1;
  const maxId = Math.max(...tareas.map((t) => Number(t.ID_Tarea) || 0));
  return maxId + 1;
}

function mostrarNotificacion(mensaje, tipo = 'info', accionTexto = null, accionCallback = null) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const span = document.createElement('span');
  span.textContent = mensaje;
  toast.appendChild(span);

  if (accionTexto && typeof accionCallback === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = accionTexto;
    btn.addEventListener('click', () => {
      toast.remove();
      accionCallback();
    });
    toast.appendChild(btn);
  }

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4500);
}

// =========================================================================
// 4. LÓGICA DEL FORMULARIO Y VALIDACIONES (CU-01 / RF-01 a RF-05)
// =========================================================================

function inicializarFormulario() {
  inputFecha.value = obtenerFechaHoyISO();
  previewId.textContent = `#${calcularSiguienteID()}`;
}

selectArea.addEventListener('change', () => {
  limpiarErrorCampo(selectArea);
  if (selectArea.value === 'OTRA') {
    grupoOtraArea.classList.remove('oculto');
    inputOtraArea.focus();
  } else {
    grupoOtraArea.classList.add('oculto');
    inputOtraArea.value = '';
    limpiarErrorCampo(inputOtraArea);
  }
});

function marcarErrorCampo(elemento) {
  const grupo = elemento.closest('.form-group');
  if (grupo) grupo.classList.add('invalido');
}

function limpiarErrorCampo(elemento) {
  const grupo = elemento.closest('.form-group');
  if (grupo) grupo.classList.remove('invalido');
}

[inputFecha, inputOtraArea, inputEquipo, textareaDescripcion].forEach((el) => {
  el.addEventListener('input', () => limpiarErrorCampo(el));
});

document.querySelectorAll('input[name="tipoServicio"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.getElementById('grupo-tipo-servicio').classList.remove('invalido');
  });
});

function validarFormulario() {
  let esValido = true;

  if (!inputFecha.value) {
    marcarErrorCampo(inputFecha);
    esValido = false;
  }

  if (!selectArea.value) {
    marcarErrorCampo(selectArea);
    esValido = false;
  } else if (selectArea.value === 'OTRA' && !inputOtraArea.value.trim()) {
    marcarErrorCampo(inputOtraArea);
    esValido = false;
  }

  if (!inputEquipo.value.trim()) {
    marcarErrorCampo(inputEquipo);
    esValido = false;
  }

  const tipoSeleccionado = document.querySelector('input[name="tipoServicio"]:checked');
  if (!tipoSeleccionado) {
    document.getElementById('grupo-tipo-servicio').classList.add('invalido');
    esValido = false;
  }

  if (!textareaDescripcion.value.trim()) {
    marcarErrorCampo(textareaDescripcion);
    esValido = false;
  }

  return esValido;
}

formSolicitud.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    mostrarNotificacion('Completa los campos obligatorios marcados en rojo.', 'error');
    return;
  }

  const areaFinal =
    selectArea.value === 'OTRA' ? inputOtraArea.value.trim() : selectArea.value;
  const tipoServicio = document.querySelector('input[name="tipoServicio"]:checked').value;

  const nuevaTarea = {
    ID_Tarea: calcularSiguienteID(),
    Fecha_Solicitud: formatearFechaDDMMAAAA(inputFecha.value),
    Area_Solicitante: areaFinal,
    Equipo_Afectado: inputEquipo.value.trim(),
    Tipo_Servicio: tipoServicio,
    Descripcion_Falla: textareaDescripcion.value.trim(),
    Estado_Seguimiento: 'Pendiente'
  };

  tareas.unshift(nuevaTarea);
  guardarTareas(tareas);

  resetearFormulario();
  renderizarTablero();
  mostrarNotificacion(`Solicitud #${nuevaTarea.ID_Tarea} registrada con éxito.`, 'success');
});

function resetearFormulario() {
  formSolicitud.reset();
  grupoOtraArea.classList.add('oculto');
  document.querySelectorAll('.form-group.invalido').forEach((g) => g.classList.remove('invalido'));
  inicializarFormulario();
}

document.getElementById('btn-limpiar').addEventListener('click', resetearFormulario);

// =========================================================================
// 5. RENDERIZADO DEL TABLERO, MÉTRICAS Y FILTROS (RF-06)
// =========================================================================

function actualizarKPIs() {
  document.getElementById('kpi-total').textContent = tareas.length;
  document.getElementById('kpi-pendiente').textContent = tareas.filter(
    (t) => t.Estado_Seguimiento === 'Pendiente'
  ).length;
  document.getElementById('kpi-proceso').textContent = tareas.filter(
    (t) => t.Estado_Seguimiento === 'En proceso'
  ).length;
  document.getElementById('kpi-terminado').textContent = tareas.filter(
    (t) => t.Estado_Seguimiento === 'Terminado'
  ).length;
}

function obtenerClaseBadgeEstado(estado) {
  if (estado === 'En proceso') return 'badge-proceso';
  if (estado === 'Terminado') return 'badge-terminado';
  return 'badge-pendiente';
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function renderizarTablero() {
  actualizarKPIs();
  previewId.textContent = `#${calcularSiguienteID()}`;

  if (tareas.length === 0) {
    estadoVacio.classList.remove('oculto');
    contenedorTabla.classList.add('oculto');
    if (contadorResultados) contadorResultados.textContent = '0 registros';
    return;
  }

  const textoFiltro = filtroBusqueda.value.trim().toLowerCase();
  const estadoFiltro = filtroEstado.value;
  const tipoFiltro = filtroTipo.value;

  const filtradas = tareas.filter((t) => {
    const coincideEstado = estadoFiltro === 'TODOS' || t.Estado_Seguimiento === estadoFiltro;
    const coincideTipo = tipoFiltro === 'TODOS' || t.Tipo_Servicio === tipoFiltro;
    const coincideTexto =
      !textoFiltro ||
      String(t.ID_Tarea).includes(textoFiltro) ||
      t.Area_Solicitante.toLowerCase().includes(textoFiltro) ||
      t.Equipo_Afectado.toLowerCase().includes(textoFiltro) ||
      t.Descripcion_Falla.toLowerCase().includes(textoFiltro);

    return coincideEstado && coincideTipo && coincideTexto;
  });

  if (contadorResultados) {
    contadorResultados.textContent =
      filtradas.length === 1 ? '1 registro' : `${filtradas.length} registros`;
  }

  estadoVacio.classList.add('oculto');
  contenedorTabla.classList.remove('oculto');

  if (filtradas.length === 0) {
    tablaBody.innerHTML = `
      <tr class="fila-vacia">
        <td colspan="8" style="text-align:center; padding: 24px; color: #64748b;">
          No se encontraron tareas que coincidan con los filtros aplicados.
        </td>
      </tr>`;
    return;
  }

  tablaBody.innerHTML = filtradas
    .map(
      (tarea) => `
      <tr>
        <td data-label="Folio" class="col-id"><strong>#${tarea.ID_Tarea}</strong></td>
        <td data-label="Fecha">${escaparHTML(tarea.Fecha_Solicitud)}</td>
        <td data-label="Área">${escaparHTML(tarea.Area_Solicitante)}</td>
        <td data-label="Equipo">${escaparHTML(tarea.Equipo_Afectado)}</td>
        <td data-label="Tipo"><span class="badge badge-tipo">${escaparHTML(tarea.Tipo_Servicio)}</span></td>
        <td data-label="Descripción de la Falla" class="col-desc">${escaparHTML(tarea.Descripcion_Falla)}</td>
        <td data-label="Estado">
          <span class="badge ${obtenerClaseBadgeEstado(tarea.Estado_Seguimiento)}">
            ${escaparHTML(tarea.Estado_Seguimiento)}
          </span>
        </td>
        <td data-label="Acciones">
          <div class="action-btns">
            <button type="button" class="btn-sm" onclick="abrirModalEstado(${tarea.ID_Tarea})">
              Estado
            </button>
            <button type="button" class="btn-sm btn-danger" onclick="eliminarRegistro(${tarea.ID_Tarea})" title="Depurar registro de prueba">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join('');
}

filtroBusqueda.addEventListener('input', renderizarTablero);
filtroEstado.addEventListener('change', renderizarTablero);
filtroTipo.addEventListener('change', renderizarTablero);

// =========================================================================
// 6. ACTUALIZACIÓN DE ESTADOS Y DEPURACIÓN (CU-02 / RF-07 / RNF-06)
// =========================================================================

window.abrirModalEstado = function (idTarea) {
  const tarea = tareas.find((t) => t.ID_Tarea === idTarea);
  if (!tarea) return;

  idTareaEnEdicion = idTarea;
  document.getElementById('modal-id-tarea').textContent = `#${tarea.ID_Tarea}`;
  document.getElementById('modal-area').textContent = tarea.Area_Solicitante;
  document.getElementById('modal-equipo').textContent = tarea.Equipo_Afectado;
  selectNuevoEstado.value = tarea.Estado_Seguimiento;

  modalEstado.classList.remove('oculto');
};

function cerrarModalEstado() {
  idTareaEnEdicion = null;
  modalEstado.classList.add('oculto');
}

document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModalEstado);
document.getElementById('btn-cancelar-estado').addEventListener('click', cerrarModalEstado);

modalEstado.addEventListener('click', (e) => {
  if (e.target === modalEstado) cerrarModalEstado();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalEstado.classList.contains('oculto')) {
    cerrarModalEstado();
  }
});

document.getElementById('btn-confirmar-estado').addEventListener('click', () => {
  if (idTareaEnEdicion === null) return;

  const nuevoEstado = selectNuevoEstado.value;
  const permitidos = ['Pendiente', 'En proceso', 'Terminado'];
  if (!permitidos.includes(nuevoEstado)) return;

  const indice = tareas.findIndex((t) => t.ID_Tarea === idTareaEnEdicion);
  if (indice !== -1) {
    tareas[indice].Estado_Seguimiento = nuevoEstado;
    guardarTareas(tareas);
    renderizarTablero();
    mostrarNotificacion(
      `Tarea #${idTareaEnEdicion} actualizada a "${nuevoEstado}".`,
      'success'
    );
  }

  cerrarModalEstado();
});

window.eliminarRegistro = function (idTarea) {
  const confirmar = window.confirm(
    `¿Deseas eliminar el registro #${idTarea}? Esta acción es para depuración y no se puede deshacer.`
  );
  if (!confirmar) return;

  tareas = tareas.filter((t) => t.ID_Tarea !== idTarea);
  guardarTareas(tareas);
  renderizarTablero();
  mostrarNotificacion(`Registro #${idTarea} eliminado.`, 'info');
};

// =========================================================================
// 7. GENERADOR DE EXCEL .XLSX CON FORMATO INSTITUCIONAL (CU-03 / RF-08)
// =========================================================================

function exportarHistorialAExcel() {
  if (tareas.length === 0) {
    mostrarNotificacion(
      'No existen registros disponibles para generar el reporte en Excel.',
      'error'
    );
    return;
  }

  try {
    if (typeof XLSX === 'undefined') {
      throw new Error('La librería de exportación Excel no está disponible.');
    }

    const datosOrdenados = [...tareas].sort((a, b) => a.ID_Tarea - b.ID_Tarea);
    const total = datosOrdenados.length;
    const pendientes = datosOrdenados.filter((t) => t.Estado_Seguimiento === 'Pendiente').length;
    const enProceso = datosOrdenados.filter((t) => t.Estado_Seguimiento === 'En proceso').length;
    const terminados = datosOrdenados.filter((t) => t.Estado_Seguimiento === 'Terminado').length;
    const fechaEmision = formatearFechaDDMMAAAA(obtenerFechaHoyISO());

    const bordeDelgado = {
      top: { style: 'thin', color: { rgb: 'CBD9E8' } },
      bottom: { style: 'thin', color: { rgb: 'CBD9E8' } },
      left: { style: 'thin', color: { rgb: 'CBD9E8' } },
      right: { style: 'thin', color: { rgb: 'CBD9E8' } }
    };

    const estiloTitulo = {
      font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: '003B75' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const estiloSubtitulo = {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'E0F2FE' } },
      fill: { patternType: 'solid', fgColor: { rgb: '0057A8' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const estiloMeta = {
      font: { name: 'Calibri', sz: 9.5, italic: true, color: { rgb: '0F2942' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'EEF6FF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bordeDelgado
    };

    const estiloHeaderTabla = {
      font: { name: 'Calibri', sz: 10.5, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: '003B75' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'medium', color: { rgb: '003B75' } },
        bottom: { style: 'medium', color: { rgb: '1685DF' } },
        left: { style: 'thin', color: { rgb: '1E4E8C' } },
        right: { style: 'thin', color: { rgb: '1E4E8C' } }
      }
    };

    // Construcción de matriz de celdas para Hoja 1: Historial_Tareas
    const filas = [
      [
        { v: 'H. AYUNTAMIENTO CONSTITUCIONAL DE RÍO BLANCO, VERACRUZ', s: estiloTitulo },
        '', '', '', '', '', ''
      ],
      [
        { v: 'DEPARTAMENTO DE SISTEMAS — REPORTE DE CONTROL Y SEGUIMIENTO DE TAREAS TÉCNICAS', s: estiloSubtitulo },
        '', '', '', '', '', ''
      ],
      [
        {
          v: `Fecha de emisión: ${fechaEmision}   |   Total: ${total}   |   Pendientes: ${pendientes}   |   En proceso: ${enProceso}   |   Terminadas: ${terminados}`,
          s: estiloMeta
        },
        '', '', '', '', '', ''
      ],
      ['', '', '', '', '', '', ''],
      [
        { v: 'ID_Tarea', s: estiloHeaderTabla },
        { v: 'Fecha_Solicitud', s: estiloHeaderTabla },
        { v: 'Area_Solicitante', s: estiloHeaderTabla },
        { v: 'Equipo_Afectado', s: estiloHeaderTabla },
        { v: 'Tipo_Servicio', s: estiloHeaderTabla },
        { v: 'Descripcion_Falla', s: estiloHeaderTabla },
        { v: 'Estado_Seguimiento', s: estiloHeaderTabla }
      ]
    ];

    const alturasFilas = [
      { hpt: 28 },
      { hpt: 22 },
      { hpt: 20 },
      { hpt: 8 },
      { hpt: 26 }
    ];

    datosOrdenados.forEach((t, idx) => {
      const bgFila = idx % 2 === 0 ? 'FFFFFF' : 'F8FBFF';

      const estiloBase = {
        font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
        fill: { patternType: 'solid', fgColor: { rgb: bgFila } },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: bordeDelgado
      };

      const estiloID = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '003B75' } },
        fill: { patternType: 'solid', fgColor: { rgb: bgFila } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bordeDelgado
      };

      const estiloFecha = {
        ...estiloBase,
        alignment: { horizontal: 'center', vertical: 'center' }
      };

      const esHardware = t.Tipo_Servicio === 'Hardware';
      const estiloTipo = {
        font: {
          name: 'Calibri',
          sz: 9.5,
          bold: true,
          color: { rgb: esHardware ? '1E40AF' : '4338CA' }
        },
        fill: {
          patternType: 'solid',
          fgColor: { rgb: esHardware ? 'EFF6FF' : 'EEF2FF' }
        },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bordeDelgado
      };

      let bgEstado = 'FEF3C7';
      let txtEstado = '92400E';
      if (t.Estado_Seguimiento === 'En proceso') {
        bgEstado = 'DBEAFE';
        txtEstado = '1E40AF';
      } else if (t.Estado_Seguimiento === 'Terminado') {
        bgEstado = 'D1FAE5';
        txtEstado = '065F46';
      }

      const estiloEstado = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: txtEstado } },
        fill: { patternType: 'solid', fgColor: { rgb: bgEstado } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bordeDelgado
      };

      filas.push([
        { v: Number(t.ID_Tarea), t: 'n', z: '"#"0', s: estiloID },
        { v: t.Fecha_Solicitud, t: 's', s: estiloFecha },
        { v: t.Area_Solicitante, t: 's', s: estiloBase },
        { v: t.Equipo_Afectado, t: 's', s: estiloBase },
        { v: t.Tipo_Servicio, t: 's', s: estiloTipo },
        { v: t.Descripcion_Falla, t: 's', s: estiloBase },
        { v: t.Estado_Seguimiento, t: 's', s: estiloEstado }
      ]);

      // Calcular altura dinámica según longitud de descripción
      const lineasEstimadas = Math.max(
        1,
        Math.ceil((t.Descripcion_Falla || '').length / 48)
      );
      alturasFilas.push({ hpt: Math.max(22, lineasEstimadas * 15 + 6) });
    });

    // Fila de cierre / total
    const estiloPie = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '003B75' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'EEF6FF' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '003B75' } },
        bottom: { style: 'medium', color: { rgb: '003B75' } },
        left: { style: 'thin', color: { rgb: 'CBD9E8' } },
        right: { style: 'thin', color: { rgb: 'CBD9E8' } }
      }
    };

    filas.push([
      { v: `Total de registros: ${total}`, s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie }
    ]);
    alturasFilas.push({ hpt: 22 });

    const hojaHistorial = XLSX.utils.aoa_to_sheet(filas);

    // Combinar celdas de encabezados y pie
    const filaFinalIdx = filas.length - 1;
    hojaHistorial['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: filaFinalIdx, c: 0 }, e: { r: filaFinalIdx, c: 6 } }
    ];

    // Anchos de columna y alturas de fila
    hojaHistorial['!cols'] = [
      { wch: 11 }, // ID_Tarea
      { wch: 16 }, // Fecha_Solicitud
      { wch: 30 }, // Area_Solicitante
      { wch: 24 }, // Equipo_Afectado
      { wch: 15 }, // Tipo_Servicio
      { wch: 52 }, // Descripcion_Falla
      { wch: 19 }  // Estado_Seguimiento
    ];
    hojaHistorial['!rows'] = alturasFilas;

    // Activar autofiltro en la tabla principal
    hojaHistorial['!autofilter'] = { ref: `A5:G${5 + total}` };

    // Hoja 2: Resumen Estadístico por Estado, Tipo y Departamento
    const hardwareCount = datosOrdenados.filter((t) => t.Tipo_Servicio === 'Hardware').length;
    const softwareCount = datosOrdenados.filter((t) => t.Tipo_Servicio === 'Software').length;

    const conteoPorArea = {};
    datosOrdenados.forEach((t) => {
      conteoPorArea[t.Area_Solicitante] = (conteoPorArea[t.Area_Solicitante] || 0) + 1;
    });
    const areasOrdenadas = Object.entries(conteoPorArea).sort((a, b) => b[1] - a[1]);

    const estiloCeldaResumen = {
      font: { name: 'Calibri', sz: 10, color: { rgb: '1E293B' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: bordeDelgado
    };
    const estiloNumResumen = {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '003B75' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bordeDelgado
    };

    const filasResumen = [
      [{ v: 'RESUMEN EJECUTIVO DE ATENCIÓN TÉCNICA — RÍO BLANCO', s: estiloTitulo }, '', ''],
      [{ v: `Corte generado el ${fechaEmision}`, s: estiloMeta }, '', ''],
      ['', '', ''],
      [
        { v: 'Estado de Seguimiento', s: estiloHeaderTabla },
        { v: 'Cantidad', s: estiloHeaderTabla },
        { v: 'Porcentaje', s: estiloHeaderTabla }
      ],
      [
        { v: 'Pendiente', s: estiloCeldaResumen },
        { v: pendientes, t: 'n', s: estiloNumResumen },
        { v: `${((pendientes / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ],
      [
        { v: 'En proceso', s: estiloCeldaResumen },
        { v: enProceso, t: 'n', s: estiloNumResumen },
        { v: `${((enProceso / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ],
      [
        { v: 'Terminado', s: estiloCeldaResumen },
        { v: terminados, t: 'n', s: estiloNumResumen },
        { v: `${((terminados / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ],
      [
        { v: 'TOTAL GENERAL', s: estiloPie },
        { v: total, t: 'n', s: estiloPie },
        { v: '100.0%', s: estiloPie }
      ],
      ['', '', ''],
      [
        { v: 'Tipo de Servicio', s: estiloHeaderTabla },
        { v: 'Cantidad', s: estiloHeaderTabla },
        { v: 'Porcentaje', s: estiloHeaderTabla }
      ],
      [
        { v: 'Hardware', s: estiloCeldaResumen },
        { v: hardwareCount, t: 'n', s: estiloNumResumen },
        { v: `${((hardwareCount / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ],
      [
        { v: 'Software', s: estiloCeldaResumen },
        { v: softwareCount, t: 'n', s: estiloNumResumen },
        { v: `${((softwareCount / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ],
      ['', '', ''],
      [
        { v: 'Área / Departamento Solicitante', s: estiloHeaderTabla },
        { v: 'Solicitudes', s: estiloHeaderTabla },
        { v: 'Participación', s: estiloHeaderTabla }
      ],
      ...areasOrdenadas.map(([area, count]) => [
        { v: area, s: estiloCeldaResumen },
        { v: count, t: 'n', s: estiloNumResumen },
        { v: `${((count / total) * 100).toFixed(1)}%`, s: estiloNumResumen }
      ])
    ];

    const hojaResumen = XLSX.utils.aoa_to_sheet(filasResumen);
    hojaResumen['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }
    ];
    hojaResumen['!cols'] = [{ wch: 36 }, { wch: 15 }, { wch: 16 }];
    hojaResumen['!rows'] = [{ hpt: 26 }, { hpt: 20 }];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hojaHistorial, 'Historial_Tareas');
    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen_Estadistico');

    const fechaArchivo = obtenerFechaHoyISO();
    const nombreArchivo = `Reporte_Tareas_Sistemas_RioBlanco_${fechaArchivo}.xlsx`;

    XLSX.writeFile(libro, nombreArchivo);
    mostrarNotificacion('Reporte Excel (.xlsx) con formato descargado correctamente.', 'success');
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    mostrarNotificacion(
      'Ocurrió un error al generar el archivo .xlsx.',
      'error',
      'Reintentar',
      exportarHistorialAExcel
    );
  }
}

document.getElementById('btn-exportar-excel').addEventListener('click', exportarHistorialAExcel);

// =========================================================================
// 8. ARRANQUE INICIAL
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  tareas = obtenerTareas();
  inicializarFormulario();
  renderizarTablero();
});
