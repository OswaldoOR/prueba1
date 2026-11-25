/**
 * Sistema de Control y Seguimiento de Tareas Técnicas
 * H. Ayuntamiento de Río Blanco - Departamento de Sistemas
 * Catálogo Dinámico en Cascada (Área -> Persona -> Puesto y Tipo) + Edición de Directorio
 */

const STORAGE_KEY = 'rioblanco_sistemas_tareas_v1';
const STORAGE_DIR_KEY = 'rioblanco_sistemas_directorio_v1';

// Configuración de Sincronización con GitHub
const GITHUB_CONFIG = {
  usuario: 'Osby09',
  repo: 'Registro',
  archivo: 'tareas.json',
  archivoDirectorio: 'directorio.json',
  rama: 'main',
  tokenCodificado: 'Z2hwX1hLdlR4ck1JemwzcXFXM1ZMVHNYbnhaMnE4b04wUzF3ekZ1RQ=='
};

// =========================================================================
// 1. CATÁLOGO BASE COMPLETO (EXTRAÍDO DE NOMBRES.xlsx)
// =========================================================================
const CATALOGO_BASE = {
  "PRESIDENCIA": [
    { nombre: "JOSE ANTONIO MAY", puesto: "PRESIDENCIA", tipo: "CONFIANZA" },
    { nombre: "AMANDO", puesto: "SECRETARIO DE PRESIDENCIA", tipo: "CONFIANZA" },
    { nombre: "LIZ", puesto: "ASISTENTE PRESIDENCIA", tipo: "CONFIANZA" },
    { nombre: "KATY", puesto: "MONITORISTA 1", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "MONITORISTA 2", tipo: "CONFIANZA" },
    { nombre: "LUCERO", puesto: "RECEPCION", tipo: "CONFIANZA" }
  ],
  "REGIDURIAS": [
    { nombre: "REG 1 ARLETH JIMNEZ", puesto: "REGIDORA 1", tipo: "CONFIANZA" },
    { nombre: "CRISTINA", puesto: "AUX REG / SECRETARIA (REG 1)", tipo: "SINDICATO" },
    { nombre: "REG 2 JORGE HDZ", puesto: "REGIDOR 2", tipo: "CONFIANZA" },
    { nombre: "PATY", puesto: "AUX REG / SECRETARIA (REG 2)", tipo: "SINDICATO" },
    { nombre: "REG 3 ALEYDA RODRIGUEZ", puesto: "REGIDORA 3", tipo: "CONFIANZA" },
    { nombre: "CLAUDIA CAMPOS", puesto: "AUX REG / SECRETARIA (REG 3)", tipo: "SINDICATO" },
    { nombre: "REG 4 AIKO MARTINEZ", puesto: "REGIDORA 4", tipo: "CONFIANZA" },
    { nombre: "GUADALUPE ALVARADO", puesto: "AUX REG / SECRETARIA (REG 4)", tipo: "SINDICATO" },
    { nombre: "REG 5 CESAR ALCARAZ", puesto: "REGIDOR 5", tipo: "CONFIANZA" },
    { nombre: "PILAR", puesto: "AUX REG / SECRETARIA (REG 5)", tipo: "SINDICATO" },
    { nombre: "REG 6 FRED OLIVARES", puesto: "REGIDOR 6", tipo: "CONFIANZA" },
    { nombre: "ELIZETH", puesto: "AUX REG / SECRETARIA (REG 6)", tipo: "SINDICATO" }
  ],
  "SINDICATURA": [
    { nombre: "AIDE CRUZ", puesto: "SINDICO", tipo: "CONFIANZA" },
    { nombre: "DIANA AUX2", puesto: "SINDICO", tipo: "CONFIANZA" },
    { nombre: "INGRID AUX1", puesto: "SINDICO", tipo: "CONFIANZA" }
  ],
  "SECRETARIO": [
    { nombre: "URIEL", puesto: "SECRETARIO", tipo: "CONFIANZA" },
    { nombre: "RODOLFO", puesto: "SECRE DEL SECRE DEL AYUN", tipo: "SINDICATO" },
    { nombre: "AUX1", puesto: "AUX SECRETARIO", tipo: "PRACTICANTE" }
  ],
  "TESORERIA": [
    { nombre: "MARCO SANCHEZ", puesto: "TESORERO", tipo: "CONFIANZA" },
    { nombre: "JENY", puesto: "AUX TESORERIA", tipo: "CONFIANZA" },
    { nombre: "ISA", puesto: "SECRE TESO", tipo: "SINDICATO" }
  ],
  "CONTADURIA": [
    { nombre: "ANGEL DE JESUS", puesto: "CONTRALOR", tipo: "CONFIANZA" },
    { nombre: "DANIELA", puesto: "AUX", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX CONTADURIA", tipo: "PRACTICANTE" }
  ],
  "CONTABILIDAD": [
    { nombre: "SERBANDO", puesto: "TITULAR CONTABILIDAD", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "AUX CONTABILIDAD", tipo: "CONFIANZA" },
    { nombre: "DANIELA", puesto: "AUX CONTABILIDAD", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX CONTABILIDAD", tipo: "PRACTICANTE" }
  ],
  "INGRESOS": [
    { nombre: "GOYITA BRENIS", puesto: "TITULAR INGRESOS", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "ASISTENTE INGRESOS", tipo: "PRACTICANTE" },
    { nombre: "SIN NOMBRE", puesto: "CAJA 1", tipo: "CONFIANZA" },
    { nombre: "ALEYRA", puesto: "CAJA 2", tipo: "SINDICATO" },
    { nombre: "USUARIO 3", puesto: "CAJA 3", tipo: "SINDICATO" },
    { nombre: "USUARIO 4", puesto: "CAJA 4", tipo: "SINDICATO" },
    { nombre: "USUARIO 5", puesto: "CAJA 5", tipo: "SINDICATO" },
    { nombre: "AUX2", puesto: "AUX INGRESOS", tipo: "PRACTICANTE" },
    { nombre: "AUX3", puesto: "AUX INGRESOS", tipo: "PRACTICANTE" }
  ],
  "EGRESOS": [
    { nombre: "JUDITH SOLANO", puesto: "TITULAR EGRESOS", tipo: "CONFIANZA" }
  ],
  "CATASTRO": [
    { nombre: "ANGEL RGUEZ", puesto: "TITULAR CATASTRO", tipo: "CONFIANZA" },
    { nombre: "USUARIO 1G", puesto: "AUX CATASTRO", tipo: "CONFIANZA" },
    { nombre: "USUARIO 2A", puesto: "AUX CATASTRO", tipo: "CONFIANZA" },
    { nombre: "USUARIO 3P", puesto: "AUX CATASTRO", tipo: "CONFIANZA" },
    { nombre: "NADIA", puesto: "ASISTENTE SINDICATO", tipo: "SINDICATO" }
  ],
  "PROVEEDURIA": [
    { nombre: "KARINA", puesto: "TITULAR PROVEEDURIA", tipo: "CONFIANZA" },
    { nombre: "ANGELICA", puesto: "AUX PROVEEDURIA", tipo: "CONFIANZA" },
    { nombre: "PABLO", puesto: "AUX PROVEEDURIA", tipo: "CONFIANZA" },
    { nombre: "LUIS", puesto: "AUX PROVEEDURIA", tipo: "CONFIANZA" }
  ],
  "COMUNICACIÓN": [
    { nombre: "CRISTIAN LOPEZ", puesto: "DIRECTOR COMUNI. DIG.", tipo: "CONFIANZA" },
    { nombre: "GUILLERMO CARREON", puesto: "COMUN. SOCIAL", tipo: "CONFIANZA" },
    { nombre: "GERSON", puesto: "AUX COMUN. SOCIAL", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX COMUN. SOCIAL", tipo: "PRACTICANTE" },
    { nombre: "AUX2", puesto: "AUX COMUN. SOCIAL", tipo: "PRACTICANTE" }
  ],
  "JURIDICO": [
    { nombre: "ELOY BAROJAS", puesto: "TITULAR JURIDICO", tipo: "CONFIANZA" },
    { nombre: "USUARIO", puesto: "AUX JURIDICO", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX JURIDICO", tipo: "PRACTICANTE" }
  ],
  "INMUJER": [
    { nombre: "TERESITA DE JESUS", puesto: "DIRECTORA", tipo: "CONFIANZA" },
    { nombre: "ADAMARY", puesto: "AUX INMUJER", tipo: "CONFIANZA" },
    { nombre: "AUX2", puesto: "AUX INMUJER", tipo: "CONFIANZA" },
    { nombre: "LIZ", puesto: "PSICOLOGA", tipo: "CONFIANZA" },
    { nombre: "JOSE ANGEL", puesto: "ABOGADO INMUJER", tipo: "CONFIANZA" },
    { nombre: "JUAN MANUEL REYES", puesto: "TITULAR SIPINNA", tipo: "CONFIANZA" }
  ],
  "TRANSPARENCIA": [
    { nombre: "JAVIER SHETINNO", puesto: "TITULAR TRANSPARENCIA", tipo: "CONFIANZA" }
  ],
  "SISTEMAS": [
    { nombre: "RODOLFO ZAMORA", puesto: "TITULAR SISTEMAS", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX", tipo: "PRACTICANTE" }
  ],
  "OBRAS PUBLICAS": [
    { nombre: "CARLOS GARCIA", puesto: "DIREC. OBRAS PUB.", tipo: "CONFIANZA" },
    { nombre: "RIGOBERTO ALELUYA", puesto: "AUX OBRAS PUBLICAS", tipo: "CONFIANZA" },
    { nombre: "USUARIO 1", puesto: "INSPECTOR DE OBRA", tipo: "CONFIANZA" },
    { nombre: "USUARIO 2", puesto: "INSPECTOR DE OBRA", tipo: "CONFIANZA" },
    { nombre: "ROBERTO CID", puesto: "RAMOS 033", tipo: "CONFIANZA" },
    { nombre: "WALDO TORNELL", puesto: "TITULAR DESARROLLO URBANO", tipo: "CONFIANZA" },
    { nombre: "KARLA", puesto: "AUX DESA. URB.", tipo: "CONFIANZA" },
    { nombre: "AUX 1", puesto: "AUX DESA. URB.", tipo: "PRACTICANTE" },
    { nombre: "VICTOR BERNAL", puesto: "ASISTENTE DES. URB.", tipo: "SINDICATO" },
    { nombre: "GIOVANNI", puesto: "AUX OBRAS PUBLICAS", tipo: "SINDICATO" },
    { nombre: "VERONICA", puesto: "AUX OBRAS PUBLICAS", tipo: "SINDICATO" },
    { nombre: "AUX 2", puesto: "AUX OBRAS PUBLICAS", tipo: "PRACTICANTE" },
    { nombre: "ESVEIDY", puesto: "RECEPCION OBRAS PUB.", tipo: "SINDICATO" },
    { nombre: "DELFINO", puesto: "RECEPCION OBRAS PUB.", tipo: "SINDICATO" }
  ],
  "DESARROLLO ECONOMICO Y COMERCIO": [
    { nombre: "JESUS BLASS", puesto: "DIREC. COMERCIO", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "AUX COMERCIO", tipo: "CONFIANZA" },
    { nombre: "ULISES", puesto: "ASISTENTE DE COMERCIO", tipo: "SINDICATO" },
    { nombre: "SIN NOMBRE", puesto: "ENCARGADA MERCADO", tipo: "CONFIANZA" }
  ],
  "RRHH": [
    { nombre: "ERIKA", puesto: "TITULAR RRHH", tipo: "CONFIANZA" },
    { nombre: "ANELY", puesto: "AUX RRHH", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX RRHH", tipo: "PRACTICANTE" }
  ],
  "TRANSPORTE": [
    { nombre: "SARA", puesto: "TITULAR TRANSPORTE", tipo: "CONFIANZA" },
    { nombre: "JORGE MARIN", puesto: "ENCARGADO PARQ.", tipo: "CONFIANZA" }
  ],
  "DESARROLLO SOCIAL Y HUMANO": [
    { nombre: "ELIZABETH CANTERO", puesto: "DIRECTORA DESARROLLO SOC.", tipo: "CONFIANZA" },
    { nombre: "PAULO", puesto: "COORD. DEPORTE", tipo: "CONFIANZA" },
    { nombre: "OSCAR", puesto: "COORD. SALUD", tipo: "CONFIANZA" },
    { nombre: "ANGEL OSORIO", puesto: "COORD. SALUD ANIMAL", tipo: "CONFIANZA" },
    { nombre: "VICTOR GTZ", puesto: "COORD. TURISMO", tipo: "CONFIANZA" },
    { nombre: "BELEN MERINO", puesto: "COORD. JUVENTUD", tipo: "CONFIANZA" },
    { nombre: "GABRIEL BELLO", puesto: "COORD. EDUCACION", tipo: "CONFIANZA" },
    { nombre: "CLEMENTINA", puesto: "ENCARGADA BIBLIOTECA 1", tipo: "CONFIANZA" },
    { nombre: "IRMA", puesto: "AUX BIBLIOTECA", tipo: "SINDICATO" },
    { nombre: "RODRIGO", puesto: "AUX DEPORTE", tipo: "CONFIANZA" }
  ],
  "SERVICIOS MUNICIPALES": [
    { nombre: "ORESTES RUIZ", puesto: "DIREC. SERV. HUMANOS", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "AUX SERV. MUNICIPALES", tipo: "CONFIANZA" }
  ],
  "SERVICIOS AMBIENTALES": [
    { nombre: "QUERORIMI", puesto: "DIREC. SERV. AMBIENTALES", tipo: "CONFIANZA" },
    { nombre: "MARY", puesto: "AUX SERV. AMBIENTALES", tipo: "CONFIANZA" }
  ],
  "PROTECCION CIVIL": [
    { nombre: "RAFAEL GARCIA", puesto: "DIREC. PC", tipo: "CONFIANZA" },
    { nombre: "USUARIO 1", puesto: "AUX PC", tipo: "CONFIANZA" },
    { nombre: "USUARIO 2", puesto: "AUX PC", tipo: "CONFIANZA" }
  ],
  "PANTEON": [
    { nombre: "PREFECTO", puesto: "ENCARGADO PANTEON", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "ASISTENTE PANTEON", tipo: "SINDICATO" },
    { nombre: "ALVARO", puesto: "CAJA PANTEON", tipo: "SINDICATO" }
  ],
  "GOBERNACION": [
    { nombre: "CRISTIAN MADRID", puesto: "DIREC. GOBERNACION", tipo: "CONFIANZA" },
    { nombre: "JESUS MARIN", puesto: "AUX GOBERNACION", tipo: "CONFIANZA" },
    { nombre: "JASSEL", puesto: "AUX GOBERNACION", tipo: "CONFIANZA" }
  ],
  "PARTICIPACION CIUDADANA": [
    { nombre: "LUZ MARIA", puesto: "DIREC PARTICIPACION", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "AUX PARTICIPACION", tipo: "CONFIANZA" },
    { nombre: "SHIRLEY", puesto: "AUX PARTICIPACION", tipo: "CONFIANZA" }
  ],
  "REGISTRO CIVIL": [
    { nombre: "HEBER TECA", puesto: "OFICIAL RC", tipo: "CONFIANZA" },
    { nombre: "LUCERO", puesto: "AUX RC", tipo: "CONFIANZA" },
    { nombre: "VERONICA", puesto: "ASISTENTE RC", tipo: "SINDICATO" },
    { nombre: "BLANCA", puesto: "ASISTENTE RC", tipo: "SINDICATO" },
    { nombre: "SUPLENTE", puesto: "ASISTENTE RC", tipo: "SINDICATO" },
    { nombre: "JOSE LUIS", puesto: "ASISTENTE RC", tipo: "SINDICATO" },
    { nombre: "FABIOLA", puesto: "CAJA RC", tipo: "SINDICATO" }
  ],
  "PRESIDENCIA DIF": [
    { nombre: "GABY RGUEZ", puesto: "PRESIDENTA DIF", tipo: "CONFIANZA" },
    { nombre: "MILI", puesto: "DIREC. DIF", tipo: "CONFIANZA" },
    { nombre: "CARMEN", puesto: "AUX1 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "MONSE VERA", puesto: "AUX2 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "AUX3 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "ROSI", puesto: "AUX4 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "CONCHITA", puesto: "AUX5 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "LULA", puesto: "AUX6 PRESIDENCIA DIF", tipo: "CONFIANZA" },
    { nombre: "IVONNE", puesto: "ENCARGADA CAIC", tipo: "CONFIANZA" },
    { nombre: "USUARIO 1", puesto: "AUX CAIC", tipo: "CONFIANZA" },
    { nombre: "SANDRA", puesto: "ENCARGADA CASA ABUELO", tipo: "CONFIANZA" }
  ],
  "CONSULTORIOS DIF": [
    { nombre: "JOSEPH MAY", puesto: "DR. DIF", tipo: "CONFIANZA" },
    { nombre: "FANNY", puesto: "ASISTENTE DR. DIF", tipo: "CONFIANZA" },
    { nombre: "MELANY", puesto: "DENTISTA DIF", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "PSICOLOGA DIF", tipo: "CONFIANZA" },
    { nombre: "AUX1", puesto: "AUX PSICOLOGA DIF", tipo: "CONFIANZA" },
    { nombre: "LENNY", puesto: "PROCURADORA DIF", tipo: "CONFIANZA" },
    { nombre: "USUARIO 1", puesto: "ASISTENTE PROCURADORA DIF", tipo: "CONFIANZA" },
    { nombre: "KARO", puesto: "CAJERA DIF", tipo: "CONFIANZA" },
    { nombre: "SIN NOMBRE", puesto: "FISIOTERAPEUTA DIF", tipo: "CONFIANZA" }
  ],
  "SINDICATO": [
    { nombre: "KATIA", puesto: "SECRETARIA GRAL.", tipo: "SINDICATO" }
  ]
};

// Agrupación visual para facilitar la búsqueda en los selectores de Área
const GRUPOS_AREAS = [
  {
    grupo: "Presidencia y Cabildo",
    areas: ["PRESIDENCIA", "REGIDURIAS", "SINDICATURA", "SECRETARIO"]
  },
  {
    grupo: "Tesorería y Finanzas",
    areas: ["TESORERIA", "CONTABILIDAD", "CONTADURIA", "INGRESOS", "EGRESOS", "CATASTRO", "PROVEEDURIA"]
  },
  {
    grupo: "Direcciones y Áreas Operativas",
    areas: [
      "COMUNICACIÓN",
      "DESARROLLO ECONOMICO Y COMERCIO",
      "DESARROLLO SOCIAL Y HUMANO",
      "GOBERNACION",
      "INMUJER",
      "JURIDICO",
      "OBRAS PUBLICAS",
      "PANTEON",
      "PARTICIPACION CIUDADANA",
      "PROTECCION CIVIL",
      "REGISTRO CIVIL",
      "RRHH",
      "SERVICIOS AMBIENTALES",
      "SERVICIOS MUNICIPALES",
      "SINDICATO",
      "SISTEMAS",
      "TRANSPARENCIA",
      "TRANSPORTE"
    ]
  },
  {
    grupo: "Sistema DIF Municipal",
    areas: ["PRESIDENCIA DIF", "CONSULTORIOS DIF"]
  }
];

// =========================================================================
// 2. ESTADO DE LA APLICACIÓN
// =========================================================================
let tareas = [];
let directorio = {};
let shaTareasGitHub = null;
let shaDirectorioGitHub = null;

// =========================================================================
// 3. UTILIDADES Y PERSISTENCIA LOCAL + GITHUB
// =========================================================================
function obtenerToken() {
  try {
    return atob(GITHUB_CONFIG.tokenCodificado);
  } catch (e) {
    return '';
  }
}

function clonarCatalogoBase() {
  return JSON.parse(JSON.stringify(CATALOGO_BASE));
}

function cargarDirectorioLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_DIR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al leer directorio local:', e);
  }
  return clonarCatalogoBase();
}

function guardarDirectorioLocal(dir) {
  localStorage.setItem(STORAGE_DIR_KEY, JSON.stringify(dir));
}

function cargarTareasLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error al leer tareas locales:', e);
    return [];
  }
}

function guardarTareasLocal(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function actualizarBadgeSync(estado, texto) {
  const badge = document.getElementById('sync-status');
  const label = document.getElementById('sync-text');
  if (!badge || !label) return;
  badge.className = `sync-badge ${estado}`;
  label.textContent = texto;
}

function mostrarToast(mensaje, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3400);
}

// Codificación UTF-8 segura para Base64 (soporta acentos y ñ)
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function sincronizarDesdeGitHub() {
  const token = obtenerToken();
  if (!token) {
    actualizarBadgeSync('sync-err', 'Modo Local');
    return;
  }

  actualizarBadgeSync('sync-loading', 'Sincronizando...');
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // 1. Cargar tareas.json
    const urlTareas = `https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.archivo}?ref=${GITHUB_CONFIG.rama}`;
    const resTareas = await fetch(urlTareas, { headers, cache: 'no-store' });
    if (resTareas.ok) {
      const data = await resTareas.json();
      shaTareasGitHub = data.sha;
      const contenido = JSON.parse(base64ToUtf8(data.content));
      if (Array.isArray(contenido)) {
        tareas = contenido;
        guardarTareasLocal(tareas);
      }
    }

    // 2. Cargar directorio.json (si existe en el repositorio)
    const urlDir = `https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.archivoDirectorio}?ref=${GITHUB_CONFIG.rama}`;
    const resDir = await fetch(urlDir, { headers, cache: 'no-store' });
    if (resDir.ok) {
      const dataDir = await resDir.json();
      shaDirectorioGitHub = dataDir.sha;
      const contenidoDir = JSON.parse(base64ToUtf8(dataDir.content));
      if (contenidoDir && typeof contenidoDir === 'object' && Object.keys(contenidoDir).length > 0) {
        directorio = contenidoDir;
        guardarDirectorioLocal(directorio);
      }
    }

    actualizarBadgeSync('sync-ok', 'Sincronizado');
  } catch (err) {
    console.warn('No se pudo conectar con GitHub, usando respaldo local:', err);
    actualizarBadgeSync('sync-err', 'Sin conexión (Local)');
  }
}

async function guardarTareasEnGitHub() {
  guardarTareasLocal(tareas);
  const token = obtenerToken();
  if (!token) return;

  actualizarBadgeSync('sync-loading', 'Guardando en nube...');
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.archivo}`;
  const body = {
    message: `Actualización de tareas (${new Date().toLocaleString('es-MX')})`,
    content: utf8ToBase64(JSON.stringify(tareas, null, 2)),
    branch: GITHUB_CONFIG.rama
  };
  if (shaTareasGitHub) body.sha = shaTareasGitHub;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      shaTareasGitHub = data.content.sha;
      actualizarBadgeSync('sync-ok', 'Sincronizado');
    } else {
      actualizarBadgeSync('sync-err', 'Guardado local');
    }
  } catch (e) {
    actualizarBadgeSync('sync-err', 'Guardado local');
  }
}

async function guardarDirectorioEnGitHub() {
  guardarDirectorioLocal(directorio);
  const token = obtenerToken();
  if (!token) return;

  const url = `https://api.github.com/repos/${GITHUB_CONFIG.usuario}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.archivoDirectorio}`;
  const body = {
    message: `Actualización de directorio de personal (${new Date().toLocaleString('es-MX')})`,
    content: utf8ToBase64(JSON.stringify(directorio, null, 2)),
    branch: GITHUB_CONFIG.rama
  };
  if (shaDirectorioGitHub) body.sha = shaDirectorioGitHub;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      shaDirectorioGitHub = data.content.sha;
    }
  } catch (e) {
    console.warn('Directorio guardado localmente:', e);
  }
}

