export interface AssessmentBlock {
  id: string;
  title: string;
  indicators: string[];
}

export interface ModuleData {
  id: string;
  name: string;
  stages: {
    [key: number]: AssessmentBlock[];
  };
}

// Lectoescritura Module
export const LECTOESCRITURA_MODULE: ModuleData = {
  id: 'lectoescritura',
  name: 'Lectoescritura',
  stages: {
    1: [
      {
        id: 'reconocimiento_fotos',
        title: 'Reconocimiento de Fotos',
        indicators: [
          'Reconoce su propia foto',
          'Reconoce fotos de familiares',
          'Identifica objetos familiares en fotos',
          'Señala persona específica cuando se le pide',
          'Muestra preferencia por caras familiares'
        ]
      },
      {
        id: 'seleccion_conocidas',
        title: 'Selección de Categorías Conocidas',
        indicators: [
          'Selecciona animales de imágenes mixtas',
          'Identifica elementos de comida',
          'Reconoce prendas de vestir',
          'Distingue entre juguetes y herramientas',
          'Agrupa objetos familiares vs desconocidos'
        ]
      },
      {
        id: 'emparejamiento_identicas',
        title: 'Emparejamiento de Imágenes Idénticas',
        indicators: [
          'Empareja fotos idénticas de animales',
          'Asocia fotos idénticas de objetos',
          'Conecta elementos del mismo color',
          'Empareja formas idénticas',
          'Vincula patrones duplicados'
        ]
      },
      {
        id: 'agrupacion_criterios',
        title: 'Agrupación por Criterios',
        indicators: [
          'Agrupa objetos por color',
          'Clasifica por forma (círculo, cuadrado, triángulo)',
          'Categoriza por tamaño (grande, pequeño)',
          'Agrupa por función (comer, vestir, jugar)',
          'Separa por textura (suave, duro)'
        ]
      },
      {
        id: 'secuencias_temporales',
        title: 'Secuencias Temporales',
        indicators: [
          'Ordena imágenes de rutina diaria',
          'Secuencia etapas de crecimiento (semilla a planta)',
          'Organiza escenarios antes/después',
          'Ordena cambios estacionales',
          'Secuencia pasos simples de cocina'
        ]
      },
      {
        id: 'denominacion_nombramiento',
        title: 'Denominación/Nombramiento',
        indicators: [
          'Nombra objetos comunes al mostrarlos',
          'Identifica partes del cuerpo',
          'Etiqueta miembros de la familia',
          'Dice su nombre cuando se le pregunta',
          'Nombra colores y formas básicas'
        ]
      }
    ],
    2: [
      {
        id: 'reconocimiento_global_sustantivos',
        title: 'Reconocimiento Global de Palabras - Sustantivos',
        indicators: [
          'Reconoce sustantivos comunes (casa, perro, mesa)',
          'Identifica nombres de personas familiares',
          'Reconoce nombres de objetos del aula',
          'Identifica sustantivos de alimentos',
          'Reconoce nombres de animales'
        ]
      },
      {
        id: 'reconocimiento_global_verbos',
        title: 'Reconocimiento Global de Palabras - Verbos',
        indicators: [
          'Reconoce verbos de acción (correr, saltar, comer)',
          'Identifica verbos en presente',
          'Reconoce verbos relacionados con rutinas',
          'Identifica acciones en imágenes',
          'Reconoce verbos de movimiento'
        ]
      },
      {
        id: 'reconocimiento_global_adjetivos',
        title: 'Reconocimiento Global de Palabras - Adjetivos',
        indicators: [
          'Reconoce adjetivos de tamaño (grande, pequeño)',
          'Identifica adjetivos de color',
          'Reconoce adjetivos de forma',
          'Identifica adjetivos de textura',
          'Reconoce adjetivos de estado de ánimo'
        ]
      },
      {
        id: 'asociacion_tarjeta_15_20',
        title: 'Asociación Tarjeta-Cartel (15-20 palabras)',
        indicators: [
          'Asocia imagen con palabra escrita (15 palabras)',
          'Empareja objeto real con su nombre escrito',
          'Relaciona acción con verbo escrito',
          'Asocia característica con adjetivo escrito',
          'Completa asociaciones de 20 palabras básicas'
        ]
      },
      {
        id: 'seleccion_cartel_1_entre_2',
        title: 'Selección de Cartel (1 entre 2)',
        indicators: [
          'Selecciona palabra correcta entre 2 opciones',
          'Elige el nombre correcto del objeto mostrado',
          'Selecciona verbo apropiado para la acción',
          'Elige adjetivo correcto para la característica',
          'Discrimina entre palabras similares'
        ]
      },
      {
        id: 'lectura_libros_personales',
        title: 'Lectura de Libros Personales y Frases',
        indicators: [
          'Lee frases simples sobre sí mismo',
          'Reconoce su nombre en diferentes contextos',
          'Lee frases sobre su familia',
          'Identifica palabras en su libro personal',
          'Lee oraciones cortas sobre sus actividades'
        ]
      }
    ],
    3: [
      {
        id: 'analisis_composicion_silabica',
        title: 'Análisis y Composición Silábica',
        indicators: [
          'Descompone palabras conocidas en sílabas',
          'Compone palabras uniendo sílabas',
          'Identifica número de sílabas en palabras',
          'Separa sílabas oralmente',
          'Forma nuevas palabras combinando sílabas'
        ]
      },
      {
        id: 'reconocimiento_silabas_modelo',
        title: 'Reconocimiento de Sílabas con Modelo',
        indicators: [
          'Reconoce sílabas directas con apoyo visual',
          'Identifica sílabas en palabras con modelo',
          'Empareja sílabas iguales con referencia',
          'Encuentra sílabas específicas con ayuda',
          'Discrimina sílabas similares con modelo'
        ]
      },
      {
        id: 'reconocimiento_silabas_sin_modelo',
        title: 'Reconocimiento de Sílabas sin Modelo',
        indicators: [
          'Reconoce sílabas directas independientemente',
          'Identifica sílabas sin apoyo visual',
          'Discrimina sílabas por sonido únicamente',
          'Reconoce sílabas en diferentes posiciones',
          'Identifica sílabas en palabras nuevas'
        ]
      },
      {
        id: 'lectura_silabas_directas',
        title: 'Lectura de Palabras - Sílabas Directas',
        indicators: [
          'Lee palabras con sílabas directas (ma, pa, sa)',
          'Pronuncia correctamente sílabas CV',
          'Lee palabras bisílabas directas',
          'Lee palabras trisílabas directas',
          'Mantiene fluidez en sílabas directas'
        ]
      },
      {
        id: 'lectura_silabas_trabadas',
        title: 'Lectura de Palabras - Sílabas Trabadas',
        indicators: [
          'Lee sílabas trabadas con L (bla, cla, fla)',
          'Lee sílabas trabadas con R (bra, cra, fra)',
          'Pronuncia correctamente grupos consonánticos',
          'Lee palabras con sílabas trabadas',
          'Mantiene fluidez en sílabas complejas'
        ]
      },
      {
        id: 'extension_lectura_oraciones',
        title: 'Extensión de Lectura - Oraciones y Párrafos',
        indicators: [
          'Lee oraciones completas con comprensión',
          'Lee párrafos cortos manteniendo el sentido',
          'Respeta signos de puntuación básicos',
          'Lee textos simples con fluidez',
          'Comprende el contenido de lo leído'
        ]
      }
    ],
    4: [
      {
        id: 'lectura_instrucciones_simples',
        title: 'Lectura de Párrafos - Instrucciones Simples',
        indicators: [
          'Lee y sigue instrucciones de 1-2 pasos',
          'Comprende órdenes escritas básicas',
          'Ejecuta tareas según instrucciones leídas',
          'Identifica palabras clave en instrucciones',
          'Completa actividades siguiendo texto escrito'
        ]
      },
      {
        id: 'lectura_instrucciones_complejas',
        title: 'Lectura de Párrafos - Instrucciones Complejas',
        indicators: [
          'Lee y sigue instrucciones de múltiples pasos',
          'Comprende secuencias complejas de acciones',
          'Organiza tareas según orden de instrucciones',
          'Identifica detalles importantes en instrucciones',
          'Adapta comportamiento según instrucciones escritas'
        ]
      },
      {
        id: 'respuesta_preguntas_literales',
        title: 'Respuesta a Preguntas Literales',
        indicators: [
          'Responde preguntas sobre información explícita',
          'Localiza datos específicos en el texto',
          'Identifica personajes, lugares y eventos',
          'Extrae información directa del texto',
          'Responde "qué", "quién", "dónde", "cuándo"'
        ]
      },
      {
        id: 'respuesta_preguntas_inferenciales',
        title: 'Respuesta a Preguntas Inferenciales',
        indicators: [
          'Infiere información no explícita en el texto',
          'Deduce causas y efectos',
          'Interpreta intenciones de personajes',
          'Predice eventos basándose en pistas',
          'Comprende relaciones implícitas'
        ]
      },
      {
        id: 'uso_vocabulario_desconocido',
        title: 'Uso de Vocabulario - Identifica Desconocido',
        indicators: [
          'Identifica palabras que no conoce',
          'Señala términos nuevos en el texto',
          'Pregunta por significados desconocidos',
          'Reconoce cuando no comprende una palabra',
          'Busca ayuda para palabras difíciles'
        ]
      },
      {
        id: 'uso_claves_contextuales',
        title: 'Uso de Claves Contextuales',
        indicators: [
          'Deduce significados por contexto',
          'Usa pistas del texto para comprender',
          'Relaciona palabras nuevas con conocidas',
          'Infiere significados por situación',
          'Aplica estrategias de comprensión contextual'
        ]
      }
    ]
  }
};

