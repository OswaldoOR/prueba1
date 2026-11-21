/**
 * Sistema de Control y Seguimiento de Tareas Técnicas
 * H. Ayuntamiento de Río Blanco - Departamento de Sistemas
 */

const STORAGE_KEY = 'rioblanco_sistemas_tareas_v1';
const SYNC_CONFIG_KEY = 'rioblanco_github_sync_cfg_v1';
const ARCHIVO_REMOTO = 'tareas.json';
const INTERVALO_AUTO_SYNC_MS = 10000;

// =========================================================================
// CONFIGURACIÓN GLOBAL AUTOMÁTICA (PARA NO ESCRIBIR EL TOKEN EN CADA EQUIPO)
// =========================================================================
// Cuando configures tu token en la página y pulses "Copiar clave codificada p/ app.js",
// pega el resultado dentro de tokenCodificado para que TODOS los celulares y navegadores
// funcionen solos sin pedir token ni enlace especial.
const GITHUB_GLOBAL_CONFIG = {
  owner: 'OswaldoOR',
  repo: 'prueba1',
  tokenCodificado: ''
};

// =========================================================================
// 1. PERSISTENCIA LOCAL + SINCRONIZACIÓN AUTOMÁTICA CON GITHUB
// =========================================================================

let ultimoShaRemoto = null;
let sincronizandoAhora = false;
let subiendoAhora = false;
let versionLocal = 0;
let colaGuardadoRemoto = Promise.resolve();

function codificarTokenSeguro(tokenPlano) {
  const limpio = (tokenPlano || '').trim();
  if (!limpio) return '';
  return btoa(limpio.split('').reverse().join(''));
}

function decodificarTokenSeguro(codificado) {
  const limpio = (codificado || '').trim();
  if (!limpio) return '';
  if (limpio.startsWith('github_pat_') || limpio.startsWith('ghp_')) {
    return limpio;
  }
  try {
    return atob(limpio).split('').reverse().join('');
  } catch (e) {
    return '';
  }
}

function detectarRepoDesdeURL() {
  const host = window.location.hostname || '';
  const pathParts = (window.location.pathname || '').split('/').filter(Boolean);

  if (host.endsWith('.github.io')) {
    const owner = host.replace('.github.io', '');
    const repo = pathParts.length > 0 ? pathParts[0] : `${owner}.github.io`;
    return { owner, repo };
  }
  return { owner: '', repo: '' };
}

function capturarTokenDesdeURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tokenUrl = params.get('token');
    if (tokenUrl && tokenUrl.trim()) {
      const auto = detectarRepoDesdeURL();
      const actual = obtenerConfigSync();
      guardarConfigSync({
        owner: actual.owner || auto.owner || GITHUB_GLOBAL_CONFIG.owner,
        repo: actual.repo || auto.repo || GITHUB_GLOBAL_CONFIG.repo,
        token: decodificarTokenSeguro(tokenUrl.trim()) || tokenUrl.trim()
      });
      params.delete('token');
      const nuevaUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '') +
        window.location.hash;
      window.history.replaceState({}, '', nuevaUrl);
    }
  } catch (e) {
    // Ignorar si no hay parámetros en URL
  }
}

function obtenerConfigSync() {
  const auto = detectarRepoDesdeURL();
  const tokenGlobal = decodificarTokenSeguro(GITHUB_GLOBAL_CONFIG.tokenCodificado);

  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    const guardada = raw ? JSON.parse(raw) : {};
    return {
      owner: (guardada.owner || auto.owner || GITHUB_GLOBAL_CONFIG.owner || '').trim(),
      repo: (guardada.repo || auto.repo || GITHUB_GLOBAL_CONFIG.repo || '').trim(),
      token: (guardada.token || tokenGlobal || '').trim()
    };
  } catch (e) {
    return {
      owner: auto.owner || GITHUB_GLOBAL_CONFIG.owner,
      repo: auto.repo || GITHUB_GLOBAL_CONFIG.repo,
      token: tokenGlobal
    };
  }
}