// =========================================================================
// 4. LÓGICA EN CASCADA: ÁREA -> PERSONA -> PUESTO Y TIPO
// =========================================================================
function claseBadgeTipo(tipo) {
  const t = (tipo || '').toUpperCase();
  if (t.includes('CONFIANZA')) return 'tipo-confianza';
  if (t.includes('SINDICATO')) return 'tipo-sindicato';
  if (t.includes('PRACTICANTE')) return 'tipo-practicante';
  return 'tipo-otro';
}

function poblarSelectAreas(selectEl, incluirPlaceholder = true) {
  const valorPrevio = selectEl.value;
  selectEl.innerHTML = '';

  if (incluirPlaceholder) {
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = '-- Selecciona un área --';
    selectEl.appendChild(optDefault);
  }

  const areasAgregadas = new Set();

  GRUPOS_AREAS.forEach((g) => {
    const optGroup = document.createElement('optgroup');
    optGroup.label = g.grupo;

    g.areas.forEach((areaNombre) => {
      if (directorio[areaNombre]) {
        const opt = document.createElement('option');
        opt.value = areaNombre;
        opt.textContent = areaNombre;
        optGroup.appendChild(opt);
        areasAgregadas.add(areaNombre);
      }
    });

    if (optGroup.children.length > 0) {
      selectEl.appendChild(optGroup);
    }
  });

  // Cualquier área adicional creada dinámicamente
  Object.keys(directorio).forEach((areaNombre) => {
    if (!areasAgregadas.has(areaNombre)) {
      const opt = document.createElement('option');
      opt.value = areaNombre;
      opt.textContent = areaNombre;
      selectEl.appendChild(opt);
    }
  });

  // Opción "OTRA" al final
  if (incluirPlaceholder) {
    const optOtraGroup = document.createElement('optgroup');
    optOtraGroup.label = 'Personalizado';
    const optOtra = document.createElement('option');
    optOtra.value = 'OTRA';
    optOtra.textContent = '+ Otra área / Especificar...';
    optOtraGroup.appendChild(optOtra);
    selectEl.appendChild(optOtraGroup);
  }

  if (valorPrevio) {
    selectEl.value = valorPrevio;
  }
}

