/**
 * Sistema de Control y Seguimiento de Tareas Técnicas
 * H. Ayuntamiento Constitucional de Río Blanco, Veracruz - Departamento de Sistemas
 * Archivo Principal de Lógica (js/app.js)
 */

const STORAGE_KEY = 'rioblanco_sistemas_tareas_v1';
const CATALOGO_PERSONAL_KEY = 'rioblanco_catalogo_personal_v1';
const SYNC_CONFIG_KEY = 'rioblanco_github_sync_cfg_v1';
const ARCHIVO_REMOTO = 'tareas.json';
const ARCHIVO_CATALOGO_REMOTO = 'personal.json';
const INTERVALO_AUTO_SYNC_MS = 10000;

// =========================================================================
// CONFIGURACIÓN GLOBAL AUTOMÁTICA (PARA NO ESCRIBIR EL TOKEN EN CADA EQUIPO)
// =========================================================================
const GITHUB_GLOBAL_CONFIG = {
  owner: 'OswaldoOR',
  repo: 'prueba1',
  tokenCodificado: ''
};

// =========================================================================
// CATÁLOGO BASE DE PERSONAL POR ÁREA (EXTRAÍDO DE NOMBRES.xlsx)
// =========================================================================
const CATALOGO_PERSONAL_BASE = {
  'PRESIDENCIA': [
    { nombre: 'JOSE ANTONIO MAY', puesto: 'PRESIDENCIA', tipo: 'CONFIANZA' },
    { nombre: 'AMANDO', puesto: 'SECRETARIO DE PRESIDENCIA', tipo: 'CONFIANZA' },
    { nombre: 'LIZ', puesto: 'ASISTENTE PRESIDENCIA', tipo: 'CONFIANZA' },
    { nombre: 'KATY', puesto: 'MONITORISTA 1', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'MONITORISTA 2', tipo: 'CONFIANZA' },
    { nombre: 'LUCERO', puesto: 'RECEPCION', tipo: 'CONFIANZA' }
  ],
  'SECRETARIO': [
    { nombre: 'URIEL', puesto: 'SECRETARIO', tipo: 'CONFIANZA' },
    { nombre: 'RODOLFO', puesto: 'SECRE DEL SECRE DEL AYUN', tipo: 'SINDICATO' },
    { nombre: 'AUX1', puesto: 'AUX SECRETARIO', tipo: 'PRACTICANTE' }
  ],
  'REGIDURIAS': [
    { nombre: 'REG 1 ARLETH JIMNEZ', puesto: 'REGIDORA 1', tipo: 'CONFIANZA' },
    { nombre: 'REG 2 JORGE HDZ', puesto: 'REGIDOR 2', tipo: 'CONFIANZA' },
    { nombre: 'REG 3 ALEYDA RODRIGUEZ', puesto: 'REGIDORA 3', tipo: 'CONFIANZA' },
    { nombre: 'REG 4 AIKO MARTINEZ', puesto: 'REGIDORA 4', tipo: 'CONFIANZA' },
    { nombre: 'REG 5 CESAR ALCARAZ', puesto: 'REGIDOR 5', tipo: 'CONFIANZA' },
    { nombre: 'REG 6 FRED OLIVARES', puesto: 'REGIDOR 6', tipo: 'CONFIANZA' },
    { nombre: 'CRISTINA', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' },
    { nombre: 'PATY', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' },
    { nombre: 'CLAUDIA CAMPOS', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' },
    { nombre: 'GUADALUPE ALVARADO', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' },
    { nombre: 'PILAR', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' },
    { nombre: 'ELIZETH', puesto: 'AUX REG / SECRETARIA', tipo: 'SINDICATO' }
  ],
  'TESORERIA': [
    { nombre: 'MARCO SANCHEZ', puesto: 'TESORERO', tipo: 'CONFIANZA' },
    { nombre: 'JENY', puesto: 'AUX TESORERIA', tipo: 'CONFIANZA' },
    { nombre: 'ISA', puesto: 'SECRE TESO', tipo: 'SINDICATO' }
  ],
  'CONTADURIA': [
    { nombre: 'ANGEL DE JESUS', puesto: 'CONTRALOR', tipo: 'CONFIANZA' },
    { nombre: 'DANIELA', puesto: 'AUX', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX CONTADURIA', tipo: 'PRACTICANTE' }
  ],
  'COMUNICACIÓN': [
    { nombre: 'CRISTIAN LOPEZ', puesto: 'DIRECTOR COMUNI. DIG.', tipo: 'CONFIANZA' },
    { nombre: 'GUILLERMO CARREON', puesto: 'COMUN. SOCIAL', tipo: 'CONFIANZA' },
    { nombre: 'GERSON', puesto: 'AUX COMUN. SOCIAL', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX COMUN. SOCIAL', tipo: 'PRACTICANTE' },
    { nombre: 'AUX2', puesto: 'AUX COMUN. SOCIAL', tipo: 'PRACTICANTE' }
  ],
  'JURIDICO': [
    { nombre: 'ELOY BAROJAS', puesto: 'TITULAR JURIDICO', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO', puesto: 'AUX JURIDICO', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX JURIDICO', tipo: 'PRACTICANTE' }
  ],
  'INMUJER': [
    { nombre: 'TERESITA DE JESUS', puesto: 'DIRECTORA', tipo: 'CONFIANZA' },
    { nombre: 'ADAMARY', puesto: 'AUX INMUJER', tipo: 'CONFIANZA' },
    { nombre: 'AUX2', puesto: 'AUX INMUJER', tipo: 'CONFIANZA' },
    { nombre: 'LIZ', puesto: 'PSICOLOGA', tipo: 'CONFIANZA' },
    { nombre: 'JOSE ANGEL', puesto: 'ABOGADO INMUJER', tipo: 'CONFIANZA' },
    { nombre: 'JUAN MANUEL REYES', puesto: 'TITULAR SIPINNA', tipo: 'CONFIANZA' }
  ],
  'TRANSPARENCIA': [
    { nombre: 'JAVIER SHETINNO', puesto: 'TITULAR TRANSPARENCIA', tipo: 'CONFIANZA' }
  ],
  'SISTEMAS': [
    { nombre: 'RODOLFO ZAMORA', puesto: 'TITULAR SISTEMAS', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX', tipo: 'PRACTICANTE' }
  ],
  'OBRAS PUBLICAS': [
    { nombre: 'CARLOS GARCIA', puesto: 'DIREC. OBRAS PUB.', tipo: 'CONFIANZA' },
    { nombre: 'RIGOBERTO ALELUYA', puesto: 'AUX OBRAS PUBLICAS', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 1', puesto: 'INSPECTOR DE OBRA', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 2', puesto: 'INSPECTOR DE OBRA', tipo: 'CONFIANZA' },
    { nombre: 'ROBERTO CID', puesto: 'RAMOS 033', tipo: 'CONFIANZA' },
    { nombre: 'WALDO TORNELL', puesto: 'TITULAR DESARROLLO URBANO', tipo: 'CONFIANZA' },
    { nombre: 'KARLA', puesto: 'AUX DESA. URB.', tipo: 'CONFIANZA' },
    { nombre: 'AUX 1', puesto: 'AUX DESA. URB.', tipo: 'PRACTICANTE' },
    { nombre: 'VICTOR BERNAL', puesto: 'ASISTENTE DES. URB.', tipo: 'SINDICATO' },
    { nombre: 'GIOVANNI', puesto: 'AUX OBRAS PUBLICAS', tipo: 'SINDICATO' },
    { nombre: 'VERONICA', puesto: 'AUX OBRAS PUBLICAS', tipo: 'SINDICATO' },
    { nombre: 'AUX 2', puesto: 'AUX OBRAS PUBLICAS', tipo: 'PRACTICANTE' },
    { nombre: 'ESVEIDY', puesto: 'RECEPCION OBRAS PUB.', tipo: 'SINDICATO' },
    { nombre: 'DELFINO', puesto: 'RECEPCION OBRAS PUB.', tipo: 'SINDICATO' }
  ],
  'DESARROLLO ECONOMICO Y COMERCIO': [
    { nombre: 'JESUS BLASS', puesto: 'DIREC. COMERCIO', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'AUX COMERCIO', tipo: 'CONFIANZA' },
    { nombre: 'ULISES', puesto: 'ASISTENTE DE COMERCIO', tipo: 'SINDICATO' },
    { nombre: 'SIN NOMBRE', puesto: 'ENCARGADA MERCADO', tipo: 'CONFIANZA' }
  ],
  'CONTABILIDAD': [
    { nombre: 'SERBANDO', puesto: 'TITULAR CONTABILIDAD', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'AUX CONTABILIDAD', tipo: 'CONFIANZA' },
    { nombre: 'DANIELA', puesto: 'AUX CONTABILIDAD', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX CONTABILIDAD', tipo: 'PRACTICANTE' }
  ],
  'RRHH': [
    { nombre: 'ERIKA', puesto: 'TITULAR RRHH', tipo: 'CONFIANZA' },
    { nombre: 'ANELY', puesto: 'AUX RRHH', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX RRHH', tipo: 'PRACTICANTE' }
  ],
  'PROVEEDURIA': [
    { nombre: 'KARINA', puesto: 'TITULAR PROVEEDURIA', tipo: 'CONFIANZA' },
    { nombre: 'ANGELICA', puesto: 'AUX PROVEEDURIA', tipo: 'CONFIANZA' },
    { nombre: 'PABLO', puesto: 'AUX PROVEEDURIA', tipo: 'CONFIANZA' },
    { nombre: 'LUIS', puesto: 'AUX PROVEEDURIA', tipo: 'CONFIANZA' }
  ],
  'SINDICATURA': [
    { nombre: 'AIDE CRUZ', puesto: 'SINDICO', tipo: 'CONFIANZA' },
    { nombre: 'DIANA AUX2', puesto: 'SINDICO', tipo: 'CONFIANZA' },
    { nombre: 'INGRID AUX1', puesto: 'SINDICO', tipo: 'CONFIANZA' }
  ],
  'CATASTRO': [
    { nombre: 'ANGEL RGUEZ', puesto: 'TITULAR CATASTRO', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 1G', puesto: 'AUX CATASTRO', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 2A', puesto: 'AUX CATASTRO', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 3P', puesto: 'AUX CATASTRO', tipo: 'CONFIANZA' },
    { nombre: 'NADIA', puesto: 'ASISTENTE SINDICATO', tipo: 'SINDICATO' }
  ],
  'INGRESOS': [
    { nombre: 'GOYITA BRENIS', puesto: 'TITULAR INGRESOS', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE (AUX1)', puesto: 'ASISTENTE INGRESOS', tipo: 'PRACTICANTE' },
    { nombre: 'SIN NOMBRE', puesto: 'CAJA 1', tipo: 'CONFIANZA' },
    { nombre: 'ALEYRA', puesto: 'CAJA 2', tipo: 'SINDICATO' },
    { nombre: 'USUARIO 3', puesto: 'CAJA 3', tipo: 'SINDICATO' },
    { nombre: 'USUARIO 4', puesto: 'CAJA 4', tipo: 'SINDICATO' },
    { nombre: 'USUARIO 5', puesto: 'CAJA 5', tipo: 'SINDICATO' },
    { nombre: 'AUX2', puesto: 'AUX INGRESOS', tipo: 'PRACTICANTE' },
    { nombre: 'AUX3', puesto: 'AUX INGRESOS', tipo: 'PRACTICANTE' }
  ],
  'EGRESOS': [
    { nombre: 'JUDITH SOLANO', puesto: 'TITULAR EGRESOS', tipo: 'CONFIANZA' }
  ],
  'TRANSPORTE': [
    { nombre: 'SARA', puesto: 'TITULAR TRANSPORTE', tipo: 'CONFIANZA' },
    { nombre: 'JORGE MARIN', puesto: 'ENCARGADO PARQ.', tipo: 'CONFIANZA' }
  ],
  'DESARROLLO SOCIAL Y HUMANO': [
    { nombre: 'ELIZABETH CANTERO', puesto: 'DIRECTORA DESARROLLO SOC.', tipo: 'CONFIANZA' },
    { nombre: 'PAULO', puesto: 'COORD. DEPORTE', tipo: 'CONFIANZA' },
    { nombre: 'OSCAR', puesto: 'COORD. SALUD', tipo: 'CONFIANZA' },
    { nombre: 'ANGEL OSORIO', puesto: 'COORD. SALUD ANIMAL', tipo: 'CONFIANZA' },
    { nombre: 'VICTOR GTZ', puesto: 'COORD. TURISMO', tipo: 'CONFIANZA' },
    { nombre: 'BELEN MERINO', puesto: 'COORD. JUVENTUD', tipo: 'CONFIANZA' },
    { nombre: 'GABRIEL BELLO', puesto: 'COORD. EDUCACION', tipo: 'CONFIANZA' },
    { nombre: 'CLEMENTINA', puesto: 'ENCARGADA BIBLIOTECA 1', tipo: 'CONFIANZA' },
    { nombre: 'IRMA', puesto: 'AUX BIBLIOTECA', tipo: 'SINDICATO' },
    { nombre: 'RODRIGO', puesto: 'AUX DEPORTE', tipo: 'CONFIANZA' }
  ],
  'SERVICIOS MUNICIPALES': [
    { nombre: 'ORESTES RUIZ', puesto: 'DIREC. SERV. HUMANOS', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'AUX SERV. MUNICIPALES', tipo: 'CONFIANZA' }
  ],
  'SERVICIOS AMBIENTALES': [
    { nombre: 'QUERORIMI', puesto: 'DIREC. SERV. AMBIENTALES', tipo: 'CONFIANZA' },
    { nombre: 'MARY', puesto: 'AUX SERV. AMBIENTALES', tipo: 'CONFIANZA' }
  ],
  'PROTECCION CIVIL': [
    { nombre: 'RAFAEL GARCIA', puesto: 'DIREC. PC', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 1', puesto: 'AUX PC', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 2', puesto: 'AUX PC', tipo: 'CONFIANZA' }
  ],
  'PANTEON': [
    { nombre: 'PREFECTO', puesto: 'ENCARGADO PANTEON', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'ASISTENTE PANTEON', tipo: 'SINDICATO' },
    { nombre: 'ALVARO', puesto: 'CAJA PANTEON', tipo: 'SINDICATO' }
  ],
  'GOBERNACION': [
    { nombre: 'CRISTIAN MADRID', puesto: 'DIREC. GOBERNACION', tipo: 'CONFIANZA' },
    { nombre: 'JESUS MARIN', puesto: 'AUX GOBERNACION', tipo: 'CONFIANZA' },
    { nombre: 'JASSEL', puesto: 'AUX GOBERNACION', tipo: 'CONFIANZA' }
  ],
  'PARTICIPACION CIUDADANA': [
    { nombre: 'LUZ MARIA', puesto: 'DIREC PARTICIPACION', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'AUX PARTICIPACION', tipo: 'CONFIANZA' },
    { nombre: 'SHIRLEY', puesto: 'AUX PARTICIPACION', tipo: 'CONFIANZA' }
  ],
  'REGISTRO CIVIL': [
    { nombre: 'HEBER TECA', puesto: 'OFICIAL RC', tipo: 'CONFIANZA' },
    { nombre: 'LUCERO', puesto: 'AUX RC', tipo: 'CONFIANZA' },
    { nombre: 'VERONICA', puesto: 'ASISTENTE RC', tipo: 'SINDICATO' },
    { nombre: 'BLANCA', puesto: 'ASISTENTE RC', tipo: 'SINDICATO' },
    { nombre: 'SUPLENTE', puesto: 'ASISTENTE RC', tipo: 'SINDICATO' },
    { nombre: 'JOSE LUIS', puesto: 'ASISTENTE RC', tipo: 'SINDICATO' },
    { nombre: 'FABIOLA', puesto: 'CAJA RC', tipo: 'SINDICATO' }
  ],
  'PRESIDENCIA DIF': [
    { nombre: 'GABY RGUEZ', puesto: 'PRESIDENTA DIF', tipo: 'CONFIANZA' },
    { nombre: 'MILI', puesto: 'DIREC. DIF', tipo: 'CONFIANZA' },
    { nombre: 'CARMEN', puesto: 'AUX1 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'MONSE VERA', puesto: 'AUX2 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'AUX3 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'ROSI', puesto: 'AUX4 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'CONCHITA', puesto: 'AUX5 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'LULA', puesto: 'AUX6 PRESIDENCIA DIF', tipo: 'CONFIANZA' },
    { nombre: 'IVONNE', puesto: 'ENCARGADA CAIC', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 1', puesto: 'AUX CAIC', tipo: 'CONFIANZA' },
    { nombre: 'SANDRA', puesto: 'ENCARGADA CASA ABUELO', tipo: 'CONFIANZA' }
  ],
  'CONSULTORIOS DIF': [
    { nombre: 'JOSEPH MAY', puesto: 'DR. DIF', tipo: 'CONFIANZA' },
    { nombre: 'FANNY', puesto: 'ASISTENTE DR. DIF', tipo: 'CONFIANZA' },
    { nombre: 'MELANY', puesto: 'DENTISTA DIF', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'PSICOLOGA DIF', tipo: 'CONFIANZA' },
    { nombre: 'AUX1', puesto: 'AUX PSICOLOGA DIF', tipo: 'CONFIANZA' },
    { nombre: 'LENNY', puesto: 'PROCURADORA DIF', tipo: 'CONFIANZA' },
    { nombre: 'USUARIO 1', puesto: 'ASISTENTE PROCURADORA DIF', tipo: 'CONFIANZA' },
    { nombre: 'KARO', puesto: 'CAJERA DIF', tipo: 'CONFIANZA' },
    { nombre: 'SIN NOMBRE', puesto: 'FISIOTERAPEUTA DIF', tipo: 'CONFIANZA' }
  ],
  'SINDICATO': [
    { nombre: 'KATIA', puesto: 'SECRETARIA GRAL.', tipo: 'SINDICATO' }
  ]
};

// =========================================================================
// 1. PERSISTENCIA LOCAL + SINCRONIZACIÓN AUTOMÁTICA CON GITHUB
// =========================================================================

let ultimoShaRemoto = null;
let ultimoShaCatalogoRemoto = null;
let sincronizandoAhora = false;
let subiendoAhora = false;
let versionLocal = 0;
let colaGuardadoRemoto = Promise.resolve();

let catalogoPersonal = {};

function clonarObjeto(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cargarCatalogoLocal() {
  try {
    const raw = localStorage.getItem(CATALOGO_PERSONAL_KEY);
    if (!raw) return clonarObjeto(CATALOGO_PERSONAL_BASE);
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return clonarObjeto(CATALOGO_PERSONAL_BASE);
  } catch (e) {
    console.warn('Error al leer catálogo local, usando base:', e);
    return clonarObjeto(CATALOGO_PERSONAL_BASE);
  }
}

function guardarCatalogoLocal(catalogo) {
  localStorage.setItem(CATALOGO_PERSONAL_KEY, JSON.stringify(catalogo));
}

function guardarCatalogo(catalogo) {
  guardarCatalogoLocal(catalogo);
  const copiaCatalogo = clonarObjeto(catalogo);
  colaGuardadoRemoto = colaGuardadoRemoto.then(() =>
    subirArchivoAGitHub(ARCHIVO_CATALOGO_REMOTO, copiaCatalogo, true)
  );
}

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

async function subirArchivoAGitHub(nombreArchivo, contenidoDatos, esCatalogo = false, reintento = 0) {
  const cfg = obtenerConfigSync();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    if (!esCatalogo) {
      actualizarIndicadorSync('local', 'Solo lectura (Clic p/ activar Sync)');
      mostrarNotificacion(
        'Este navegador aún no tiene permiso de escritura. Haz clic arriba en "Solo lectura" para vincularlo.',
        'error'
      );
    }
    return false;
  }

  subiendoAhora = true;
  if (!esCatalogo) {
    actualizarIndicadorSync('syncing', 'Guardando en GitHub...');
  }

  const endpoint = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${nombreArchivo}`;
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

    const contenidoJSON = JSON.stringify(contenidoDatos, null, 2);
    const body = {
      message: esCatalogo
        ? 'Sync directorio de personal'
        : `Sync tareas (${Array.isArray(contenidoDatos) ? contenidoDatos.length : 0})`,
      content: utf8ToBase64(contenidoJSON)
    };
    if (shaActual) body.sha = shaActual;

    const resPut = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (resPut.status === 409 && reintento < 2) {
      return subirArchivoAGitHub(nombreArchivo, contenidoDatos, esCatalogo, reintento + 1);
    }

    if (!resPut.ok) {
      const detalle = await resPut.json().catch(() => ({}));
      throw new Error(detalle.message || `Error HTTP ${resPut.status}`);
    }

    const respuestaPut = await resPut.json();
    if (respuestaPut.content && respuestaPut.content.sha) {
      if (esCatalogo) {
        ultimoShaCatalogoRemoto = respuestaPut.content.sha;
      } else {
        ultimoShaRemoto = respuestaPut.content.sha;
      }
    }

    actualizarIndicadorSync('online', 'Sincronizado con GitHub');
    return true;
  } catch (error) {
    console.error(`Error al guardar ${nombreArchivo} en GitHub:`, error);
    if (!esCatalogo) {
      actualizarIndicadorSync('error', 'Error Sync (Clic p/ revisar)');
      mostrarNotificacion(`Error al subir a GitHub: ${error.message}`, 'error');
    }
    return false;
  } finally {
    subiendoAhora = false;
  }
}

async function subirTareasAGitHub(listaTareas) {
  return subirArchivoAGitHub(ARCHIVO_REMOTO, listaTareas, false);
}

async function sincronizarCatalogoDesdeGitHub(cfg, headers) {
  try {
    const endpointCat = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${ARCHIVO_CATALOGO_REMOTO}?t=${Date.now()}`;
    const resCat = await fetch(endpointCat, { headers, cache: 'no-store' });
    if (resCat.ok) {
      const dataCat = await resCat.json();
      if (dataCat.sha && dataCat.sha !== ultimoShaCatalogoRemoto) {
        const textoCat = base64ToUtf8(dataCat.content || '');
        const catRemoto = JSON.parse(textoCat);
        if (catRemoto && typeof catRemoto === 'object' && !Array.isArray(catRemoto)) {
          ultimoShaCatalogoRemoto = dataCat.sha;
          catalogoPersonal = catRemoto;
          guardarCatalogoLocal(catalogoPersonal);
          sincronizarAreasEnSelects();
          if (selectArea.value) {
            desplegarPersonalPorArea(selectArea.value);
          }
        }
      }
    }
  } catch (e) {
    // Si aún no existe personal.json en el repo, se mantiene el catálogo local
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

      await sincronizarCatalogoDesdeGitHub(cfg, headers);

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
  const copiaInstantanea = clonarObjeto(listaTareas);
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

const selectPersona = document.getElementById('persona-solicitante');
const btnEditarCatalogoInline = document.getElementById('btn-editar-catalogo-inline');

const fichaPersonaCard = document.getElementById('ficha-persona-seleccionada');
const btnModificarPersonaActual = document.getElementById('btn-modificar-persona-actual');
const detalleNombre = document.getElementById('detalle-nombre');
const detallePuesto = document.getElementById('detalle-puesto');
const detalleTipo = document.getElementById('detalle-tipo');

const grupoOtraPersona = document.getElementById('grupo-otra-persona');
const inputOtraPersona = document.getElementById('otra-persona-texto');
const inputOtraPersonaPuesto = document.getElementById('otra-persona-puesto');
const selectOtraPersonaTipo = document.getElementById('otra-persona-tipo');
const checkGuardarEnCatalogo = document.getElementById('guardar-en-catalogo');

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

// Modal 1: Estado Rápido
const modalEstado = document.getElementById('modal-estado');
const selectNuevoEstado = document.getElementById('select-nuevo-estado');

// Modal 2: Edición Completa
const modalEditar = document.getElementById('modal-editar');
const formEditarTarea = document.getElementById('form-editar-tarea');
const editFecha = document.getElementById('edit-fecha');
const editArea = document.getElementById('edit-area');
const editGrupoOtraArea = document.getElementById('edit-grupo-otra-area');
const editOtraAreaTexto = document.getElementById('edit-otra-area-texto');
const editPersona = document.getElementById('edit-persona');
const editGrupoOtraPersona = document.getElementById('edit-grupo-otra-persona');
const editOtraPersonaTexto = document.getElementById('edit-otra-persona-texto');
const editPuesto = document.getElementById('edit-puesto');
const editTipoPlaza = document.getElementById('edit-tipo-plaza');
const editEquipo = document.getElementById('edit-equipo');
const editEstado = document.getElementById('edit-estado');
const editDescripcion = document.getElementById('edit-descripcion');

// Modal 3: Eliminar
const modalEliminar = document.getElementById('modal-eliminar');

// Modal 4: Catálogo / Directorio de Personal
const modalCatalogo = document.getElementById('modal-catalogo');
const catSelectArea = document.getElementById('cat-select-area');
const formCatalogoPersona = document.getElementById('form-catalogo-persona');
const tituloFormCat = document.getElementById('titulo-form-cat');
const inputCatEditIndex = document.getElementById('cat-edit-index');
const inputCatNombre = document.getElementById('cat-nombre');
const inputCatPuesto = document.getElementById('cat-puesto');
const selectCatTipo = document.getElementById('cat-tipo');
const catListaPersonal = document.getElementById('cat-lista-personal');

// Modal 5: Sync GitHub
const modalSync = document.getElementById('modal-sync');
const inputSyncOwner = document.getElementById('sync-owner');
const inputSyncRepo = document.getElementById('sync-repo');
const inputSyncToken = document.getElementById('sync-token');
const cajaCompartirSync = document.getElementById('caja-compartir-sync');

// =========================================================================
// 3. UTILIDADES DE FECHA, ID, BADGES Y NOTIFICACIONES
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

function obtenerClasePlaza(tipo) {
  const t = (tipo || '').toUpperCase().trim();
  if (t === 'CONFIANZA') return 'plaza-confianza';
  if (t === 'SINDICATO') return 'plaza-sindicato';
  if (t === 'PRACTICANTE') return 'plaza-practicante';
  return 'plaza-otro';
}

function esSinNombre(nombre) {
  return (nombre || '').toUpperCase().includes('SIN NOMBRE');
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
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
// 4. DESPLIEGUE EN CASCADA (ÁREA -> PERSONAL -> PUESTO Y TIPO CAPTURADO)
// =========================================================================

function sincronizarAreasEnSelects() {
  const valorActual = selectArea.value;
  const areasEnSelect = new Set(Array.from(selectArea.options).map((o) => o.value));
  const opcionOtra = selectArea.querySelector('option[value="OTRA"]');

  Object.keys(catalogoPersonal).forEach((areaClave) => {
    if (!areasEnSelect.has(areaClave) && areaClave !== 'OTRA') {
      const opt = document.createElement('option');
      opt.value = areaClave;
      opt.textContent = areaClave;
      if (opcionOtra) {
        selectArea.insertBefore(opt, opcionOtra);
      } else {
        selectArea.appendChild(opt);
      }
      areasEnSelect.add(areaClave);
    }
  });

  if (valorActual) selectArea.value = valorActual;
  editArea.innerHTML = selectArea.innerHTML;
}

function ocultarFichaPersona() {
  fichaPersonaCard.classList.add('oculto');
  detalleNombre.textContent = '—';
  detallePuesto.textContent = '—';
  detalleTipo.textContent = '—';
  detalleTipo.className = 'badge-plaza';
}

function mostrarFichaPersona(personaObj) {
  if (!personaObj) {
    ocultarFichaPersona();
    return;
  }
  detalleNombre.textContent = personaObj.nombre;
  detallePuesto.textContent = personaObj.puesto || 'Sin puesto definido';
  detalleTipo.textContent = personaObj.tipo || 'CONFIANZA';
  detalleTipo.className = `badge-plaza ${obtenerClasePlaza(personaObj.tipo)}`;
  fichaPersonaCard.classList.remove('oculto');
}

function desplegarPersonalPorArea(areaSeleccionada, indicePreseleccionado = null) {
  selectPersona.innerHTML = '';
  ocultarFichaPersona();
  grupoOtraPersona.classList.add('oculto');
  inputOtraPersona.value = '';
  inputOtraPersonaPuesto.value = '';

  if (!areaSeleccionada) {
    selectPersona.disabled = true;
    btnEditarCatalogoInline.classList.add('oculto');
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Primero selecciona un área --';
    selectPersona.appendChild(opt);
    return;
  }

  selectPersona.disabled = false;
  btnEditarCatalogoInline.classList.remove('oculto');

  if (areaSeleccionada === 'OTRA') {
    const optDefault = document.createElement('option');
    optDefault.value = 'OTRA';
    optDefault.textContent = '+ Especificar nombre manualmente...';
    selectPersona.appendChild(optDefault);
    selectPersona.value = 'OTRA';
    grupoOtraPersona.classList.remove('oculto');
    return;
  }

  const lista = catalogoPersonal[areaSeleccionada] || [];

  const optPlaceholder = document.createElement('option');
  optPlaceholder.value = '';
  optPlaceholder.textContent =
    lista.length > 0
      ? `-- Selecciona personal de ${areaSeleccionada} (${lista.length}) --`
      : `-- Sin personal registrado en ${areaSeleccionada} --`;
  selectPersona.appendChild(optPlaceholder);

  lista.forEach((persona, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `${persona.nombre} — [${persona.puesto}] (${persona.tipo})`;
    selectPersona.appendChild(opt);
  });

  const optOtro = document.createElement('option');
  optOtro.value = 'OTRA';
  optOtro.textContent = '+ Otro / Especificar persona nueva...';
  selectPersona.appendChild(optOtro);

  if (
    indicePreseleccionado !== null &&
    indicePreseleccionado >= 0 &&
    indicePreseleccionado < lista.length
  ) {
    selectPersona.value = String(indicePreseleccionado);
    mostrarFichaPersona(lista[indicePreseleccionado]);
  }
}

selectArea.addEventListener('change', () => {
  limpiarErrorCampo(selectArea);
  limpiarErrorCampo(selectPersona);

  const area = selectArea.value;
  if (area === 'OTRA') {
    grupoOtraArea.classList.remove('oculto');
    inputOtraArea.focus();
  } else {
    grupoOtraArea.classList.add('oculto');
    inputOtraArea.value = '';
    limpiarErrorCampo(inputOtraArea);
  }

  desplegarPersonalPorArea(area);
});

selectPersona.addEventListener('change', () => {
  limpiarErrorCampo(selectPersona);
  const val = selectPersona.value;

  if (val === 'OTRA') {
    ocultarFichaPersona();
    grupoOtraPersona.classList.remove('oculto');
    inputOtraPersona.focus();
    return;
  }

  grupoOtraPersona.classList.add('oculto');
  inputOtraPersona.value = '';
  inputOtraPersonaPuesto.value = '';
  limpiarErrorCampo(inputOtraPersona);

  if (val === '') {
    ocultarFichaPersona();
    return;
  }

  const area = selectArea.value;
  const lista = catalogoPersonal[area] || [];
  const persona = lista[Number(val)];
  mostrarFichaPersona(persona);
});

// Botón directo en la ficha para editar si alguien renunció o estaba SIN NOMBRE
btnModificarPersonaActual.addEventListener('click', () => {
  const area = selectArea.value;
  const idx = selectPersona.value;
  if (!area || area === 'OTRA' || idx === '' || idx === 'OTRA') return;
  abrirModalCatalogo(area, Number(idx));
});

btnEditarCatalogoInline.addEventListener('click', () => {
  const area = selectArea.value && selectArea.value !== 'OTRA' ? selectArea.value : null;
  abrirModalCatalogo(area, null);
});

// =========================================================================
// 5. LÓGICA DEL FORMULARIO DE ALTA Y VALIDACIONES
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

function marcarErrorCampo(elemento) {
  const grupo = elemento.closest('.form-group');
  if (grupo) grupo.classList.add('invalido');
}

function limpiarErrorCampo(elemento) {
  const grupo = elemento.closest('.form-group');
  if (grupo) grupo.classList.remove('invalido');
}

[inputFecha, inputOtraArea, inputOtraPersona, inputEquipo, textareaDescripcion].forEach((el) => {
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

  if (!selectPersona.value) {
    marcarErrorCampo(selectPersona);
    esValido = false;
  } else if (selectPersona.value === 'OTRA' && !inputOtraPersona.value.trim()) {
    marcarErrorCampo(inputOtraPersona);
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
  const esAreaNueva = selectArea.value === 'OTRA';
  const areaFinal = esAreaNueva
    ? inputOtraArea.value.trim().toUpperCase()
    : selectArea.value;

  let personaFinal = '';
  let puestoFinal = '';
  let tipoPlazaFinal = 'CONFIANZA';

  if (selectPersona.value === 'OTRA') {
    personaFinal = inputOtraPersona.value.trim();
    puestoFinal = inputOtraPersonaPuesto.value.trim() || 'NO ESPECIFICADO';
    tipoPlazaFinal = selectOtraPersonaTipo.value || 'CONFIANZA';

    // Si marcó "Guardar en el catálogo de esta área", se agrega automáticamente
    if (checkGuardarEnCatalogo.checked && areaFinal) {
      if (!catalogoPersonal[areaFinal]) {
        catalogoPersonal[areaFinal] = [];
      }
      const yaExiste = catalogoPersonal[areaFinal].some(
        (p) =>
          p.nombre.toLowerCase() === personaFinal.toLowerCase() &&
          p.puesto.toLowerCase() === puestoFinal.toLowerCase()
      );
      if (!yaExiste) {
        catalogoPersonal[areaFinal].push({
          nombre: personaFinal,
          puesto: puestoFinal,
          tipo: tipoPlazaFinal
        });
        guardarCatalogo(catalogoPersonal);
        sincronizarAreasEnSelects();
      }
    }
  } else {
    const lista = catalogoPersonal[areaFinal] || [];
    const personaObj = lista[Number(selectPersona.value)];
    personaFinal = personaObj ? personaObj.nombre : 'No especificado';
    puestoFinal = personaObj ? personaObj.puesto : 'No especificado';
    tipoPlazaFinal = personaObj ? personaObj.tipo : 'CONFIANZA';
  }

  const tipoServicio = document.querySelector('input[name="tipoServicio"]:checked').value;

  const nuevaTarea = {
    ID_Tarea: calcularSiguienteID(),
    Fecha_Solicitud: formatearFechaDDMMAAAA(fechaISO),
    Area_Solicitante: areaFinal,
    Solicitante: personaFinal,
    Puesto_Solicitante: puestoFinal,
    Tipo_Plaza: tipoPlazaFinal,
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
  grupoOtraPersona.classList.add('oculto');
  ocultarFichaPersona();
  desplegarPersonalPorArea('');
  checkGuardarEnCatalogo.checked = true;
  document.querySelectorAll('.form-group.invalido').forEach((g) => g.classList.remove('invalido'));
  inicializarFormulario();
}

document.getElementById('btn-limpiar').addEventListener('click', resetearFormulario);

// =========================================================================
// 6. RENDERIZADO DEL TABLERO, MÉTRICAS Y FILTROS
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
    const solicitanteStr = (t.Solicitante || '').toLowerCase();
    const puestoStr = (t.Puesto_Solicitante || '').toLowerCase();
    const plazaStr = (t.Tipo_Plaza || '').toLowerCase();
    const coincideEstado = estadoFiltro === 'TODOS' || t.Estado_Seguimiento === estadoFiltro;
    const coincideTipo = tipoFiltro === 'TODOS' || t.Tipo_Servicio === tipoFiltro;
    const coincideTexto =
      !textoFiltro ||
      String(t.ID_Tarea).includes(textoFiltro) ||
      (t.Area_Solicitante || '').toLowerCase().includes(textoFiltro) ||
      solicitanteStr.includes(textoFiltro) ||
      puestoStr.includes(textoFiltro) ||
      plazaStr.includes(textoFiltro) ||
      (t.Equipo_Afectado || '').toLowerCase().includes(textoFiltro) ||
      (t.Descripcion_Falla || '').toLowerCase().includes(textoFiltro);

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
        <td colspan="10" style="text-align:center; padding: 24px; color: #64748b;">
          No se encontraron tareas que coincidan con los filtros aplicados.
        </td>
      </tr>`;
    return;
  }

  tablaBody.innerHTML = filtradas
    .map((tarea) => {
      const nombreSolicitante = tarea.Solicitante || 'No especificado';
      const puestoSolicitante = tarea.Puesto_Solicitante || '—';
      const tipoPlaza = tarea.Tipo_Plaza || '';
      const claseSinNombre = esSinNombre(nombreSolicitante) ? ' sin-nombre-tag' : '';

      return `
      <tr>
        <td data-label="Folio" class="col-id"><strong>#${tarea.ID_Tarea}</strong></td>
        <td data-label="Fecha">${escaparHTML(tarea.Fecha_Solicitud)}</td>
        <td data-label="Área">${escaparHTML(tarea.Area_Solicitante)}</td>
        <td data-label="Solicitante" class="col-solicitante">
          <span class="solicitante-pill${claseSinNombre}">${escaparHTML(nombreSolicitante)}</span>
        </td>
        <td data-label="Puesto / Tipo">
          <div class="puesto-cell">
            <span class="puesto-texto">${escaparHTML(puestoSolicitante)}</span>
            ${
              tipoPlaza
                ? `<span class="badge-plaza ${obtenerClasePlaza(tipoPlaza)}">${escaparHTML(tipoPlaza)}</span>`
                : ''
            }
          </div>
        </td>
        <td data-label="Equipo">${escaparHTML(tarea.Equipo_Afectado)}</td>
        <td data-label="Servicio"><span class="badge badge-tipo">${escaparHTML(tarea.Tipo_Servicio)}</span></td>
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
    `;
    })
    .join('');
}

filtroBusqueda.addEventListener('input', renderizarTablero);
filtroEstado.addEventListener('change', renderizarTablero);
filtroTipo.addEventListener('change', renderizarTablero);

// =========================================================================
// 7. MODALES: ESTADO RÁPIDO, EDICIÓN COMPLETA Y ELIMINACIÓN
// =========================================================================

// --- A. Modal de Estado Rápido ---
window.abrirModalEstado = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  idTareaEnEdicion = Number(tarea.ID_Tarea);
  document.getElementById('modal-id-tarea').textContent = `#${tarea.ID_Tarea}`;
  document.getElementById('modal-area').textContent = tarea.Area_Solicitante;
  document.getElementById('modal-solicitante').textContent = tarea.Solicitante || 'No especificado';

  const puestoTipoStr = [tarea.Puesto_Solicitante, tarea.Tipo_Plaza].filter(Boolean).join(' · ');
  document.getElementById('modal-puesto-tipo').textContent = puestoTipoStr || 'No especificado';
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

// --- B. Modal de Edición Completa (Cascada Área -> Persona -> Puesto/Tipo) ---
function poblarPersonalEnModalEdicion(area, nombreActual = '', puestoActual = '', tipoActual = 'CONFIANZA') {
  editPersona.innerHTML = '';

  if (!area || area === 'OTRA') {
    const optOtro = document.createElement('option');
    optOtro.value = 'OTRA';
    optOtro.textContent = '+ Especificar nombre manualmente...';
    editPersona.appendChild(optOtro);
    editPersona.value = 'OTRA';
    editGrupoOtraPersona.classList.remove('oculto');
    editOtraPersonaTexto.value = nombreActual;
    editPuesto.value = puestoActual;
    editTipoPlaza.value = tipoActual || 'CONFIANZA';
    return;
  }

  const lista = catalogoPersonal[area] || [];
  const optDefault = document.createElement('option');
  optDefault.value = '';
  optDefault.textContent = `-- Selecciona personal de ${area} --`;
  editPersona.appendChild(optDefault);

  let indiceEncontrado = -1;
  lista.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `${p.nombre} — [${p.puesto}] (${p.tipo})`;
    editPersona.appendChild(opt);

    if (
      indiceEncontrado === -1 &&
      p.nombre.toLowerCase() === (nombreActual || '').toLowerCase() &&
      (!puestoActual || p.puesto.toLowerCase() === puestoActual.toLowerCase())
    ) {
      indiceEncontrado = idx;
    }
  });

  if (indiceEncontrado === -1 && nombreActual) {
    indiceEncontrado = lista.findIndex(
      (p) => p.nombre.toLowerCase() === nombreActual.toLowerCase()
    );
  }

  const optOtro = document.createElement('option');
  optOtro.value = 'OTRA';
  optOtro.textContent = '+ Otro / Especificar manualmente...';
  editPersona.appendChild(optOtro);

  if (indiceEncontrado !== -1) {
    editPersona.value = String(indiceEncontrado);
    editGrupoOtraPersona.classList.add('oculto');
    editOtraPersonaTexto.value = '';
    editPuesto.value = puestoActual || lista[indiceEncontrado].puesto;
    editTipoPlaza.value = tipoActual || lista[indiceEncontrado].tipo;
  } else if (nombreActual) {
    editPersona.value = 'OTRA';
    editGrupoOtraPersona.classList.remove('oculto');
    editOtraPersonaTexto.value = nombreActual;
    editPuesto.value = puestoActual || '';
    editTipoPlaza.value = tipoActual || 'CONFIANZA';
  } else {
    editPersona.value = '';
    editGrupoOtraPersona.classList.add('oculto');
    editOtraPersonaTexto.value = '';
    editPuesto.value = '';
    editTipoPlaza.value = 'CONFIANZA';
  }
}

editArea.addEventListener('change', () => {
  const area = editArea.value;
  if (area === 'OTRA') {
    editGrupoOtraArea.classList.remove('oculto');
    editOtraAreaTexto.focus();
  } else {
    editGrupoOtraArea.classList.add('oculto');
    editOtraAreaTexto.value = '';
  }
  poblarPersonalEnModalEdicion(area, '', '', 'CONFIANZA');
});

editPersona.addEventListener('change', () => {
  const val = editPersona.value;
  if (val === 'OTRA') {
    editGrupoOtraPersona.classList.remove('oculto');
    editOtraPersonaTexto.focus();
    return;
  }

  editGrupoOtraPersona.classList.add('oculto');
  editOtraPersonaTexto.value = '';

  const area = editArea.value;
  const lista = catalogoPersonal[area] || [];
  const p = lista[Number(val)];
  if (p) {
    editPuesto.value = p.puesto || '';
    editTipoPlaza.value = p.tipo || 'CONFIANZA';
  }
});

window.abrirModalEditar = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  sincronizarAreasEnSelects();

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

  const existeAreaEnLista = Array.from(editArea.options).some(
    (opt) => opt.value === tarea.Area_Solicitante && opt.value !== 'OTRA'
  );

  if (existeAreaEnLista) {
    editArea.value = tarea.Area_Solicitante;
    editGrupoOtraArea.classList.add('oculto');
    editOtraAreaTexto.value = '';
    poblarPersonalEnModalEdicion(
      tarea.Area_Solicitante,
      tarea.Solicitante || '',
      tarea.Puesto_Solicitante || '',
      tarea.Tipo_Plaza || 'CONFIANZA'
    );
  } else {
    editArea.value = 'OTRA';
    editGrupoOtraArea.classList.remove('oculto');
    editOtraAreaTexto.value = tarea.Area_Solicitante || '';
    poblarPersonalEnModalEdicion(
      'OTRA',
      tarea.Solicitante || '',
      tarea.Puesto_Solicitante || '',
      tarea.Tipo_Plaza || 'CONFIANZA'
    );
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
    editArea.value === 'OTRA'
      ? editOtraAreaTexto.value.trim().toUpperCase()
      : editArea.value;

  let personaFinal = '';
  if (editPersona.value === 'OTRA') {
    personaFinal = editOtraPersonaTexto.value.trim();
  } else if (editPersona.value !== '') {
    const lista = catalogoPersonal[areaFinal] || [];
    const p = lista[Number(editPersona.value)];
    personaFinal = p ? p.nombre : '';
  }

  const puestoFinal = editPuesto.value.trim() || 'NO ESPECIFICADO';
  const tipoPlazaFinal = editTipoPlaza.value || 'CONFIANZA';
  const equipoFinal = editEquipo.value.trim();
  const descripcionFinal = editDescripcion.value.trim();
  const tipoRadio = document.querySelector('input[name="editTipoServicio"]:checked');

  if (!editFecha.value || !areaFinal || !personaFinal || !equipoFinal || !descripcionFinal || !tipoRadio) {
    mostrarNotificacion('Completa todos los campos antes de guardar cambios.', 'error');
    return;
  }

  const indice = tareas.findIndex((t) => Number(t.ID_Tarea) === idTareaModificando);
  if (indice !== -1) {
    tareas[indice] = {
      ...tareas[indice],
      Fecha_Solicitud: formatearFechaDDMMAAAA(editFecha.value),
      Area_Solicitante: areaFinal,
      Solicitante: personaFinal,
      Puesto_Solicitante: puestoFinal,
      Tipo_Plaza: tipoPlazaFinal,
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

// --- C. Modal de Eliminación ---
window.abrirModalEliminar = function (idTarea) {
  const tarea = tareas.find((t) => Number(t.ID_Tarea) === Number(idTarea));
  if (!tarea) return;

  idTareaEliminando = Number(tarea.ID_Tarea);
  document.getElementById('del-id-tarea').textContent = `#${tarea.ID_Tarea}`;
  document.getElementById('del-area').textContent = tarea.Area_Solicitante;
  document.getElementById('del-solicitante').textContent = tarea.Solicitante || 'No especificado';
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
// 8. MODAL 4: DIRECTORIO / CATÁLOGO DE PERSONAL (EDITAR, RELEVO, AGREGAR)
// =========================================================================

function poblarSelectAreasCatalogo(areaPreseleccionada = null) {
  const areas = Object.keys(catalogoPersonal);
  catSelectArea.innerHTML = areas
    .map((area) => `<option value="${escaparHTML(area)}">${escaparHTML(area)}</option>`)
    .join('');

  if (areaPreseleccionada && catalogoPersonal[areaPreseleccionada]) {
    catSelectArea.value = areaPreseleccionada;
  }
}

function renderizarTablaCatalogo() {
  const area = catSelectArea.value;
  const lista = catalogoPersonal[area] || [];

  if (lista.length === 0) {
    catListaPersonal.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding: 20px; color: #64748b;">
          No hay personal registrado en esta área. Haz clic en "+ Agregar Persona a esta Área".
        </td>
      </tr>`;
    return;
  }

  catListaPersonal.innerHTML = lista
    .map((p, idx) => {
      const sinNom = esSinNombre(p.nombre);
      return `
        <tr class="${sinNom ? 'row-sin-nombre' : ''}">
          <td>
            ${
              sinNom
                ? `<span class="badge-sin-nombre">${escaparHTML(p.nombre)}</span>`
                : `<strong>${escaparHTML(p.nombre)}</strong>`
            }
          </td>
          <td>${escaparHTML(p.puesto)}</td>
          <td>
            <span class="badge-plaza ${obtenerClasePlaza(p.tipo)}">${escaparHTML(p.tipo)}</span>
          </td>
          <td>
            <div class="action-btns">
              <button type="button" class="btn-sm btn-edit" onclick="editarPersonaEnCatalogo(${idx})">
                Editar
              </button>
              <button type="button" class="btn-sm btn-danger" onclick="eliminarPersonaDeCatalogo(${idx})">
                Quitar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function abrirFormCatalogo(indice = -1) {
  const area = catSelectArea.value;
  const lista = catalogoPersonal[area] || [];
  inputCatEditIndex.value = String(indice);

  if (indice >= 0 && lista[indice]) {
    tituloFormCat.textContent = `Modificar registro en ${area}`;
    inputCatNombre.value = lista[indice].nombre;
    inputCatPuesto.value = lista[indice].puesto;
    selectCatTipo.value = lista[indice].tipo || 'CONFIANZA';
  } else {
    tituloFormCat.textContent = `Agregar nuevo personal a ${area}`;
    inputCatNombre.value = '';
    inputCatPuesto.value = '';
    selectCatTipo.value = 'CONFIANZA';
  }

  formCatalogoPersona.classList.remove('oculto');
  inputCatNombre.focus();
  inputCatNombre.select();
}

function cerrarFormCatalogo() {
  formCatalogoPersona.classList.add('oculto');
  inputCatEditIndex.value = '-1';
  formCatalogoPersona.reset();
}

function abrirModalCatalogo(areaPreseleccionada = null, indicePersonaEditar = null) {
  poblarSelectAreasCatalogo(areaPreseleccionada || selectArea.value || null);
  renderizarTablaCatalogo();
  cerrarFormCatalogo();

  modalCatalogo.classList.remove('oculto');

  if (indicePersonaEditar !== null && indicePersonaEditar >= 0) {
    abrirFormCatalogo(indicePersonaEditar);
  }
}

function cerrarModalCatalogo() {
  cerrarFormCatalogo();
  modalCatalogo.classList.add('oculto');
}

window.editarPersonaEnCatalogo = function (indice) {
  abrirFormCatalogo(indice);
};

window.eliminarPersonaDeCatalogo = function (indice) {
  const area = catSelectArea.value;
  const lista = catalogoPersonal[area] || [];
  const persona = lista[indice];
  if (!persona) return;

  lista.splice(indice, 1);
  catalogoPersonal[area] = lista;
  guardarCatalogo(catalogoPersonal);
  renderizarTablaCatalogo();

  if (selectArea.value === area) {
    desplegarPersonalPorArea(area);
  }

  mostrarNotificacion(`"${persona.nombre}" eliminado del área ${area}.`, 'info');
};

document.getElementById('btn-abrir-catalogo').addEventListener('click', () => {
  abrirModalCatalogo();
});

document.getElementById('btn-cerrar-catalogo').addEventListener('click', cerrarModalCatalogo);
document.getElementById('btn-cerrar-catalogo-footer').addEventListener('click', cerrarModalCatalogo);
modalCatalogo.addEventListener('click', (e) => {
  if (e.target === modalCatalogo) cerrarModalCatalogo();
});

catSelectArea.addEventListener('change', () => {
  cerrarFormCatalogo();
  renderizarTablaCatalogo();
});

document.getElementById('btn-nuevo-personal-cat').addEventListener('click', () => {
  abrirFormCatalogo(-1);
});

document.getElementById('btn-cancelar-form-cat').addEventListener('click', cerrarFormCatalogo);

formCatalogoPersona.addEventListener('submit', (e) => {
  e.preventDefault();
  const area = catSelectArea.value;
  if (!area) return;

  const nombre = inputCatNombre.value.trim();
  const puesto = inputCatPuesto.value.trim();
  const tipo = selectCatTipo.value || 'CONFIANZA';
  const indice = Number(inputCatEditIndex.value);

  if (!nombre || !puesto) {
    mostrarNotificacion('Escribe tanto el nombre como el puesto.', 'error');
    return;
  }

  if (!catalogoPersonal[area]) {
    catalogoPersonal[area] = [];
  }

  let indiceFinalSeleccionado = indice;

  if (indice >= 0 && catalogoPersonal[area][indice]) {
    catalogoPersonal[area][indice] = { nombre, puesto, tipo };
    mostrarNotificacion(`Datos actualizados en ${area}.`, 'success');
  } else {
    catalogoPersonal[area].push({ nombre, puesto, tipo });
    indiceFinalSeleccionado = catalogoPersonal[area].length - 1;
    mostrarNotificacion(`"${nombre}" agregado a ${area}.`, 'success');
  }

  guardarCatalogo(catalogoPersonal);
  cerrarFormCatalogo();
  renderizarTablaCatalogo();

  // Si el usuario estaba trabajando sobre esa misma área en el formulario principal, se refresca al instante
  if (selectArea.value === area) {
    desplegarPersonalPorArea(area, indiceFinalSeleccionado);
  }
});

document.getElementById('btn-restaurar-catalogo').addEventListener('click', () => {
  catalogoPersonal = clonarObjeto(CATALOGO_PERSONAL_BASE);
  guardarCatalogo(catalogoPersonal);
  sincronizarAreasEnSelects();
  poblarSelectAreasCatalogo(catSelectArea.value);
  renderizarTablaCatalogo();
  cerrarFormCatalogo();

  if (selectArea.value) {
    desplegarPersonalPorArea(selectArea.value);
  }

  mostrarNotificacion('Directorio restaurado a la lista original del Excel.', 'info');
});

// =========================================================================
// 9. GENERADOR DE EXCEL .XLSX CON FORMATO INSTITUCIONAL
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
        '', '', '', '', '', '', '', '', ''
      ],
      [
        { v: 'DEPARTAMENTO DE SISTEMAS — REPORTE DE CONTROL Y SEGUIMIENTO DE TAREAS TÉCNICAS', s: estiloSubtitulo },
        '', '', '', '', '', '', '', '', ''
      ],
      [
        {
          v: `Fecha de emisión: ${fechaEmision}   |   Total: ${total}   |   Pendientes: ${pendientes}   |   En proceso: ${enProceso}   |   Terminadas: ${terminados}`,
          s: estiloMeta
        },
        '', '', '', '', '', '', '', '', ''
      ],
      ['', '', '', '', '', '', '', '', '', ''],
      [
        { v: 'ID_Tarea', s: estiloHeaderTabla },
        { v: 'Fecha_Solicitud', s: estiloHeaderTabla },
        { v: 'Area_Solicitante', s: estiloHeaderTabla },
        { v: 'Solicitante', s: estiloHeaderTabla },
        { v: 'Puesto_Solicitante', s: estiloHeaderTabla },
        { v: 'Tipo_Plaza', s: estiloHeaderTabla },
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

      const estiloCentrado = {
        ...estiloBase,
        alignment: { horizontal: 'center', vertical: 'center' }
      };

      const estiloID = {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '003B75' } },
        fill: { patternType: 'solid', fgColor: { rgb: bgFila } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bordeDelgado
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
        { v: t.Fecha_Solicitud, t: 's', s: estiloCentrado },
        { v: t.Area_Solicitante, t: 's', s: estiloBase },
        { v: t.Solicitante || 'No especificado', t: 's', s: estiloBase },
        { v: t.Puesto_Solicitante || 'No especificado', t: 's', s: estiloBase },
        { v: t.Tipo_Plaza || 'CONFIANZA', t: 's', s: estiloCentrado },
        { v: t.Equipo_Afectado, t: 's', s: estiloBase },
        { v: t.Tipo_Servicio, t: 's', s: estiloTipo },
        { v: t.Descripcion_Falla, t: 's', s: estiloBase },
        { v: t.Estado_Seguimiento, t: 's', s: estiloEstado }
      ]);

      const lineasEstimadas = Math.max(
        1,
        Math.ceil((t.Descripcion_Falla || '').length / 46)
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
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie },
      { v: '', s: estiloPie }
    ]);
    alturasFilas.push({ hpt: 22 });

    const hojaHistorial = XLSX.utils.aoa_to_sheet(filas);

    const filaFinalIdx = filas.length - 1;
    hojaHistorial['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: filaFinalIdx, c: 0 }, e: { r: filaFinalIdx, c: 9 } }
    ];

    hojaHistorial['!cols'] = [
      { wch: 11 },
      { wch: 15 },
      { wch: 26 },
      { wch: 24 },
      { wch: 26 },
      { wch: 15 },
      { wch: 24 },
      { wch: 14 },
      { wch: 48 },
      { wch: 18 }
    ];
    hojaHistorial['!rows'] = alturasFilas;
    hojaHistorial['!autofilter'] = { ref: `A5:J${5 + total}` };

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
// 10. CONFIGURACIÓN Y ENLACE RÁPIDO PARA OTROS DISPOSITIVOS (GITHUB SYNC)
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
    if (!modalCatalogo.classList.contains('oculto')) cerrarModalCatalogo();
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
      await subirArchivoAGitHub(ARCHIVO_CATALOGO_REMOTO, catalogoPersonal, true);
      mostrarNotificacion('Sincronizado con GitHub correctamente.', 'success');
    } else {
      await sincronizarDesdeGitHub(false);
    }
  } else {
    await sincronizarDesdeGitHub(false);
  }
});

// =========================================================================
// 11. ARRANQUE INICIAL Y ACTUALIZACIÓN EN SEGUNDO PLANO
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  capturarTokenDesdeURL();
  catalogoPersonal = cargarCatalogoLocal();
  sincronizarAreasEnSelects();
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