function guardarConfigSync(cfg) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(cfg));
}

function actualizarIndicadorSync(estado, texto) {
  const dot = document.getElementById('dot-estado-sync');
  const label = document.getElementById('texto-estado-sync');
  if (!dot || !label) return;

  dot.classList.remove('online', 'syncing', 'error');
  if (estado === 'online') dot.classList.add('online');
  if (estado === 'syncing') dot.classList.add('syncing');
  if (estado === 'error') dot.classList.add('error');

  label.textContent = texto;
}

function obtenerTareasLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error al leer almacenamiento local:', error);
    return [];
  }
}

function guardarTareasLocal(listaTareas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaTareas));
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binString = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString);
}

function base64ToUtf8(base64) {
  const clean = base64.replace(/\s/g, '');
  const binString = atob(clean);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i += 1) {
    bytes[i] = binString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function subirTareasAGitHub(listaTareas, reintento = 0) {
  const cfg = obtenerConfigSync();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    actualizarIndicadorSync('local', 'Solo lectura (Clic p/ activar Sync)');
    mostrarNotificacion(
      'Este navegador aún no tiene permiso de escritura. Haz clic arriba en "Solo lectura" para vincularlo.',
      'error'
    );
    return false;
  }

  subiendoAhora = true;
  actualizarIndicadorSync('syncing', 'Guardando en GitHub...');

  const endpoint = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${ARCHIVO_REMOTO}`;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };

  try {
    let shaActual = null;
    const resGet = await fetch(`${endpoint}?t=${Date.now()}`, {
      headers,
      cache: 'no-store'
    });

    if (resGet.ok) {
      const infoArchivo = await resGet.json();
      shaActual = infoArchivo.sha;
    } else if (resGet.status !== 404) {
      throw new Error(`HTTP ${resGet.status}`);
    }

    const contenidoJSON = JSON.stringify(listaTareas, null, 2);
    const body = {
      message: `Sync tareas (${listaTareas.length})`,
      content: utf8ToBase64(contenidoJSON)
    };
    if (shaActual) body.sha = shaActual;

    const resPut = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (resPut.status === 409 && reintento < 2) {
      return subirTareasAGitHub(listaTareas, reintento + 1);
    }

    if (!resPut.ok) {
      const detalle = await resPut.json().catch(() => ({}));
      throw new Error(detalle.message || `Error HTTP ${resPut.status}`);
    }

    const respuestaPut = await resPut.json();
    if (respuestaPut.content && respuestaPut.content.sha) {
      ultimoShaRemoto = respuestaPut.content.sha;
    }

    actualizarIndicadorSync('online', 'Sincronizado con GitHub');
    return true;
  } catch (error) {
    console.error('Error al guardar en GitHub:', error);
    actualizarIndicadorSync('error', 'Error Sync (Clic p/ revisar)');
    mostrarNotificacion(`Error al subir a GitHub: ${error.message}`, 'error');
    return false;
  } finally {
    subiendoAhora = false;
  }
}

async function sincronizarDesdeGitHub(silencioso = true) {
  if (sincronizandoAhora || subiendoAhora) return;
  const cfg = obtenerConfigSync();

  if (!cfg.owner || !cfg.repo) {
    actualizarIndicadorSync('local', 'Modo Local Activo');
    return;
  }

  sincronizandoAhora = true;
  const versionAlIniciar = versionLocal;
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${ARCHIVO_REMOTO}?t=${Date.now()}`;
  const headers = { Accept: 'application/vnd.github+json' };
  if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;

  try {
    const res = await fetch(endpoint, { headers, cache: 'no-store' });

    // Si hubo un cambio local mientras se descargaba, ignorar la respuesta vieja
    if (versionLocal !== versionAlIniciar || subiendoAhora) return;

    if (res.ok) {
      const data = await res.json();

      if (data.sha && data.sha !== ultimoShaRemoto) {
        const texto = base64ToUtf8(data.content || '');
        const listaRemota = JSON.parse(texto);

        if (Array.isArray(listaRemota)) {
          const remotoVacioConDatosLocales =
            !cfg.token && listaRemota.length === 0 && tareas.length > 0;

          if (!remotoVacioConDatosLocales) {
            ultimoShaRemoto = data.sha;
            tareas = listaRemota;
            guardarTareasLocal(tareas);
            renderizarTablero();
          }
        }
      }

      actualizarIndicadorSync(
        cfg.token ? 'online' : 'local',
        cfg.token ? 'Sincronizado con GitHub' : 'Solo lectura (Clic p/ activar Sync)'
      );

      if (!silencioso) {
        mostrarNotificacion('Conexión con GitHub verificada.', 'success');
      }
    } else {
      actualizarIndicadorSync(
        cfg.token ? 'online' : 'local',
        cfg.token ? 'Sincronizado con GitHub' : 'Solo lectura (Clic p/ activar Sync)'
      );
    }
  } catch (error) {
    console.warn('No se pudo consultar GitHub en este ciclo:', error);
    actualizarIndicadorSync('local', 'Modo Local Activo');
  } finally {
    sincronizandoAhora = false;
  }
}