function actualizarSelectPersonas({
  areaSeleccionada,
  selectPersonaEl,
  fichaEl,
  fichaNombreEl,
  fichaPuestoEl,
  fichaTipoEl,
  otraPersonaContainerEl,
  wrapGuardarCatalogoEl = null,
  indicePreseleccionado = null
}) {
  selectPersonaEl.innerHTML = '';
  fichaEl.classList.add('hidden');
  otraPersonaContainerEl.classList.add('hidden');

  if (!areaSeleccionada) {
    selectPersonaEl.disabled = true;
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Primero selecciona un área --';
    selectPersonaEl.appendChild(opt);
    return;
  }

  selectPersonaEl.disabled = false;

  // Si eligió "OTRA" área, forzamos especificar persona manualmente
  if (areaSeleccionada === 'OTRA') {
    const optOtra = document.createElement('option');
    optOtra.value = 'OTRA';
    optOtra.textContent = '+ Especificar nombre, puesto y tipo...';
    selectPersonaEl.appendChild(optOtra);
    selectPersonaEl.value = 'OTRA';
    otraPersonaContainerEl.classList.remove('hidden');
    if (wrapGuardarCatalogoEl) wrapGuardarCatalogoEl.classList.add('hidden');
    return;
  }

  if (wrapGuardarCatalogoEl) wrapGuardarCatalogoEl.classList.remove('hidden');

  const optDefault = document.createElement('option');
  optDefault.value = '';
  optDefault.textContent = `-- Selecciona persona de ${areaSeleccionada} --`;
  selectPersonaEl.appendChild(optDefault);

  const listaPersonas = directorio[areaSeleccionada] || [];
  listaPersonas.forEach((persona, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = `${persona.nombre} — ${persona.puesto} (${persona.tipo})`;
    selectPersonaEl.appendChild(opt);
  });

  // Opción para agregar/especificar alguien que no está en la lista
  const optOtra = document.createElement('option');
  optOtra.value = 'OTRA';
  optOtra.textContent = '+ Otra persona / Especificar nombre y puesto...';
  selectPersonaEl.appendChild(optOtra);

  if (indicePreseleccionado !== null && indicePreseleccionado !== undefined) {
    selectPersonaEl.value = String(indicePreseleccionado);
    mostrarDetallePersonaSeleccionada({
      areaSeleccionada,
      valorPersona: String(indicePreseleccionado),
      fichaEl,
      fichaNombreEl,
      fichaPuestoEl,
      fichaTipoEl,
      otraPersonaContainerEl
    });
  }
}

