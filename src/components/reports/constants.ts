// Constants & helper mappings for Reports advanced module
import { Assessment } from '../../lib/mockData';

export const INDICATOR_COLORS: Record<'SA' | 'AP' | 'NP', string> = {
  SA: 'bg-green-500',
  AP: 'bg-yellow-400',
  NP: 'bg-red-500'
};

export const BLOCK_TITLES: Record<string, string> = {
  reconocimiento_fotos: 'Reconocimiento de Fotos',
  seleccion_conocidas: 'Selección de Categorías Conocidas',
  emparejamiento_identicas: 'Emparejamiento de Imágenes Idénticas',
  agrupacion_criterios: 'Agrupación por Criterios',
  secuencias_temporales: 'Secuencias Temporales',
  denominacion_nombramiento: 'Denominación / Nombramiento',
  reconocimiento_global_sustantivos: 'Reconocimiento Global de Palabras — Sustantivos',
  reconocimiento_global_verbos: 'Reconocimiento Global de Palabras — Verbos',
  reconocimiento_global_adjetivos: 'Reconocimiento Global de Palabras — Adjetivos',
  asociacion_tarjeta_15_20: 'Asociación Tarjeta–Cartel (15–20 palabras)',
  seleccion_cartel_1_entre_2: 'Selección de Cartel (1 entre 2)',
  lectura_libros_personales: 'Lectura de Libros Personales y Frases',
  analisis_composicion_silabica: 'Análisis y Composición Silábica',
  reconocimiento_silabas_modelo: 'Reconocimiento de Sílabas con Modelo',
  reconocimiento_silabas_sin_modelo: 'Reconocimiento de Sílabas sin Modelo',
  lectura_silabas_directas: 'Lectura de Palabras — Sílabas Directas',
  lectura_silabas_trabadas: 'Lectura de Palabras — Sílabas Trabadas',
  extension_lectura_oraciones: 'Extensión de Lectura — Oraciones y Párrafos',
  lectura_instrucciones_simples: 'Lectura — Instrucciones Simples',
  lectura_instrucciones_complejas: 'Lectura — Instrucciones Complejas',
  respuesta_preguntas_literales: 'Respuesta a Preguntas Literales',
  respuesta_preguntas_inferenciales: 'Respuesta a Preguntas Inferenciales',
  uso_vocabulario_desconocido: 'Uso de Vocabulario — Identifica Desconocido',
  uso_claves_contextuales: 'Uso de Claves Contextuales',
  correspondencia_uno_a_uno: 'Correspondencia 1 a 1',
  clasificacion_atributos: 'Clasificación por Atributos',
  patrones_continuacion: 'Identificación de Patrones — Continuación',
  patrones_regularidades: 'Identificación de Regularidades',
  creacion_patrones: 'Creación de Patrones Propios',
  distincion_letras_numeros: 'Distinción Letras y Números',
  conteo_resolucion_problemas: 'Conteo para Resolver Problemas',
  procedimiento_contar: 'Procedimiento de Contar',
  cuenta_disposiciones: 'Cuenta en Diferentes Disposiciones',
  comparacion_colecciones: 'Comparación de Colecciones y Números',
  secuencia_numerica: 'Secuencia Numérica',
  adicion_sin_reserva: 'Adición sin Reserva',
  sustraccion_sin_reserva: 'Sustracción sin Reserva',
  suma_multiplos_10: 'Suma de Múltiplos de 10',
  resolucion_problemas_aditivos: 'Resolución de Problemas Aditivos',
  reconocimiento_operacion: 'Reconocimiento de Operación',
  reconocimiento_multiplicacion: 'Reconocimiento de Multiplicación',
  calculo_multiplicaciones: 'Cálculo de Multiplicaciones',
  problemas_tablas_multiplicar: 'Problemas con Tablas de Multiplicar',
  reconocimiento_division: 'Reconocimiento de División',
  resolucion_division: 'Resolución de División',
  reconocimiento_dinero: 'Reconocimiento de Dinero',
  equivalencia_dinero: 'Equivalencia de Dinero',
  problemas_compra: 'Problemas de Compra',
  representacion_numerica: 'Representación Numérica del Dinero',
  comparacion_valores: 'Comparación de Valores'
};