function guardarTareas(listaTareas) {
  versionLocal += 1;
  guardarTareasLocal(listaTareas);
  const copiaInstantanea = JSON.parse(JSON.stringify(listaTareas));
  colaGuardadoRemoto = colaGuardadoRemoto.then(() => subirTareasAGitHub(copiaInstantanea));
}

// =========================================================================
// 2. ESTADO DE LA APLICACIÓN Y REFERENCIAS AL DOM
// =========================================================================

let tareas = [];
let idTareaEnEdicion = null;
let idTareaModificando = null;
let idTareaEliminando = null;
let fechaActualStr = '';

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

const modalEditar = document.getElementById('modal-editar');
const formEditarTarea = document.getElementById('form-editar-tarea');
const editFecha = document.getElementById('edit-fecha');
const editArea = document.getElementById('edit-area');
const editGrupoOtraArea = document.getElementById('edit-grupo-otra-area');
const editOtraAreaTexto = document.getElementById('edit-otra-area-texto');
const editEquipo = document.getElementById('edit-equipo');
const editEstado = document.getElementById('edit-estado');
const editDescripcion = document.getElementById('edit-descripcion');

const modalEliminar = document.getElementById('modal-eliminar');

const modalSync = document.getElementById('modal-sync');
const inputSyncOwner = document.getElementById('sync-owner');
const inputSyncRepo = document.getElementById('sync-repo');
const inputSyncToken = document.getElementById('sync-token');
const cajaCompartirSync = document.getElementById('caja-compartir-sync');

// =========================================================================
// 3. UTILIDADES DE FECHA REAL AUTOMÁTICA, ID Y NOTIFICACIONES
// =========================================================================