function mostrarDetallePersonaSeleccionada({
  areaSeleccionada,
  valorPersona,
  fichaEl,
  fichaNombreEl,
  fichaPuestoEl,
  fichaTipoEl,
  otraPersonaContainerEl
}) {
  fichaEl.classList.add('hidden');
  otraPersonaContainerEl.classList.add('hidden');

  if (!valorPersona) return;

  if (valorPersona === 'OTRA') {
    otraPersonaContainerEl.classList.remove('hidden');
    return;
  }

  const idx = parseInt(valorPersona, 10);
  const lista = directorio[areaSeleccionada] || [];
  const persona = lista[idx];

  if (!persona) return;

  fichaNombreEl.textContent = persona.nombre;
  if (persona.nombre === 'SIN NOMBRE') {
    fichaNombreEl.innerHTML = `<span class="tag-sin-nombre">SIN NOMBRE</span>`;
  }
  fichaPuestoEl.textContent = persona.puesto || 'No especificado';
  fichaTipoEl.textContent = persona.tipo || 'CONFIANZA';
  fichaTipoEl.className = `badge-tipo ${claseBadgeTipo(persona.tipo)}`;
  fichaEl.classList.remove('hidden');
}

// =========================================================================
// 5. GESTIÓN Y EDICIÓN DEL DIRECTORIO (MODIFICAR / REEMPLAZAR / AGREGAR)
// =========================================================================
function abrirModalEditarPersona(area, index) {
  const lista = directorio[area] || [];
  const persona = lista[index];
  if (!persona) return;

  document.getElementById('edit-persona-area').value = area;
  document.getElementById('edit-persona-index').value = index;
  document.getElementById('edit-persona-area-label').textContent = area;
  document.getElementById('edit-persona-nombre').value = persona.nombre === 'SIN NOMBRE' ? '' : persona.nombre;
  document.getElementById('edit-persona-puesto').value = persona.puesto;
  document.getElementById('edit-persona-tipo').value = persona.tipo || 'CONFIANZA';

  document.getElementById('modal-editar-persona').classList.remove('hidden');
  setTimeout(() => document.getElementById('edit-persona-nombre').focus(), 50);
}