export const QUESTIONS: Record<string, string[]> = {
  reconocimiento_fotos: [ 'Reconoce su propia foto','Reconoce fotos de familiares','Identifica objetos familiares en fotos','Señala persona específica cuando se le pide','Muestra preferencia por caras familiares' ],
  seleccion_conocidas: [ 'Selecciona animales de imágenes mixtas','Identifica elementos de comida','Reconoce prendas de vestir','Distingue entre juguetes y herramientas','Agrupa objetos familiares vs desconocidos' ],
  emparejamiento_identicas: [ 'Empareja fotos idénticas de animales','Asocia fotos idénticas de objetos','Conecta elementos del mismo color','Empareja formas idénticas','Vincula patrones duplicados' ],
  agrupacion_criterios: [ 'Agrupa objetos por color','Clasifica por forma (círculo, cuadrado, triángulo)','Categoriza por tamaño (grande, pequeño)','Agrupa por función (comer, vestir, jugar)','Separa por textura (suave, duro)' ],
  secuencias_temporales: [ 'Ordena imágenes de rutina diaria','Secuencia etapas de crecimiento (semilla a planta)','Organiza escenarios antes/después','Ordena cambios estacionales','Secuencia pasos simples de cocina' ],
  denominacion_nombramiento: [ 'Nombra objetos comunes al mostrarlos','Identifica partes del cuerpo','Etiqueta miembros de la familia','Dice su nombre cuando se le pregunta','Nombra colores y formas básicas' ],
  reconocimiento_global_sustantivos: [ 'Reconoce palabras de objetos del aula','Identifica nombres de animales comunes','Señala sustantivos en tarjetas','Distingue sustantivos de una lista mixta','Relaciona palabra con imagen correcta' ],
  reconocimiento_global_verbos: [ 'Reconoce verbos de acción simples','Identifica verbo correcto entre dos','Relaciona verbo con imagen','Diferencia acción vs objeto','Selecciona verbo que describe la escena' ],
  reconocimiento_global_adjetivos: [ 'Reconoce adjetivos de color','Identifica adjetivos de tamaño','Asocia adjetivo con imagen','Distingue adjetivo de sustantivo','Selecciona adjetivo opuesto correcto' ],
  asociacion_tarjeta_15_20: [ 'Asocia tarjeta nº1 correctamente','Asocia tarjeta nº2 correctamente','Mantiene precisión al aumentar cantidad','Generaliza asociación tras cambio de orden','Mantiene foco sin distraerse' ],
  seleccion_cartel_1_entre_2: [ 'Selecciona el cartel correcto (ensayo 1)','Selecciona el cartel correcto (ensayo 2)','Generaliza en nuevo contexto','Tolera distractor visual','Responde rápido (<3s)' ],
  lectura_libros_personales: [ 'Sigue el texto con el dedo','Recuerda secuencia de páginas','Identifica palabras clave','Relaciona ilustración con texto','Mantiene atención hasta el final' ],
  analisis_composicion_silabica: [ 'Segmenta palabra en sílabas','Cuenta sílabas correctamente','Une sílabas para formar palabra','Reconoce sílaba inicial','Reconoce sílaba final' ],
  reconocimiento_silabas_modelo: [ 'Repite sílaba modelo','Selecciona sílaba entre distractores','Diferencia sílabas similares','Mantiene ritmo en repetición','Generaliza a nueva sílaba' ],
  reconocimiento_silabas_sin_modelo: [ 'Identifica sílaba sin apoyo visual','Reconoce sílaba en palabra oral','Aísla sílaba media','Relaciona sílaba a imagen','Selecciona tarjeta correcta' ],
  lectura_silabas_directas: [ 'Lee sílabas CV correctamente','Lee secuencia de 3 sílabas','Mantiene precisión con nuevas letras','Generaliza sílabas a palabra','Automatiza lectura (fluidez)' ],
  lectura_silabas_trabadas: [ 'Lee sílabas trabadas iniciales','Lee sílabas con r','Lee sílabas con l','Generaliza a palabra completa','Mantiene precisión >80%' ],
  extension_lectura_oraciones: [ 'Lee oración simple','Lee oración con adjetivo','Lee dos oraciones seguidas','Comprende significado general','Responde pregunta literal de la oración' ],
  lectura_instrucciones_simples: [ 'Lee instrucción de un paso','Ejecuta acción tras lectura','Lee instrucción repetida con precisión','Generaliza verbo nuevo','Mantiene atención en consigna' ],
  lectura_instrucciones_complejas: [ 'Lee instrucción de dos pasos','Secuencia correctamente acciones','Identifica orden correcto','No omite pasos','Ejecuta sin apoyo adulto' ],
  respuesta_preguntas_literales: [ 'Responde quién','Responde qué','Responde dónde','Responde cuándo','Encuentra respuesta textual' ],
  respuesta_preguntas_inferenciales: [ 'Deduce causa','Predice desenlace','Infiera emoción personaje','Explica razón de acción','Relaciona evento con experiencia propia' ],
  uso_vocabulario_desconocido: [ 'Identifica palabra desconocida','Pregunta por significado','Intenta deducir por contexto','Recuerda nuevo término','Usa término en oración' ],
  uso_claves_contextuales: [ 'Usa imagen para inferir palabra','Usa frase anterior como pista','Descarta opción imposible','Propone sinónimos','Verifica hipótesis leyendo de nuevo' ],
  correspondencia_uno_a_uno: [ 'Señala cada objeto una vez','No duplica conteo','Mantiene ritmo constante','Corrige error espontáneamente','Cuenta sin perder la secuencia' ],
  clasificacion_atributos: [ 'Clasifica por color','Clasifica por forma','Clasifica por tamaño','Reclasifica usando nuevo criterio','Explica criterio usado (verbal o gestual)' ],
  patrones_continuacion: [ 'Completa patrón AB','Completa patrón AAB','Completa patrón ABC','Detecta error en patrón dado','Crea extensión correcta' ],
  patrones_regularidades: [ 'Identifica número que sigue','Identifica salto en secuencia','Reconoce patrón creciente','Explica regularidad (gesto/verbal)','Generaliza a nueva serie' ],
  creacion_patrones: [ 'Crea patrón AB','Crea patrón AAB','Crea patrón ABC','Mantiene consistencia','Corrige inconsistencia' ],
  distincion_letras_numeros: [ 'Diferencia letra vs número','Clasifica símbolos correctamente','Identifica letra desconocida','Identifica número fuera de orden','No confunde en distractores' ],
  conteo_resolucion_problemas: [ 'Cuenta elementos para resolver','Selecciona operación adecuada','Verifica resultado final','Explica (gestos) su estrategia','Ajusta conteo tras error' ],
  procedimiento_contar: [ 'Inicia conteo en el 1 sin ayuda','Continúa contando tras interrupción','Retrocuenta correctamente','Utiliza agrupaciones (mental)','Evita saltos incorrectos' ],
  cuenta_disposiciones: [ 'Cuenta en fila','Cuenta en matriz','Cuenta en disposición circular','Cuenta elementos dispersos','Mantiene precisión >90%' ],
  comparacion_colecciones: [ 'Identifica mayor','Identifica menor','Indica igual cantidad','Justifica comparación','Usa símbolos > = < correctamente' ],
  secuencia_numerica: [ 'Cuenta ascendente hasta 10','Cuenta ascendente hasta 20','Cuenta descendente desde 10','Identifica número faltante','Relaciona posición ordinal' ],
  adicion_sin_reserva: [ 'Resuelve suma básica','Usa conteo hacia adelante','Automatiza hechos simples','Reconoce familia de sumas','Verifica resultado sin apoyo' ],
  sustraccion_sin_reserva: [ 'Resuelve resta básica','Usa conteo hacia atrás','Reconoce relación suma-resta','Comprueba resultado','Evita intercambio incorrecto' ],
  suma_multiplos_10: [ 'Suma múltiplos de 10 (hasta 50)','Generaliza a 100','Descompone números en decenas','Reconoce patrón en resultados','Aplica en problema contextual' ],
  resolucion_problemas_aditivos: [ 'Identifica dato relevante','Descarta dato irrelevante','Elige operación correcta','Expresa resultado claro','Explica estrategia usada' ],
  reconocimiento_operacion: [ 'Distingue suma vs resta','Identifica operación a partir de palabras clave','Asocia símbolo con acción','No confunde signos','Generaliza a ejemplos nuevos' ],
  reconocimiento_multiplicacion: [ 'Reconoce multiplicación como suma repetida','Identifica arreglos rectangulares','Relaciona 3x2 con 2+2+2','Usa símbolo x correctamente','Explica significado de factores' ],
  calculo_multiplicaciones: [ 'Resuelve tabla del 2','Resuelve tabla del 5','Resuelve tabla del 10','Combina factores mixtos','Verifica resultado mentalmente' ],
  problemas_tablas_multiplicar: [ 'Identifica palabras clave de multiplicación','Modela problema con objetos','Traduce a expresión numérica','Resuelve y verifica','Explica representación' ],
  reconocimiento_division: [ 'Reconoce división como reparto','Relaciona división con resta repetida','Identifica símbolo ÷','Diferencia divisor y dividendo','Asocia multiplicación inversa' ],
  resolucion_division: [ 'Resuelve división simple exacta','Comprueba con multiplicación','Maneja residuo verbalmente','Distribuye equitativamente','Explica procedimiento' ],
  reconocimiento_dinero: [ 'Identifica monedas locales','Identifica billetes locales','Asocia valor a cada moneda','Ordena monedas por valor','Distingue moneda similar' ],
  equivalencia_dinero: [ 'Compone valor con monedas pequeñas','Descompone valor en combinaciones','Reconoce equivalencias comunes','Optimiza (menos piezas)','Verifica suma mental' ],
  problemas_compra: [ 'Suma precio de dos ítems','Calcula cambio simple','Selecciona monedas adecuadas','Interpreta etiqueta de precio','Explica si alcanza el dinero' ],
  representacion_numerica: [ 'Escribe valor de monedas mostradas','Lee precio en etiqueta','Compara precios','Redondea a número entero','Registra total en lista' ],
  comparacion_valores: [ 'Determina mayor valor','Determina menor valor','Ordena lista de valores','Identifica valores iguales','Justifica comparación (verbal)' ],
};

export function prettyBlock(blockId: string) {
  return BLOCK_TITLES[blockId] ?? blockId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getQuestionLabel(blockId: string, idx: number) {
  const arr = QUESTIONS[blockId];
  return arr && arr[idx] ? arr[idx] : `Pregunta ${idx + 1}`;
}

export type GroupedIndicators = Record<string, Array<{ idx:number; key:string; val:'SA'|'AP'|'NP' }>>;

export function groupIndicatorsByBlock(indicators: Assessment['indicators']): GroupedIndicators {
  const grouped: GroupedIndicators = {};
  if (!indicators) return grouped;
  for (const [key,val] of Object.entries(indicators)) {
    const m = key.match(/^(.*)_(\d+)$/);
    if (!m) continue;
    const blockId = m[1];
    const idx = parseInt(m[2],10);
    if (!grouped[blockId]) grouped[blockId] = [];
    grouped[blockId].push({ idx, key, val });
  }
  for (const b of Object.keys(grouped)) grouped[b].sort((a,b)=> a.idx - b.idx);
  return grouped;
}

// Tamaño A4 en px para previsualización (~96dpi)
export const PREVIEW_PAGE_PX = { width: 794, height: 1123 } as const;