function obtenerFechaHoyISO() {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaDDMMAAAA(fechaISO) {
  if (!fechaISO || !fechaISO.includes('-')) return fechaISO;
  const [yyyy, mm, dd] = fechaISO.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatearFechaISO(fechaDDMMAAAA) {
  if (!fechaDDMMAAAA) return obtenerFechaHoyISO();
  if (fechaDDMMAAAA.includes('-')) return fechaDDMMAAAA;
  const partes = fechaDDMMAAAA.split('/');
  if (partes.length !== 3) return obtenerFechaHoyISO();
  const [dd, mm, yyyy] = partes;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
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
// 4. LÓGICA DEL FORMULARIO DE ALTA Y VALIDACIONES
// =========================================================================

function inicializarFormulario() {
  fechaActualStr = obtenerFechaHoyISO();
  inputFecha.value = fechaActualStr;
  previewId.textContent = `#${calcularSiguienteID()}`;
}

function verificarCambioDeDiaAutomatico() {
  const hoy = obtenerFechaHoyISO();
  if (hoy !== fechaActualStr) {
    fechaActualStr = hoy;
    inputFecha.value = hoy;
  }
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
    inputFecha.value = obtenerFechaHoyISO();
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

  const fechaISO = inputFecha.value || obtenerFechaHoyISO();
  const areaFinal =
    selectArea.value === 'OTRA' ? inputOtraArea.value.trim() : selectArea.value;
  const tipoServicio = document.querySelector('input[name="tipoServicio"]:checked').value;

  const nuevaTarea = {
    ID_Tarea: calcularSiguienteID(),
    Fecha_Solicitud: formatearFechaDDMMAAAA(fechaISO),
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
// 5. RENDERIZADO DEL TABLERO, MÉTRICAS Y FILTROS
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
            <button type="button" class="btn-sm btn-edit" onclick="abrirModalEditar(${tarea.ID_Tarea})">
              Editar
            </button>
            <button type="button" class="btn-sm" onclick="abrirModalEstado(${tarea.ID_Tarea})">
              Estado
            </button>
            <button type="button" class="btn-sm btn-danger" onclick="abrirModalEliminar(${tarea.ID_Tarea})">
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
// 6. MODALES: EDITAR REGISTRO COMPLETO, ESTADO RÁPIDO Y ELIMINAR
// =========================================================================

// --- A. Modal de Estado Rápido ---
window.abrirModalEstado = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  idTareaEnEdicion = Number(tarea.ID_Tarea);
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

document.getElementById('btn-confirmar-estado').addEventListener('click', () => {
  if (idTareaEnEdicion === null) return;

  const nuevoEstado = selectNuevoEstado.value;
  const permitidos = ['Pendiente', 'En proceso', 'Terminado'];
  if (!permitidos.includes(nuevoEstado)) return;

  const indice = tareas.findIndex((t) => Number(t.ID_Tarea) === idTareaEnEdicion);
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

// --- B. Modal de Edición / Modificación Completa ---
function poblarSelectAreaEdicion() {
  editArea.innerHTML = selectArea.innerHTML;
}

editArea.addEventListener('change', () => {
  if (editArea.value === 'OTRA') {
    editGrupoOtraArea.classList.remove('oculto');
    editOtraAreaTexto.focus();
  } else {
    editGrupoOtraArea.classList.add('oculto');
    editOtraAreaTexto.value = '';
  }
});

window.abrirModalEditar = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  idTareaModificando = Number(tarea.ID_Tarea);
  document.getElementById('edit-folio-titulo').textContent = `#${tarea.ID_Tarea}`;

  editFecha.value = formatearFechaISO(tarea.Fecha_Solicitud);
  editEquipo.value = tarea.Equipo_Afectado || '';
  editEstado.value = tarea.Estado_Seguimiento || 'Pendiente';
  editDescripcion.value = tarea.Descripcion_Falla || '';

  const radioTipo = document.querySelector(
    `input[name="editTipoServicio"][value="${tarea.Tipo_Servicio}"]`
  );
  if (radioTipo) radioTipo.checked = true;

  const existeEnLista = Array.from(editArea.options).some(
    (opt) => opt.value === tarea.Area_Solicitante && opt.value !== 'OTRA'
  );

  if (existeEnLista) {
    editArea.value = tarea.Area_Solicitante;
    editGrupoOtraArea.classList.add('oculto');
    editOtraAreaTexto.value = '';
  } else {
    editArea.value = 'OTRA';
    editGrupoOtraArea.classList.remove('oculto');
    editOtraAreaTexto.value = tarea.Area_Solicitante || '';
  }

  modalEditar.classList.remove('oculto');
};

function cerrarModalEditar() {
  idTareaModificando = null;
  modalEditar.classList.add('oculto');
}

document.getElementById('btn-cerrar-editar').addEventListener('click', cerrarModalEditar);
document.getElementById('btn-cancelar-editar').addEventListener('click', cerrarModalEditar);
modalEditar.addEventListener('click', (e) => {
  if (e.target === modalEditar) cerrarModalEditar();
});

formEditarTarea.addEventListener('submit', (e) => {
  e.preventDefault();
  if (idTareaModificando === null) return;

  const areaFinal =
    editArea.value === 'OTRA' ? editOtraAreaTexto.value.trim() : editArea.value;
  const equipoFinal = editEquipo.value.trim();
  const descripcionFinal = editDescripcion.value.trim();
  const tipoRadio = document.querySelector('input[name="editTipoServicio"]:checked');

  if (!editFecha.value || !areaFinal || !equipoFinal || !descripcionFinal || !tipoRadio) {
    mostrarNotificacion('Completa todos los campos antes de guardar cambios.', 'error');
    return;
  }

  const indice = tareas.findIndex((t) => Number(t.ID_Tarea) === idTareaModificando);
  if (indice !== -1) {
    tareas[indice] = {
      ...tareas[indice],
      Fecha_Solicitud: formatearFechaDDMMAAAA(editFecha.value),
      Area_Solicitante: areaFinal,
      Equipo_Afectado: equipoFinal,
      Tipo_Servicio: tipoRadio.value,
      Descripcion_Falla: descripcionFinal,
      Estado_Seguimiento: editEstado.value
    };

    guardarTareas(tareas);
    renderizarTablero();
    mostrarNotificacion(`Registro #${idTareaModificando} modificado correctamente.`, 'success');
  }

  cerrarModalEditar();
});

// --- C. Modal de Eliminación (Compatible con iPhone y Android) ---
window.abrirModalEliminar = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  idTareaEliminando = Number(tarea.ID_Tarea);
  document.getElementById('del-id-tarea').textContent = `#${tarea.ID_Tarea}`;
  document.getElementById('del-area').textContent = tarea.Area_Solicitante;
  document.getElementById('del-equipo').textContent = tarea.Equipo_Afectado;

  modalEliminar.classList.remove('oculto');
};

function cerrarModalEliminar() {
  idTareaEliminando = null;
  modalEliminar.classList.add('oculto');
}

document.getElementById('btn-cerrar-eliminar').addEventListener('click', cerrarModalEliminar);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalEliminar);
modalEliminar.addEventListener('click', (e) => {
  if (e.target === modalEliminar) cerrarModalEliminar();
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
  if (idTareaEliminando === null) return;

  const folioEliminado = idTareaEliminando;
  tareas = tareas.filter((t) => Number(t.ID_Tarea) !== folioEliminado);
  guardarTareas(tareas);
  renderizarTablero();
  cerrarModalEliminar();
  mostrarNotificacion(`Registro #${folioEliminado} eliminado.`, 'info');
});

// =========================================================================
// 7. GENERADOR DE EXCEL .XLSX CON FORMATO INSTITUCIONAL
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

      const lineasEstimadas = Math.max(
        1,
        Math.ceil((t.Descripcion_Falla || '').length / 48)
      );
      alturasFilas.push({ hpt: Math.max(22, lineasEstimadas * 15 + 6) });
    });

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

    const filaFinalIdx = filas.length - 1;
    hojaHistorial['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: filaFinalIdx, c: 0 }, e: { r: filaFinalIdx, c: 6 } }
    ];

    hojaHistorial['!cols'] = [
      { wch: 11 },
      { wch: 16 },
      { wch: 30 },
      { wch: 24 },
      { wch: 15 },
      { wch: 52 },
      { wch: 19 }
    ];
    hojaHistorial['!rows'] = alturasFilas;
    hojaHistorial['!autofilter'] = { ref: `A5:G${5 + total}` };

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
// 8. CONFIGURACIÓN Y ENLACE RÁPIDO PARA OTROS DISPOSITIVOS
// =========================================================================

function actualizarVisibilidadCompartir() {
  const tokenActual = inputSyncToken.value.trim();
  if (tokenActual) {
    cajaCompartirSync.classList.remove('oculto');
  } else {
    cajaCompartirSync.classList.add('oculto');
  }
}

function abrirModalSync() {
  const cfg = obtenerConfigSync();
  inputSyncOwner.value = cfg.owner;
  inputSyncRepo.value = cfg.repo;
  inputSyncToken.value = cfg.token;
  actualizarVisibilidadCompartir();
  modalSync.classList.remove('oculto');
}

function cerrarModalSync() {
  modalSync.classList.add('oculto');
}

inputSyncToken.addEventListener('input', actualizarVisibilidadCompartir);
document.getElementById('indicador-almacenamiento').addEventListener('click', abrirModalSync);
document.getElementById('btn-cerrar-sync').addEventListener('click', cerrarModalSync);
document.getElementById('btn-cancelar-sync').addEventListener('click', cerrarModalSync);

modalSync.addEventListener('click', (e) => {
  if (e.target === modalSync) cerrarModalSync();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modalEstado.classList.contains('oculto')) cerrarModalEstado();
    if (!modalEditar.classList.contains('oculto')) cerrarModalEditar();
    if (!modalEliminar.classList.contains('oculto')) cerrarModalEliminar();
    if (!modalSync.classList.contains('oculto')) cerrarModalSync();
  }
});