async function guardarEdicionPersona(e) {
  e.preventDefault();
  const area = document.getElementById('edit-persona-area').value;
  const idx = parseInt(document.getElementById('edit-persona-index').value, 10);
  const nuevoNombreRaw = document.getElementById('edit-persona-nombre').value.trim().toUpperCase();
  const nuevoNombre = nuevoNombreRaw || 'SIN NOMBRE';
  const nuevoPuesto = document.getElementById('edit-persona-puesto').value.trim().toUpperCase();
  const nuevoTipo = document.getElementById('edit-persona-tipo').value.trim().toUpperCase();

  if (!directorio[area] || !directorio[area][idx]) return;

  directorio[area][idx] = {
    nombre: nuevoNombre,
    puesto: nuevoPuesto,
    tipo: nuevoTipo
  };

  await guardarDirectorioEnGitHub();

  // Si en el formulario principal está seleccionada esta misma área, refrescar manteniendo selección
  const areaForm = document.getElementById('area-solicitante').value;
  if (areaForm === area) {
    actualizarSelectPersonas({
      areaSeleccionada: area,
      selectPersonaEl: document.getElementById('persona-solicitante'),
      fichaEl: document.getElementById('ficha-solicitante'),
      fichaNombreEl: document.getElementById('ficha-nombre'),
      fichaPuestoEl: document.getElementById('ficha-puesto'),
      fichaTipoEl: document.getElementById('ficha-tipo'),
      otraPersonaContainerEl: document.getElementById('persona-otra-container'),
      wrapGuardarCatalogoEl: document.getElementById('wrap-guardar-catalogo'),
      indicePreseleccionado: idx
    });
  }

  // Si el modal de directorio está abierto en esa área, refrescar su tabla
  const dirModal = document.getElementById('modal-directorio');
  if (!dirModal.classList.contains('hidden')) {
    renderizarTablaDirectorio(document.getElementById('dir-select-area').value);
  }

  document.getElementById('modal-editar-persona').classList.add('hidden');
  mostrarToast(`Personal actualizado: ${nuevoNombre} (${nuevoPuesto})`, 'success');
}

function renderizarTablaDirectorio(area) {
  const tbody = document.getElementById('dir-tabla-body');
  const lista = directorio[area] || [];
  tbody.innerHTML = '';

  document.getElementById('dir-nuevo-area-nombre').textContent = area;

  lista.forEach((p, idx) => {
    const tr = document.createElement('tr');
    const nombreHtml = p.nombre === 'SIN NOMBRE'
      ? `<span class="tag-sin-nombre">SIN NOMBRE</span>`
      : `<strong>${escaparHTML(p.nombre)}</strong>`;

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${nombreHtml}</td>
      <td>${escaparHTML(p.puesto)}</td>
      <td><span class="badge-tipo ${claseBadgeTipo(p.tipo)}">${escaparHTML(p.tipo)}</span></td>
      <td>
        <button type="button" class="btn btn-secondary btn-sm btn-dir-edit" data-area="${escaparHTML(area)}" data-idx="${idx}">
          Modificar / Reemplazar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-dir-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      abrirModalEditarPersona(btn.dataset.area, parseInt(btn.dataset.idx, 10));
    });
  });
}