// Matemática Funcional Module
export const MATEMATICA_MODULE: ModuleData = {
  id: 'matematica',
  name: 'Matemática Funcional',
  stages: {
    1: [
      {
        id: 'correspondencia_uno_a_uno',
        title: 'Correspondencia 1 a 1',
        indicators: [
          'Realiza correspondencia 1 a 1 en ficha graficada',
          'Empareja objetos uno por uno correctamente',
          'Establece relación biunívoca entre elementos',
          'Asocia cada elemento con su par correspondiente',
          'Mantiene correspondencia en diferentes materiales'
        ]
      },
      {
        id: 'clasificacion_atributos',
        title: 'Clasificación por Atributos',
        indicators: [
          'Clasifica objetos considerando un atributo (color)',
          'Agrupa elementos por forma',
          'Separa objetos por tamaño',
          'Clasifica por textura o material',
          'Organiza elementos por función o uso'
        ]
      },
      {
        id: 'patrones_continuacion',
        title: 'Identificación de Patrones - Continuación',
        indicators: [
          'Identifica elemento que continúa un patrón simple',
          'Completa secuencias de 2 elementos (AB-AB)',
          'Continúa patrones de 3 elementos (ABC-ABC)',
          'Identifica el siguiente en patrones de colores',
          'Completa patrones de formas geométricas'
        ]
      },
      {
        id: 'patrones_regularidades',
        title: 'Identificación de Regularidades',
        indicators: [
          'Identifica regularidades en patrones corporales',
          'Reconoce repeticiones en patrones sonoros',
          'Encuentra regularidades en patrones visuales',
          'Identifica la regla del patrón',
          'Predice elementos basándose en regularidades'
        ]
      },
      {
        id: 'creacion_patrones',
        title: 'Creación de Patrones Propios',
        indicators: [
          'Inventa patrones corporales (palmada-pie)',
          'Crea patrones con objetos concretos',
          'Diseña patrones gráficos simples',
          'Inventa secuencias rítmicas',
          'Crea patrones usando diferentes materiales'
        ]
      }
    ],
    2: [
      {
        id: 'distincion_letras_numeros',
        title: 'Distinción Letras y Números',
        indicators: [
          'Distingue entre letras y números',
          'Identifica números en el entorno',
          'Separa símbolos numéricos de alfabéticos',
          'Reconoce números en diferentes contextos',
          'Escribe números del 0 al 9'
        ]
      },
      {
        id: 'conteo_resolucion_problemas',
        title: 'Conteo para Resolver Problemas',
        indicators: [
          'Utiliza conteo para resolver problemas simples',
          'Cuenta para determinar "cuántos hay"',
          'Usa conteo para comparar cantidades',
          'Aplica conteo en situaciones cotidianas',
          'Resuelve problemas mediante enumeración'
        ]
      },
      {
        id: 'procedimiento_contar',
        title: 'Procedimiento de Contar',
        indicators: [
          'Enumera colecciones ordenadamente',
          'Establece correspondencia 1 a 1 al contar',
          'Usa secuencia numérica correcta',
          'Realiza inventario de objetos',
          'Cuenta sin omitir ni repetir elementos'
        ]
      },
      {
        id: 'cuenta_disposiciones',
        title: 'Cuenta en Diferentes Disposiciones',
        indicators: [
          'Cuenta objetos en disposición lineal',
          'Cuenta elementos en disposición circular',
          'Cuenta objetos en disposición aleatoria',
          'Mantiene precisión independiente del arreglo',
          'Adapta estrategia según disposición'
        ]
      },
      {
        id: 'comparacion_colecciones',
        title: 'Comparación de Colecciones y Números',
        indicators: [
          'Compara colecciones usando "más que", "menos que"',
          'Identifica colecciones con igual cantidad',
          'Compara números usando símbolos >, <, =',
          'Ordena colecciones de menor a mayor',
          'Determina cuál grupo tiene más/menos elementos'
        ]
      },
      {
        id: 'secuencia_numerica',
        title: 'Secuencia Numérica',
        indicators: [
          'Produce colección dado un número',
          'Lee secuencia numérica ascendente 1-20',
          'Ordena números del 1 al 20',
          'Completa secuencias numéricas simples',
          'Identifica número anterior y posterior'
        ]
      }
    ],
    3: [
      {
        id: 'adicion_sin_reserva',
        title: 'Adición sin Reserva',
        indicators: [
          'Calcula adición sin reserva usando sobreconteo',
          'Resuelve sumas hasta 10 con material concreto',
          'Usa dedos para resolver adiciones simples',
          'Calcula mentalmente sumas hasta 5',
          'Representa adiciones con dibujos'
        ]
      },
      {
        id: 'sustraccion_sin_reserva',
        title: 'Sustracción sin Reserva',
        indicators: [
          'Calcula sustracción sin reserva usando desconteo',
          'Resuelve restas hasta 10 con material concreto',
          'Usa estrategia de "quitar" para restar',
          'Calcula mentalmente restas hasta 5',
          'Representa sustracciones con dibujos'
        ]
      },
      {
        id: 'suma_multiplos_10',
        title: 'Suma de Múltiplos de 10',
        indicators: [
          'Suma múltiplos de 10 con una cifra (cálculo mental)',
          'Calcula 10+3, 20+5, 30+7 mentalmente',
          'Comprende el valor posicional en decenas',
          'Resuelve sumas tipo 40+6 sin material',
          'Aplica estrategias de cálculo mental'
        ]
      },
      {
        id: 'resolucion_problemas_aditivos',
        title: 'Resolución de Problemas Aditivos',
        indicators: [
          'Resuelve problemas simples de adición',
          'Resuelve problemas simples de sustracción',
          'Identifica datos relevantes en problemas',
          'Interpreta situaciones de "juntar" y "quitar"',
          'Verifica resultados en contexto del problema'
        ]
      },
      {
        id: 'reconocimiento_operacion',
        title: 'Reconocimiento de Operación',
        indicators: [
          'Reconoce qué operación resuelve el problema',
          'Distingue situaciones de suma y resta',
          'Identifica palabras clave en problemas',
          'Selecciona operación apropiada',
          'Justifica elección de operación'
        ]
      }
    ],
    4: [
      {
        id: 'reconocimiento_multiplicacion',
        title: 'Reconocimiento de Multiplicación',
        indicators: [
          'Reconoce operación multiplicación que resuelve problema',
          'Identifica situaciones de "grupos iguales"',
          'Comprende multiplicación como suma repetida',
          'Reconoce patrones multiplicativos',
          'Distingue multiplicación de adición simple'
        ]
      },
      {
        id: 'calculo_multiplicaciones',
        title: 'Cálculo de Multiplicaciones',
        indicators: [
          'Calcula multiplicaciones con suma iterada',
          'Domina tabla del 2 usando suma repetida',
          'Domina tabla del 5 usando suma repetida',
          'Domina tabla del 10 usando suma repetida',
          'Usa estrategias concretas para multiplicar'
        ]
      },
      {
        id: 'problemas_tablas_multiplicar',
        title: 'Problemas con Tablas de Multiplicar',
        indicators: [
          'Resuelve problemas usando tabla del 2',
          'Resuelve problemas usando tabla del 5',
          'Resuelve problemas usando tabla del 10',
          'Aplica tablas en situaciones cotidianas',
          'Verifica resultados multiplicativos'
        ]
      },
      {
        id: 'reconocimiento_division',
        title: 'Reconocimiento de División',
        indicators: [
          'Reconoce operación división en problemas',
          'Identifica situaciones de "repartir"',
          'Comprende división como operación inversa',
          'Reconoce situaciones de agrupamiento',
          'Distingue división de sustracción'
        ]
      },
      {
        id: 'resolucion_division',
        title: 'Resolución de División',
        indicators: [
          'Resuelve reparto equitativo con material',
          'Realiza agrupamiento para dividir',
          'Usa estrategias concretas de división',
          'Verifica división mediante multiplicación',
          'Resuelve divisiones exactas simples'
        ]
      }
    ],
    5: [
      {
        id: 'reconocimiento_dinero',
        title: 'Reconocimiento de Dinero',
        indicators: [
          'Diferencia monedas de billetes',
          'Reconoce monedas de $1, $5, $10, $50, $100',
          'Reconoce billetes de $1000, $2000, $5000',
          'Identifica características de cada denominación',
          'Nombra correctamente monedas y billetes'
        ]
      },
      {
        id: 'equivalencia_dinero',
        title: 'Equivalencia de Dinero',
        indicators: [
          'Establece equivalencia entre monedas',
          'Cambia monedas por billetes equivalentes',
          'Forma cantidades usando diferentes denominaciones',
          'Comprende que 10 monedas de $1 = 1 moneda de $10',
          'Realiza cambios simples de dinero'
        ]
      },
      {
        id: 'problemas_compra',
        title: 'Problemas de Compra',
        indicators: [
          'Resuelve problemas simples de compra (adición)',
          'Calcula vuelto en compras simples (sustracción)',
          'Determina si tiene suficiente dinero',
          'Planifica compras según dinero disponible',
          'Verifica cálculos en situaciones de compra'
        ]
      },
      {
        id: 'representacion_numerica',
        title: 'Representación Numérica del Dinero',
        indicators: [
          'Representa con números cantidad de monedas',
          'Escribe valor total de billetes',
          'Usa símbolo $ correctamente',
          'Representa cantidades mixtas (monedas + billetes)',
          'Lee cantidades de dinero escritas'
        ]
      },
      {
        id: 'comparacion_valores',
        title: 'Comparación de Valores',
        indicators: [
          'Compara valores para saber si puede comprar',
          'Identifica cuál producto cuesta más/menos',
          'Ordena precios de menor a mayor',
          'Determina diferencia entre precios',
          'Toma decisiones basadas en comparación de valores'
        ]
      }
    ]
  }
};

export const getModuleData = (moduleId: string): ModuleData | null => {
  switch (moduleId) {
    case 'lectoescritura':
      return LECTOESCRITURA_MODULE;
    case 'matematica':
      return MATEMATICA_MODULE;
    default:
      return null;
  }
};

export const getStageBlocks = (moduleId: string, stage: number): AssessmentBlock[] => {
  const moduleData = getModuleData(moduleId);
  return moduleData?.stages[stage] || [];
};