document.getElementById('btn-copiar-enlace-sync').addEventListener('click', async () => {
  const tokenPlano = inputSyncToken.value.trim();
  if (!tokenPlano) return;

  const base = `${window.location.origin}${window.location.pathname}`;
  const enlace = `${base}?token=${encodeURIComponent(codificarTokenSeguro(tokenPlano))}`;

  try {
    await navigator.clipboard.writeText(enlace);
    mostrarNotificacion('Enlace copiado. Ábrelo una vez en tu celular y quedará listo.', 'success');
  } catch (e) {
    window.prompt('Copia este enlace y ábrelo en tu celular:', enlace);
  }
});

document.getElementById('btn-copiar-clave-codigo').addEventListener('click', async () => {
  const tokenPlano = inputSyncToken.value.trim();
  if (!tokenPlano) return;

  const codificado = codificarTokenSeguro(tokenPlano);
  try {
    await navigator.clipboard.writeText(codificado);
    mostrarNotificacion('Clave codificada copiada. Pégala en tokenCodificado dentro de app.js.', 'success');
  } catch (e) {
    window.prompt('Copia esta clave codificada para js/app.js:', codificado);
  }
});

document.getElementById('btn-guardar-sync').addEventListener('click', async () => {
  const owner = inputSyncOwner.value.trim();
  const repo = inputSyncRepo.value.trim();
  const token = inputSyncToken.value.trim();

  if (!owner || !repo) {
    mostrarNotificacion('Verifica tu usuario y repositorio de GitHub.', 'error');
    return;
  }

  guardarConfigSync({ owner, repo, token });
  cerrarModalSync();

  if (token) {
    if (tareas.length > 0) {
      await subirTareasAGitHub(tareas);
      mostrarNotificacion('Sincronizado con GitHub correctamente.', 'success');
    } else {
      await sincronizarDesdeGitHub(false);
    }
  } else {
    await sincronizarDesdeGitHub(false);
  }
});

// =========================================================================
// 9. ARRANQUE INICIAL Y ACTUALIZACIÓN EN SEGUNDO PLANO
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  capturarTokenDesdeURL();
  poblarSelectAreaEdicion();
  tareas = obtenerTareasLocal();
  inicializarFormulario();
  renderizarTablero();

  await sincronizarDesdeGitHub(true);

  setInterval(() => {
    verificarCambioDeDiaAutomatico();
    if (document.visibilityState === 'visible') {
      sincronizarDesdeGitHub(true);
    }
  }, INTERVALO_AUTO_SYNC_MS);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    verificarCambioDeDiaAutomatico();
    sincronizarDesdeGitHub(true);
  }
});