// =========================================================================
// 6. CRUD DE TAREAS (REGISTRAR, RENDERIZAR, EDITAR, ELIMINAR)
// =========================================================================
function escaparHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generarNuevoId() {
  if (tareas.length === 0) return 'SIS-001';
  let maxNum = 0;
  tareas.forEach((t) => {
    const match = String(t.ID_Tarea || '').match(/(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  });
  return `SIS-${String(maxNum + 1).padStart(3, '0')}`;
}

async function registrarNuevaTarea(e) {
  e.preventDefault();

  const areaSel = document.getElementById('area-solicitante').value;
  const areaOtra = document.getElementById('area-otra-input').value.trim().toUpperCase();
  const areaFinal = areaSel === 'OTRA' ? areaOtra : areaSel;

  if (!areaFinal) {
    mostrarToast('Por favor selecciona o especifica el área solicitante.', 'warning');
    return;
  }

  const personaSel = document.getElementById('persona-solicitante').value;
  let solicitanteFinal = '';
  let puestoFinal = '';
  let tipoFinal = '';

  if (personaSel === 'OTRA' || areaSel === 'OTRA') {
    solicitanteFinal = document.getElementById('persona-otra-nombre').value.trim().toUpperCase();
    puestoFinal = document.getElementById('persona-otra-puesto').value.trim().toUpperCase();
    tipoFinal = document.getElementById('persona-otra-tipo').value.trim().toUpperCase();

    if (!solicitanteFinal || !puestoFinal) {
      mostrarToast('Completa el nombre y puesto del solicitante.', 'warning');
      return;
    }

    // Si marcó guardar en el catálogo del área
    const guardarEnCatalogo = document.getElementById('persona-otra-guardar').checked;
    if (areaSel !== 'OTRA' && guardarEnCatalogo && directorio[areaSel]) {
      directorio[areaSel].push({
        nombre: solicitanteFinal,
        puesto: puestoFinal,
        tipo: tipoFinal
      });
      await guardarDirectorioEnGitHub();
    }
  } else {
    const idx = parseInt(personaSel, 10);
    const personaObj = (directorio[areaSel] || [])[idx];
    if (!personaObj) {
      mostrarToast('Selecciona una persona válida de la lista.', 'warning');
      return;
    }
    solicitanteFinal = personaObj.nombre;
    puestoFinal = personaObj.puesto;
    tipoFinal = personaObj.tipo;
  }

  const equipo = document.getElementById('equipo-afectado').value.trim();
  const tipoServicio = document.querySelector('input[name="tipo-servicio"]:checked').value;
  const fecha = document.getElementById('fecha-solicitud').value;
  const estado = document.getElementById('estado-inicial').value;
  const descripcion = document.getElementById('descripcion-falla').value.trim();

  const nuevaTarea = {
    ID_Tarea: generarNuevoId(),
    Fecha_Solicitud: fecha,
    Area_Solicitante: areaFinal,
    Solicitante: solicitanteFinal,
    Puesto_Solicitante: puestoFinal,
    Tipo_Personal: tipoFinal,
    Equipo_Afectado: equipo,
    Tipo_Servicio: tipoServicio,
    Descripcion_Falla: descripcion,
    Estado_Seguimiento: estado
  };

  tareas.unshift(nuevaTarea);
  await guardarTareasEnGitHub();
  renderizarTodo();

  // Limpiar formulario manteniendo la fecha de hoy
  e.target.reset();
  document.getElementById('fecha-solicitud').value = new Date().toISOString().split('T')[0];
  document.getElementById('area-otra-container').classList.add('hidden');
  document.getElementById('ficha-solicitante').classList.add('hidden');
  document.getElementById('persona-otra-container').classList.add('hidden');
  const selPersona = document.getElementById('persona-solicitante');
  selPersona.innerHTML = '<option value="">-- Primero selecciona un área --</option>';
  selPersona.disabled = true;

  mostrarToast(`Tarea ${nuevaTarea.ID_Tarea} registrada correctamente.`, 'success');
}

function actualizarKPIs() {
  document.getElementById('kpi-total').textContent = tareas.length;
  document.getElementById('kpi-pendientes').textContent = tareas.filter(t => t.Estado_Seguimiento === 'Pendiente').length;
  document.getElementById('kpi-proceso').textContent = tareas.filter(t => t.Estado_Seguimiento === 'En Proceso').length;
  document.getElementById('kpi-completadas').textContent = tareas.filter(t => t.Estado_Seguimiento === 'Completado').length;
}

function renderizarTabla() {
  const tbody = document.getElementById('tabla-tareas-body');
  const emptyState = document.getElementById('estado-vacio');
  const textoBusqueda = document.getElementById('busqueda-texto').value.trim().toLowerCase();
  const filtroEstado = document.getElementById('filtro-estado').value;

  const filtradas = tareas.filter((t) => {
    const coincideEstado = filtroEstado === 'TODOS' || t.Estado_Seguimiento === filtroEstado;
    if (!coincideEstado) return false;

    if (!textoBusqueda) return true;
    const bloqueTexto = [
      t.ID_Tarea,
      t.Fecha_Solicitud,
      t.Area_Solicitante,
      t.Solicitante,
      t.Puesto_Solicitante,
      t.Tipo_Personal,
      t.Equipo_Afectado,
      t.Tipo_Servicio,
      t.Descripcion_Falla
    ].join(' ').toLowerCase();

    return bloqueTexto.includes(textoBusqueda);
  });

  tbody.innerHTML = '';

  if (filtradas.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtradas.forEach((t) => {
    const tr = document.createElement('tr');
    const statusClass = `status-${(t.Estado_Seguimiento || 'Pendiente').replace(/\s+/g, '-')}`;
    const puestoTexto = t.Puesto_Solicitante ? escaparHTML(t.Puesto_Solicitante) : 'Sin puesto';
    const tipoTexto = t.Tipo_Personal ? escaparHTML(t.Tipo_Personal) : '';

    const nombreHtml = t.Solicitante === 'SIN NOMBRE'
      ? `<span class="tag-sin-nombre">SIN NOMBRE</span>`
      : `<span class="cell-solicitante-nombre">${escaparHTML(t.Solicitante)}</span>`;

    tr.innerHTML = `
      <td>
        <span class="cell-id">${escaparHTML(t.ID_Tarea)}</span>
        <span class="cell-fecha">${escaparHTML(t.Fecha_Solicitud)}</span>
      </td>
      <td><strong>${escaparHTML(t.Area_Solicitante)}</strong></td>
      <td>
        ${nombreHtml}
        <div class="cell-solicitante-meta">
          <span>${puestoTexto}</span>
          ${tipoTexto ? `<span class="badge-tipo ${claseBadgeTipo(tipoTexto)}">${tipoTexto}</span>` : ''}
        </div>
      </td>
      <td>${escaparHTML(t.Equipo_Afectado)}</td>
      <td>${escaparHTML(t.Tipo_Servicio)}</td>
      <td>${escaparHTML(t.Descripcion_Falla)}</td>
      <td>
        <select class="status-select ${statusClass}" data-id="${escaparHTML(t.ID_Tarea)}" aria-label="Cambiar estado">
          <option value="Pendiente" ${t.Estado_Seguimiento === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Proceso" ${t.Estado_Seguimiento === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
          <option value="Completado" ${t.Estado_Seguimiento === 'Completado' ? 'selected' : ''}>Completado</option>
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button type="button" class="icon-btn edit btn-editar-tarea" data-id="${escaparHTML(t.ID_Tarea)}" title="Editar tarea">
            <i data-lucide="pencil"></i>
          </button>
          <button type="button" class="icon-btn delete btn-eliminar-tarea" data-id="${escaparHTML(t.ID_Tarea)}" title="Eliminar tarea">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Eventos de cambio rápido de estado
  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const tarea = tareas.find(item => item.ID_Tarea === id);
      if (tarea) {
        tarea.Estado_Seguimiento = e.target.value;
        await guardarTareasEnGitHub();
        renderizarTodo();
        mostrarToast(`Estado de ${id} actualizado a "${tarea.Estado_Seguimiento}".`, 'success');
      }
    });
  });

  // Eventos de edición y eliminación
  tbody.querySelectorAll('.btn-editar-tarea').forEach((btn) => {
    btn.addEventListener('click', () => abrirModalEditarTarea(btn.dataset.id));
  });

  tbody.querySelectorAll('.btn-eliminar-tarea').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm(`¿Seguro que deseas eliminar la tarea ${id}?`)) {
        tareas = tareas.filter(item => item.ID_Tarea !== id);
        await guardarTareasEnGitHub();
        renderizarTodo();
        mostrarToast(`Tarea ${id} eliminada.`, 'warning');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

function renderizarTodo() {
  actualizarKPIs();
  renderizarTabla();
}

// =========================================================================
// 7. MODAL DE EDICIÓN DE TAREA (CON CASCADA ÁREA -> PERSONA)
// =========================================================================
function abrirModalEditarTarea(id) {
  const tarea = tareas.find(t => t.ID_Tarea === id);
  if (!tarea) return;

  document.getElementById('edit-id').value = tarea.ID_Tarea;
  document.getElementById('edit-id-badge').textContent = `(${tarea.ID_Tarea})`;

  const editAreaSel = document.getElementById('edit-area');
  const editAreaOtraCont = document.getElementById('edit-area-otra-container');
  const editAreaOtraInp = document.getElementById('edit-area-otra-input');
  const editPersonaSel = document.getElementById('edit-persona');
  const editFicha = document.getElementById('edit-ficha-solicitante');
  const editFichaNombre = document.getElementById('edit-ficha-nombre');
  const editFichaPuesto = document.getElementById('edit-ficha-puesto');
  const editFichaTipo = document.getElementById('edit-ficha-tipo');
  const editPersonaOtraCont = document.getElementById('edit-persona-otra-container');

  poblarSelectAreas(editAreaSel, true);

  if (directorio[tarea.Area_Solicitante]) {
    editAreaSel.value = tarea.Area_Solicitante;
    editAreaOtraCont.classList.add('hidden');

    const lista = directorio[tarea.Area_Solicitante];
    const idxMatch = lista.findIndex(
      p => p.nombre === tarea.Solicitante && (!tarea.Puesto_Solicitante || p.puesto === tarea.Puesto_Solicitante)
    );

    if (idxMatch !== -1) {
      actualizarSelectPersonas({
        areaSeleccionada: tarea.Area_Solicitante,
        selectPersonaEl: editPersonaSel,
        fichaEl: editFicha,
        fichaNombreEl: editFichaNombre,
        fichaPuestoEl: editFichaPuesto,
        fichaTipoEl: editFichaTipo,
        otraPersonaContainerEl: editPersonaOtraCont,
        indicePreseleccionado: idxMatch
      });
    } else {
      actualizarSelectPersonas({
        areaSeleccionada: tarea.Area_Solicitante,
        selectPersonaEl: editPersonaSel,
        fichaEl: editFicha,
        fichaNombreEl: editFichaNombre,
        fichaPuestoEl: editFichaPuesto,
        fichaTipoEl: editFichaTipo,
        otraPersonaContainerEl: editPersonaOtraCont
      });
      editPersonaSel.value = 'OTRA';
      editPersonaOtraCont.classList.remove('hidden');
      document.getElementById('edit-persona-otra-nombre').value = tarea.Solicitante || '';
      document.getElementById('edit-persona-otra-puesto').value = tarea.Puesto_Solicitante || '';
      document.getElementById('edit-persona-otra-tipo').value = tarea.Tipo_Personal || 'CONFIANZA';
    }
  } else {
    editAreaSel.value = 'OTRA';
    editAreaOtraCont.classList.remove('hidden');
    editAreaOtraInp.value = tarea.Area_Solicitante || '';
    actualizarSelectPersonas({
      areaSeleccionada: 'OTRA',
      selectPersonaEl: editPersonaSel,
      fichaEl: editFicha,
      fichaNombreEl: editFichaNombre,
      fichaPuestoEl: editFichaPuesto,
      fichaTipoEl: editFichaTipo,
      otraPersonaContainerEl: editPersonaOtraCont
    });
    document.getElementById('edit-persona-otra-nombre').value = tarea.Solicitante || '';
    document.getElementById('edit-persona-otra-puesto').value = tarea.Puesto_Solicitante || '';
    document.getElementById('edit-persona-otra-tipo').value = tarea.Tipo_Personal || 'CONFIANZA';
  }

  document.getElementById('edit-equipo').value = tarea.Equipo_Afectado || '';
  document.getElementById('edit-tipo-servicio').value = tarea.Tipo_Servicio || 'Hardware';
  document.getElementById('edit-estado').value = tarea.Estado_Seguimiento || 'Pendiente';
  document.getElementById('edit-fecha').value = tarea.Fecha_Solicitud || '';
  document.getElementById('edit-descripcion').value = tarea.Descripcion_Falla || '';

  document.getElementById('modal-editar').classList.remove('hidden');
}

async function guardarEdicionTarea(e) {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const tarea = tareas.find(t => t.ID_Tarea === id);
  if (!tarea) return;

  const areaSel = document.getElementById('edit-area').value;
  const areaOtra = document.getElementById('edit-area-otra-input').value.trim().toUpperCase();
  const areaFinal = areaSel === 'OTRA' ? areaOtra : areaSel;

  const personaSel = document.getElementById('edit-persona').value;
  let solicitanteFinal = '';
  let puestoFinal = '';
  let tipoFinal = '';

  if (personaSel === 'OTRA' || areaSel === 'OTRA') {
    solicitanteFinal = document.getElementById('edit-persona-otra-nombre').value.trim().toUpperCase();
    puestoFinal = document.getElementById('edit-persona-otra-puesto').value.trim().toUpperCase();
    tipoFinal = document.getElementById('edit-persona-otra-tipo').value.trim().toUpperCase();
  } else {
    const idx = parseInt(personaSel, 10);
    const personaObj = (directorio[areaSel] || [])[idx];
    if (personaObj) {
      solicitanteFinal = personaObj.nombre;
      puestoFinal = personaObj.puesto;
      tipoFinal = personaObj.tipo;
    }
  }

  if (!areaFinal || !solicitanteFinal) {
    mostrarToast('Verifica el área y el nombre del solicitante.', 'warning');
    return;
  }

  tarea.Area_Solicitante = areaFinal;
  tarea.Solicitante = solicitanteFinal;
  tarea.Puesto_Solicitante = puestoFinal;
  tarea.Tipo_Personal = tipoFinal;
  tarea.Equipo_Afectado = document.getElementById('edit-equipo').value.trim();
  tarea.Tipo_Servicio = document.getElementById('edit-tipo-servicio').value;
  tarea.Estado_Seguimiento = document.getElementById('edit-estado').value;
  tarea.Fecha_Solicitud = document.getElementById('edit-fecha').value;
  tarea.Descripcion_Falla = document.getElementById('edit-descripcion').value.trim();

  await guardarTareasEnGitHub();
  renderizarTodo();
  document.getElementById('modal-editar').classList.add('hidden');
  mostrarToast(`Tarea ${id} actualizada.`, 'success');
}

// =========================================================================
// 8. EXPORTACIÓN A EXCEL (.XLSX) CON PUESTO Y TIPO INCLUIDOS
// =========================================================================
function exportarExcel() {
  if (tareas.length === 0) {
    mostrarToast('No hay tareas registradas para exportar.', 'warning');
    return;
  }

  const filasExcel = tareas.map((t) => ({
    ID_Tarea: t.ID_Tarea || '',
    Fecha_Solicitud: t.Fecha_Solicitud || '',
    Area_Solicitante: t.Area_Solicitante || '',
    Solicitante: t.Solicitante || '',
    Puesto_Solicitante: t.Puesto_Solicitante || '',
    Tipo_Personal: t.Tipo_Personal || '',
    Equipo_Afectado: t.Equipo_Afectado || '',
    Tipo_Servicio: t.Tipo_Servicio || '',
    Descripcion_Falla: t.Descripcion_Falla || '',
    Estado_Seguimiento: t.Estado_Seguimiento || ''
  }));

  const hoja = XLSX.utils.json_to_sheet(filasExcel);
  hoja['!cols'] = [
    { wch: 12 }, // ID_Tarea
    { wch: 15 }, // Fecha_Solicitud
    { wch: 30 }, // Area_Solicitante
    { wch: 24 }, // Solicitante
    { wch: 28 }, // Puesto_Solicitante
    { wch: 15 }, // Tipo_Personal
    { wch: 26 }, // Equipo_Afectado
    { wch: 14 }, // Tipo_Servicio
    { wch: 45 }, // Descripcion_Falla
    { wch: 18 }  // Estado_Seguimiento
  ];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Bitacora_Sistemas');

  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(libro, `Reporte_Tareas_Sistemas_${fechaHoy}.xlsx`);
  mostrarToast('Archivo Excel descargado correctamente.', 'success');
}

// =========================================================================
// 9. INICIALIZACIÓN Y EVENT LISTENERS
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar datos locales primero para carga instantánea
  directorio = cargarDirectorioLocal();
  tareas = cargarTareasLocal();

  // Fecha actual por defecto
  document.getElementById('fecha-solicitud').value = new Date().toISOString().split('T')[0];

  // Poblar selector de Áreas del formulario principal
  const areaSel = document.getElementById('area-solicitante');
  const areaOtraCont = document.getElementById('area-otra-container');
  const personaSel = document.getElementById('persona-solicitante');
  const fichaEl = document.getElementById('ficha-solicitante');
  const fichaNombreEl = document.getElementById('ficha-nombre');
  const fichaPuestoEl = document.getElementById('ficha-puesto');
  const fichaTipoEl = document.getElementById('ficha-tipo');
  const personaOtraCont = document.getElementById('persona-otra-container');
  const wrapGuardarCat = document.getElementById('wrap-guardar-catalogo');

  poblarSelectAreas(areaSel, true);
  renderizarTodo();
  if (window.lucide) lucide.createIcons();

  // Evento cascada: Cambio de Área en formulario principal
  areaSel.addEventListener('change', () => {
    const val = areaSel.value;
    if (val === 'OTRA') {
      areaOtraCont.classList.remove('hidden');
    } else {
      areaOtraCont.classList.add('hidden');
    }

    actualizarSelectPersonas({
      areaSeleccionada: val,
      selectPersonaEl: personaSel,
      fichaEl,
      fichaNombreEl,
      fichaPuestoEl,
      fichaTipoEl,
      otraPersonaContainerEl: personaOtraCont,
      wrapGuardarCatalogoEl: wrapGuardarCat
    });
  });

  // Evento cascada: Cambio de Persona en formulario principal -> Muestra Puesto y Tipo
  personaSel.addEventListener('change', () => {
    mostrarDetallePersonaSeleccionada({
      areaSeleccionada: areaSel.value,
      valorPersona: personaSel.value,
      fichaEl,
      fichaNombreEl,
      fichaPuestoEl,
      fichaTipoEl,
      otraPersonaContainerEl: personaOtraCont
    });
  });

  // Botón "Modificar / Reemplazar" directamente desde la ficha del solicitante
  document.getElementById('btn-modificar-persona-actual').addEventListener('click', () => {
    const area = areaSel.value;
    const idx = parseInt(personaSel.value, 10);
    if (area && area !== 'OTRA' && !Number.isNaN(idx)) {
      abrirModalEditarPersona(area, idx);
    }
  });

  // Eventos cascada dentro del Modal de Edición de Tarea
  const editAreaSel = document.getElementById('edit-area');
  const editAreaOtraCont = document.getElementById('edit-area-otra-container');
  const editPersonaSel = document.getElementById('edit-persona');

  editAreaSel.addEventListener('change', () => {
    const val = editAreaSel.value;
    if (val === 'OTRA') {
      editAreaOtraCont.classList.remove('hidden');
    } else {
      editAreaOtraCont.classList.add('hidden');
    }
    actualizarSelectPersonas({
      areaSeleccionada: val,
      selectPersonaEl: editPersonaSel,
      fichaEl: document.getElementById('edit-ficha-solicitante'),
      fichaNombreEl: document.getElementById('edit-ficha-nombre'),
      fichaPuestoEl: document.getElementById('edit-ficha-puesto'),
      fichaTipoEl: document.getElementById('edit-ficha-tipo'),
      otraPersonaContainerEl: document.getElementById('edit-persona-otra-container')
    });
  });

  editPersonaSel.addEventListener('change', () => {
    mostrarDetallePersonaSeleccionada({
      areaSeleccionada: editAreaSel.value,
      valorPersona: editPersonaSel.value,
      fichaEl: document.getElementById('edit-ficha-solicitante'),
      fichaNombreEl: document.getElementById('edit-ficha-nombre'),
      fichaPuestoEl: document.getElementById('edit-ficha-puesto'),
      fichaTipoEl: document.getElementById('edit-ficha-tipo'),
      otraPersonaContainerEl: document.getElementById('edit-persona-otra-container')
    });
  });

  // Modal de Gestión Completa del Directorio
  const dirSelectArea = document.getElementById('dir-select-area');
  document.getElementById('btn-abrir-directorio').addEventListener('click', () => {
    poblarSelectAreas(dirSelectArea, false);
    const areaInicial = areaSel.value && areaSel.value !== 'OTRA' ? areaSel.value : 'PRESIDENCIA';
    dirSelectArea.value = areaInicial;
    renderizarTablaDirectorio(areaInicial);
    document.getElementById('dir-form-nuevo').classList.add('hidden');
    document.getElementById('modal-directorio').classList.remove('hidden');
  });

  dirSelectArea.addEventListener('change', () => {
    document.getElementById('dir-form-nuevo').classList.add('hidden');
    renderizarTablaDirectorio(dirSelectArea.value);
  });

  document.getElementById('btn-dir-agregar-nuevo').addEventListener('click', () => {
    document.getElementById('dir-nuevo-nombre').value = '';
    document.getElementById('dir-nuevo-puesto').value = '';
    document.getElementById('dir-nuevo-tipo').value = 'CONFIANZA';
    document.getElementById('dir-form-nuevo').classList.remove('hidden');
  });

  document.getElementById('btn-dir-cancelar-nuevo').addEventListener('click', () => {
    document.getElementById('dir-form-nuevo').classList.add('hidden');
  });

  document.getElementById('btn-dir-guardar-nuevo').addEventListener('click', async () => {
    const area = dirSelectArea.value;
    const nombre = document.getElementById('dir-nuevo-nombre').value.trim().toUpperCase();
    const puesto = document.getElementById('dir-nuevo-puesto').value.trim().toUpperCase();
    const tipo = document.getElementById('dir-nuevo-tipo').value.trim().toUpperCase();

    if (!nombre || !puesto) {
      mostrarToast('Ingresa nombre y puesto para agregar al área.', 'warning');
      return;
    }

    directorio[area].push({ nombre, puesto, tipo });
    await guardarDirectorioEnGitHub();
    renderizarTablaDirectorio(area);
    document.getElementById('dir-form-nuevo').classList.add('hidden');

    if (areaSel.value === area) {
      actualizarSelectPersonas({
        areaSeleccionada: area,
        selectPersonaEl: personaSel,
        fichaEl,
        fichaNombreEl,
        fichaPuestoEl,
        fichaTipoEl,
        otraPersonaContainerEl: personaOtraCont,
        wrapGuardarCatalogoEl: wrapGuardarCat
      });
    }

    mostrarToast(`Se agregó a ${nombre} en ${area}.`, 'success');
  });

  document.getElementById('btn-reset-directorio').addEventListener('click', async () => {
    if (confirm('¿Deseas restaurar el directorio original del archivo NOMBRES.xlsx? Se perderán las modificaciones personalizadas.')) {
      directorio = clonarCatalogoBase();
      await guardarDirectorioEnGitHub();
      poblarSelectAreas(areaSel, true);
      poblarSelectAreas(dirSelectArea, false);
      renderizarTablaDirectorio(dirSelectArea.value);
      mostrarToast('Catálogo restaurado al estado original.', 'info');
    }
  });

  // Formularios y Filtros
  document.getElementById('form-nueva-tarea').addEventListener('submit', registrarNuevaTarea);
  document.getElementById('form-editar-persona').addEventListener('submit', guardarEdicionPersona);
  document.getElementById('form-editar-tarea').addEventListener('submit', guardarEdicionTarea);
  document.getElementById('busqueda-texto').addEventListener('input', renderizarTabla);
  document.getElementById('filtro-estado').addEventListener('change', renderizarTabla);
  document.getElementById('btn-exportar-excel').addEventListener('click', exportarExcel);

  // Cerrar modales
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).classList.add('hidden');
    });
  });

  // Sincronizar con GitHub en segundo plano y refrescar vista
  await sincronizarDesdeGitHub();
  poblarSelectAreas(areaSel, true);
  renderizarTodo();
});
