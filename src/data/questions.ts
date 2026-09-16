import type { QuestionDefinition } from "../types/game";

const identity: QuestionDefinition["phase"] = "VERIFICACIÓN DE IDENTIDAD";
const personality: QuestionDefinition["phase"] = "ANÁLISIS DE PERSONALIDAD";
const behavioral: QuestionDefinition["phase"] = "EXAMEN CONDUCTUAL";
const medical: QuestionDefinition["phase"] = "EVALUACIÓN MÉDICA";
const simple =
  (text: string, pose: QuestionDefinition["briitPose"] = "talking") =>
  () => ({ text, pose });

export const questions: QuestionDefinition[] = [
  {
    id: "q1_nombre",
    number: 1,
    type: "text",
    phase: identity,
    prompt: "Primero lo primero... ¿cuál es tu nombre?",
    briitPose: "talking",
    progressPercent: 3,
    getReaction: (a) =>
      /brittany/i.test(String(a))
        ? {
            text: "Sí, Brittany. Eso ya lo sabía.\n\nMás específicamente: Brittany Azucena Maldonado Mendoza.\n\nTambién conocida como la doctora Maldonado, la manca entre las mancas y, por razones que la ciencia todavía no comprende, la peruana más peruana de toda Latinoamérica.",
            pose: "talking",
          }
        : {
            text: "Interesante.\n\nDe todas formas, mis registros dicen Brittany.\n\nAsí que voy a ignorar completamente tu respuesta.",
            pose: "surprised",
          },
  },
  {
    id: "q2_zodiaco",
    number: 2,
    type: "zodiac",
    phase: identity,
    prompt: "¿Cuál es tu signo zodiacal?",
    briitPose: "pointing",
    progressPercent: 5,
    options: [
      "Aries",
      "Tauro",
      "Géminis",
      "Cáncer",
      "Leo",
      "Virgo",
      "Libra",
      "Escorpio",
      "Sagitario",
      "Capricornio",
      "Acuario",
      "Piscis",
    ],
    getReaction: (a) =>
      String(a) === "Piscis"
        ? {
            text: "Piscis. Correcto.\n\nBueno... nadie es perfecto.\n\nEso no fui yo.",
            pose: "talking",
          }
        : {
            text: "Curioso.\n\nMis registros dicen Piscis.",
            pose: "surprised",
          },
  },
  {
    id: "q3_color",
    number: 3,
    type: "color-choice",
    phase: identity,
    prompt: "Importante verificación biométrica.",
    helperText: "Escoge tu color favorito.",
    briitPose: "pointing",
    progressPercent: 8,
    options: [
      "Turquesa",
      "Rosa",
      "Amarillo",
      "Café",
      "Verde",
      "Azul",
      "Crema",
      "Otro",
    ],
    getReaction: (a) =>
      String(a) === "Turquesa"
        ? { text: "Turquesa.\n\nCoincide con los registros.", pose: "happy" }
        : {
            text: "Hmm.\n\nO mis registros están desactualizados o ya empezaste a complicarme el trabajo.",
            pose: "thinking",
          },
  },
  {
    id: "q4_dulce_salado",
    number: 4,
    type: "choice",
    phase: identity,
    prompt: "Escoge una.",
    helperText: "Necesito información biométrica extremadamente importante.",
    briitPose: "pointing",
    progressPercent: 10,
    options: ["Dulce", "Salado"],
    getReaction: (a) =>
      String(a) === "Salado"
        ? { text: "Bien.\n\nPodemos continuar.", pose: "happy" }
        : {
            text: "Entendido.\n\nRegistraré esto para futuras investigaciones.",
            pose: "talking",
          },
  },
  {
    id: "q5_cumplidos",
    number: 5,
    type: "slider",
    phase: identity,
    prompt: "¿Qué tan buena eres aceptando cumplidos?",
    briitPose: "talking",
    progressPercent: 13,
    sliderLabels: {
      left: "Me da mucha vergüenza",
      right: "Sé que soy increíble",
    },
    getReaction: simple(
      "Interesante.\n\nPor cierto: eres muy guapa.\n\nSolo quería comprobar si tu respuesta era precisa.",
      "happy",
    ),
  },
  {
    id: "q6_romantica",
    number: 6,
    type: "choice",
    phase: personality,
    prompt:
      "Estás sola y empieza a sonar una canción romántica que te encanta. ¿Qué pasa?",
    briitPose: "talking",
    progressPercent: 15,
    options: [
      "La canto bajito.",
      "Concierto completo.",
      "Solo la escucho.",
      "Depende de la canción.",
      "No es asunto tuyo, Briit.",
    ],
    getReaction: (a) =>
      String(a) === "No es asunto tuyo, Briit."
        ? {
            text: "Justo.\n\nLamentablemente, todo este proceso de verificación es asunto mío.",
            pose: "pointing",
          }
        : {
            text: "Anotado.\n\nLa evidencia musical queda registrada.",
            pose: "talking",
          },
  },
  {
    id: "q7_risa",
    number: 7,
    type: "slider",
    phase: personality,
    prompt: "¿Qué tan fácil es hacerte reír?",
    briitPose: "happy",
    progressPercent: 18,
    sliderLabels: { left: "Tienes que ganártelo", right: "Muy fácil" },
    getReaction: (a) =>
      Number(a) <= 33
        ? {
            text: "Entiendo.\n\nEntonces el desarrollador se metió voluntariamente en un problema.",
            pose: "concerned",
          }
        : Number(a) <= 66
          ? { text: "Respuesta razonable.\n\nTomaré nota.", pose: "talking" }
          : {
              text: "Excelente.\n\nEso reduce considerablemente mis responsabilidades.",
              pose: "happy",
            },
  },
  {
    id: "q8_tres_palabras",
    number: 8,
    type: "multi-text",
    phase: personality,
    prompt: "Describe a Brittany usando tres palabras.",
    helperText:
      "No te preocupes, esto es una autoevaluación completamente seria.",
    briitPose: "waiting",
    progressPercent: 20,
    fields: ["Primera palabra", "Segunda palabra", "Tercera palabra"],
    getReaction: simple("Hmm.\n\nLo permitiré.\n\nAUTOEVALUACIÓN GUARDADA"),
  },
  {
    id: "q9_conocer_gente",
    number: 9,
    type: "choice",
    phase: personality,
    prompt:
      "Conoces a alguien nuevo y resulta que es bastante interesante. ¿Qué haces?",
    briitPose: "talking",
    progressPercent: 23,
    options: [
      "Puedo hablar durante horas.",
      "Escucho más de lo que hablo.",
      "Depende de la persona.",
      "Le pregunto su historial médico.",
      "Me escapo.",
    ],
    getReaction: (a) =>
      String(a) === "Le pregunto su historial médico."
        ? {
            text: "Acabas de convertir una conversación casual en una consulta médica ambulante.\n\nMuy doctora Maldonado de tu parte.",
            pose: "surprised",
          }
        : String(a) === "Me escapo."
          ? { text: "Sospechosamente coherente.", pose: "thinking" }
          : { text: "Eso tiene sentido.\n\nContinuemos.", pose: "talking" },
  },
  {
    id: "q10_valores",
    number: 10,
    type: "textarea",
    phase: personality,
    prompt: "¿Qué es algo que realmente valoras en una persona?",
    helperText: "Puedes escribir lo que quieras.",
    briitPose: "concerned",
    progressPercent: 25,
    skipLabel: "Prefiero no responder",
    getReaction: (_a, skipped) =>
      skipped
        ? { text: "Está bien.\n\nSeguimos.", pose: "talking" }
        : {
            text: "Esa es una buena respuesta.\n\nLa recordaré.",
            pose: "concerned",
          },
  },
  {
    id: "q11_tropiezo",
    number: 11,
    type: "choice",
    phase: behavioral,
    prompt:
      "Vas caminando tranquilamente y de repente tropiezas. No había nada en el piso.\n\n¿Cuál es la explicación más probable?",
    briitPose: "talking",
    progressPercent: 28,
    options: [
      "Había algo. No lo vi.",
      "Perdí el equilibrio.",
      "La gravedad me tiene algo personal.",
      "El piso se movió.",
      "Me encontré un billete de $20 en el piso.",
      "Esto pasa más de lo que quisiera admitir.",
    ],
    getReaction: (a) =>
      String(a) === "Me encontré un billete de $20 en el piso."
        ? {
            text: "Ah.\n\nEntonces no fue una caída.\n\nFue una maniobra financiera.",
            pose: "happy",
          }
        : String(a) === "Esto pasa más de lo que quisiera admitir."
          ? {
              text: "Gracias por tu sinceridad.\n\nEl desarrollador ya había aportado evidencia adicional.",
              pose: "talking",
            }
          : {
              text: "Teoría registrada.\n\nLa gravedad será notificada.",
              pose: "talking",
            },
  },
  {
    id: "q12_molestia",
    number: 12,
    type: "choice",
    phase: behavioral,
    prompt: "Cuando algo te está molestando de verdad, normalmente tú...",
    briitPose: "concerned",
    progressPercent: 30,
    options: [
      "Lo hablo.",
      "Primero necesito pensarlo sola.",
      "Busco a alguien de confianza.",
      "Me alejo un rato.",
      "Desaparezco misteriosamente del mapa durante tres días y luego regreso como si nada hubiera pasado.",
    ],
    getReaction: (a) =>
      String(a).startsWith("Desaparezco")
        ? {
            text: "Al menos eres consciente del procedimiento.",
            pose: "thinking",
          }
        : {
            text: "Anotado.\n\nMantendré la última opción como hipótesis alternativa.",
            pose: "talking",
          },
  },
  {
    id: "q13_perdonar",
    number: 13,
    type: "slider",
    phase: behavioral,
    prompt:
      "¿Qué tan fácil es para ti perdonar a alguien cuando realmente te hizo enojar?",
    briitPose: "thinking",
    progressPercent: 33,
    sliderLabels: {
      left: "Ya, está bien.",
      right: "Quizás en la próxima vida.",
    },
    getReaction: simple(
      "Entendido.\n\nVoy a guardar esto en almacenamiento de largo plazo.",
    ),
  },
  {
    id: "q14_videojuegos",
    number: 14,
    type: "choice",
    phase: behavioral,
    label: "ANTECEDENTE ENCONTRADO: IT TAKES TWO",
    prompt:
      "Después de tu extensa trayectoria profesional en videojuegos, ¿cómo calificarías actualmente tus habilidades?",
    briitPose: "pointing",
    progressPercent: 35,
    options: [
      "Soy bastante buena.",
      "Me defiendo.",
      "He mejorado considerablemente.",
      "Sigo siendo manca, pero con experiencia.",
      "Solicito hablar con el desarrollador.",
    ],
    getReaction: (a) =>
      String(a) === "Soy bastante buena."
        ? { text: "El sistema detectó una inconsistencia.", pose: "surprised" }
        : String(a) === "Me defiendo."
          ? { text: "Una respuesta prudentemente redactada.", pose: "talking" }
          : String(a) === "He mejorado considerablemente."
            ? { text: "Eso sí puedo creerlo.", pose: "happy" }
            : String(a).startsWith("Sigo")
              ? { text: "Autoconocimiento.\n\nExcelente señal.", pose: "happy" }
              : {
                  text: "Solicitud rechazada.\n\nÉl sabía exactamente lo que hacía cuando escribió esta pregunta.",
                  pose: "talking",
                },
  },
  {
    id: "q15_horas",
    number: 15,
    type: "textarea",
    phase: behavioral,
    prompt: "¿De qué tema podrías hablar durante horas sin cansarte?",
    helperText: "Puede ser cualquier cosa.",
    briitPose: "waiting",
    progressPercent: 38,
    getReaction: simple("Hmm.\n\nEso sí me gustaría escucharlo.", "concerned"),
  },
  {
    id: "q16_corazon",
    number: 16,
    type: "choice",
    phase: medical,
    label: "PREGUNTA MÉDICA #01",
    prompt:
      "¿Qué órgano se encarga principalmente de bombear la sangre por el cuerpo?",
    briitPose: "determined",
    progressPercent: 40,
    options: ["Pulmón", "Riñón", "Corazón", "Páncreas"],
    getReaction: (a) =>
      String(a) === "Corazón"
        ? {
            text: "Correcto.\n\nImpresionante.\n\nLa Dra. Maldonado conserva provisionalmente su licencia.",
            pose: "happy",
          }
        : {
            text: "...\n\nBrittany.\n\nTe voy a dar una oportunidad de cambiar esa respuesta antes de que alguien vea esto.",
            pose: "alert",
            action: "retry",
          },
  },
  {
    id: "q17_nino",
    number: 17,
    type: "choice",
    phase: medical,
    prompt:
      "Un niño entra al consultorio asustado porque sabe que le van a poner una vacuna.\n\n¿Qué harías primero?",
    briitPose: "concerned",
    progressPercent: 43,
    options: [
      "Hablarle y explicarle lo que va a pasar.",
      "Intentar distraerlo.",
      "Hacerlo reír primero.",
      "Preguntarle qué le preocupa.",
      "Depende completamente del niño.",
    ],
    getReaction: simple(
      "Hmm...\n\nAPTITUD PEDIÁTRICA: ANALIZANDO...\n\nNo dije nada.",
      "thinking",
    ),
  },
  {
    id: "q18_medico",
    number: 18,
    type: "textarea",
    phase: medical,
    prompt: "¿Qué es lo que más te gusta de ser médico?",
    briitPose: "waiting",
    progressPercent: 45,
    getReaction: simple(
      "Guardado.\n\nEsa respuesta sí era importante.",
      "concerned",
    ),
  },
  {
    id: "q19_kevin",
    number: 19,
    type: "medical-impossible-case",
    phase: medical,
    label: "CASO CLÍNICO DE ALTA PRIORIDAD",
    prompt:
      "Paciente de 47 años presenta una alteración simultánea en 17 vías metabólicas, valores contradictorios en seis biomarcadores, una mutación que todavía no aparece registrada en ninguna base de datos conocida y una respuesta tanto positiva como negativa al mismo tratamiento.\n\nRefiere además que los síntomas empeoran únicamente los martes después de las 4:00 p. m., pero solo si ha dormido exactamente siete horas.\n\nLos resultados del laboratorio fueron repetidos tres veces. Uno fue normal, otro imposible y el tercero aparentemente fue firmado por alguien llamado Kevin, aunque nadie en el laboratorio conoce a ningún Kevin.\n\nEl paciente asegura haber desayunado ceviche a las 3:17 a. m., niega haber viajado recientemente, pero afirma que “técnicamente Perú cuenta”.\n\nDurante la exploración, todos los signos vitales son normales excepto uno que cambia cada vez que alguien vuelve a mirarlo.\n\nTambién insiste en que Mercurio retrógrado altera sus electrolitos, información que el equipo médico decidió registrar únicamente por respeto a la historia clínica.\n\nDetermine con absoluta precisión el mecanismo molecular responsable, el diagnóstico definitivo y el tratamiento curativo.",
    briitPose: "determined",
    progressPercent: 48,
    options: [
      "Tengo una teoría.",
      "Necesito más estudios.",
      "Esto no tiene ningún sentido.",
      "No tengo la menor idea de qué acabas de preguntarme.",
      "¿Quién es Kevin?",
    ],
    getReaction: (a) => ({
      text: `...\n\nA decir verdad, yo tampoco sé.\n\nEsa pregunta no tiene una respuesta definida.\n\nQuería comprobar si tú sí sabías.\n\nNunca se pierde nada preguntando.${String(a) === "¿Quién es Kevin?" ? "\n\nEsa sigue siendo la parte que más me preocupa." : ""}`,
      pose: "surprised",
    }),
  },
  {
    id: "q20_especialidad",
    number: 20,
    type: "textarea",
    phase: medical,
    prompt:
      "Si hoy tuvieras que escoger una especialidad, sin preocuparte por tiempo, dinero ni ninguna otra cosa...\n\n¿Cuál escogerías?",
    briitPose: "concerned",
    progressPercent: 50,
    getReaction: (a) =>
      /pediatr[ií]a|pediatra/i.test(String(a))
        ? {
            text: "...\n\nSabía que había algo sospechosamente pediátrico en tus resultados.\n\nEl desarrollador va a estar insoportable cuando vea esto.",
            pose: "surprised",
          }
        : /no\s*s[eé]|todav[ií]a\s+no\s+s[eé]/i.test(String(a))
          ? {
              text: "También es una respuesta válida.\n\nSupongo que para eso existe el futuro.",
              pose: "concerned",
            }
          : {
              text: "Interesante.\n\nParece que alguien tendrá que actualizar sus predicciones.",
              pose: "talking",
            },
  },
  {
    id: "q21_frente",
    number: 21,
    type: "biometric-scan",
    phase: "PRUEBAS ALTAMENTE CIENTÍFICAS",
    prompt: "¿Consideras que tienes la frente grande?",
    briitPose: "thinking",
    progressPercent: 52.5,
    options: [
      "No.",
      "Un poquito.",
      "No tengo la frente tan grande.",
      "Tengo espacio para una presentación de PowerPoint.",
      "Siguiente pregunta.",
    ],
    getReaction: (a) =>
      String(a).startsWith("Tengo espacio")
        ? { text: "Excelente.\n\nAutoconocimiento.", pose: "happy" }
        : String(a) === "No." || String(a).startsWith("No tengo")
          ? {
              text: "Entendido.\n\nRegistrando: resistencia a los resultados biométricos.",
              pose: "thinking",
            }
          : String(a) === "Un poquito."
            ? {
                text: "Una respuesta prudentemente calculada.",
                pose: "talking",
              }
            : { text: "Intento de evasión registrado.", pose: "pointing" },
  },
  {
    id: "q22_inteligencia",
    number: 22,
    type: "slider",
    phase: "PRUEBAS ALTAMENTE CIENTÍFICAS",
    prompt: "¿Qué tan inteligente consideras que eres?",
    briitPose: "thinking",
    progressPercent: 55,
    sliderLabels: {
      left: "A veces tengo mis momentos",
      right: "Objetivamente brillante",
    },
    getReaction: () => ({
      text: "Hmm.",
      pose: "thinking",
      action: "q22",
      beats: [
        { text: "Hmm.", pose: "thinking" },
        {
          text: "Los registros indican que puedes subir un poco más eso.",
          pose: "talking",
        },
      ],
    }),
  },
  {
    id: "q23_habilidad",
    number: 23,
    type: "textarea",
    phase: "PRUEBAS ALTAMENTE CIENTÍFICAS",
    prompt:
      "Fuera de la medicina, ¿en qué consideras que eres realmente buena?",
    helperText: "Y no, “nada” no cuenta.",
    briitPose: "waiting",
    progressPercent: 57.5,
    skipLabel: "Prefiero pasar",
    getReaction: (a, skipped) => {
      const v = String(a)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      if (skipped)
        return {
          text: "Está bien.\n\nPero sigo sin creerte.",
          pose: "talking",
        };
      return [
        "nada",
        "ninguna",
        "en nada",
        "no soy buena en nada",
        "no se hacer nada",
        "no soy buena para nada",
      ].includes(v)
        ? {
            text: "Respuesta rechazada.\n\nInténtalo otra vez.\n\nEsta vez sin hacerte la humilde.",
            pose: "pointing",
            action: "retry",
          }
        : { text: "Bien.\n\nEsa sí la voy a guardar.", pose: "happy" };
    },
  },
  {
    id: "q24_doctora",
    number: 24,
    type: "choice",
    phase: "PRUEBAS ALTAMENTE CIENTÍFICAS",
    prompt:
      "Alguien te dice casualmente:\n\n“Me ha estado doliendo la cabeza desde ayer.”\n\n¿Qué pasa por tu mente primero?",
    briitPose: "thinking",
    progressPercent: 60,
    options: [
      "Seguro no es nada, descansa.",
      "Empiezo a hacerle preguntas.",
      "Ya estoy pensando en posibles causas.",
      "Cinco minutos después ya conozco sus antecedentes, síntomas y hasta qué desayunó.",
      "Soy doctora, sí, pero ahorita no estoy atendiendo.",
    ],
    getReaction: (a) =>
      String(a).startsWith("Seguro")
        ? { text: "Directa.\n\nMe sorprende un poco.", pose: "surprised" }
        : String(a).startsWith("Empiezo")
          ? {
              text: "Una pregunta lleva a otra...\n\nY de repente tenemos consulta.",
              pose: "talking",
            }
          : String(a).startsWith("Ya estoy")
            ? {
                text: "Diagnóstico diferencial activado automáticamente.\n\nEntendido.",
                pose: "thinking",
              }
            : String(a).startsWith("Cinco")
              ? {
                  text: "Excelente.\n\nConsulta médica ambulante confirmada.",
                  pose: "happy",
                }
              : {
                  text: "Entendido.\n\nLa Dra. Maldonado se encuentra fuera de servicio.",
                  pose: "talking",
                },
  },
  {
    id: "q25_dia",
    number: 25,
    type: "choice",
    phase: "PRUEBAS ALTAMENTE CIENTÍFICAS",
    prompt:
      "Tienes que escoger una sola cosa para mejorar instantáneamente tu día.\n\n¿Cuál?",
    briitPose: "talking",
    progressPercent: 62.5,
    options: [
      "Una buena conversación.",
      "Comida rica.",
      "Una canción.",
      "Dormir.",
      "Salir a algún lado.",
      "Playa.",
      "Otra cosa...",
    ],
    getReaction: () => ({
      text: "Información sorprendentemente útil.",
      pose: "happy",
    }),
  },
  {
    id: "q26_audio",
    number: 26,
    type: "choice",
    phase: "ACTIVIDAD SOSPECHOSA",
    prompt: "Escoge una.",
    briitPose: "thinking",
    progressPercent: 65,
    options: ["Audio 01", "Audio 02", "Audio 03", "Audio 04"],
    getReaction: (a) =>
      String(a) === "Audio 04"
        ? {
            text: "Ah.\n\nEsa.\n\nCoincide con los registros.",
            pose: "surprised",
          }
        : {
            text: "Interesante.\n\nActualizando registros musicales...",
            pose: "talking",
          },
  },
  {
    id: "q27_dilema",
    number: 27,
    type: "choice",
    phase: "ACTIVIDAD SOSPECHOSA",
    prompt: "Escoge una sola opción.\n\nNo puedes hacer trampa.",
    briitPose: "thinking",
    progressPercent: 67.5,
    options: [
      "Tener siempre la respuesta correcta.",
      "Poder entender perfectamente lo que siente una persona aunque no lo diga.",
    ],
    getReaction: (a) =>
      String(a).startsWith("Tener")
        ? { text: "Razonable.", pose: "talking" }
        : { text: "También esperaba un poco esa respuesta.", pose: "happy" },
  },
  {
    id: "q28_no_tocar",
    number: 28,
    type: "forbidden-button",
    phase: "ACTIVIDAD SOSPECHOSA",
    prompt: "Esta es sencilla.\n\nNO presiones el botón rojo.",
    helperText: "Bajo ninguna circunstancia lo presiones.",
    briitPose: "alert",
    progressPercent: 70,
    getReaction: () => ({
      text: "...",
      pose: "alert",
      beats: [
        { text: "...", pose: "alert" },
        {
          text: "Te dije explícitamente que no lo presionaras.",
          pose: "concerned",
        },
        { text: "Aunque, para ser justa...", pose: "thinking" },
        { text: "Tampoco te dejé ninguna otra opción.", pose: "talking" },
      ],
    }),
  },
  {
    id: "q29_aprender",
    number: 29,
    type: "textarea",
    phase: "ACTIVIDAD SOSPECHOSA",
    prompt:
      "Si pudieras aprender algo nuevo instantáneamente, ¿qué escogerías?",
    helperText: "Puede ser cualquier cosa.",
    briitPose: "waiting",
    progressPercent: 72.5,
    getReaction: () => ({
      text: "Buena elección.",
      pose: "happy",
      beats: [
        { text: "Buena elección.", pose: "happy" },
        {
          text: "Aunque eso técnicamente sería hacer trampa.",
          pose: "thinking",
        },
        { text: "La aceptaré igual.", pose: "talking" },
      ],
    }),
  },
  {
    id: "q30_cuestionable",
    number: 30,
    type: "slider",
    phase: "ACTIVIDAD SOSPECHOSA",
    prompt:
      "Hasta este punto, ¿qué tan cuestionable consideras este proceso de verificación?",
    briitPose: "thinking",
    progressPercent: 75,
    sliderLabels: {
      left: "Sorprendentemente profesional",
      right: "Quiero hablar con el responsable",
    },
    getReaction: (answer) =>
      Number(answer) <= 33
        ? {
            text: "Eso me preocupa más que cualquier otra respuesta que hayas dado.",
            pose: "surprised",
          }
        : Number(answer) <= 66
          ? { text: "Correcto.", pose: "talking" }
          : {
              text: "Perfecto.",
              pose: "happy",
              beats: [
                { text: "Perfecto.", pose: "happy" },
                { text: "Tengo algo precisamente para eso.", pose: "pointing" },
              ],
            },
  },
  {
    id: "q31_ser_ella",
    number: 31,
    type: "choice",
    phase: "VERIFICACIÓN FINAL",
    prompt: "¿Cuándo sientes que puedes ser más tú misma?",
    briitPose: "concerned",
    progressPercent: 77.5,
    options: [
      "Cuando estoy con alguien en quien confío.",
      "Cuando estoy hablando de algo que realmente me interesa.",
      "Cuando estoy escuchando música o cantando.",
      "Cuando estoy ayudando a alguien.",
      "Cuando estoy sola.",
      "Depende.",
    ],
    getReaction: () => ({
      text: "Eso dice más de ti de lo que parece.",
      pose: "concerned",
    }),
  },
  {
    id: "q32_cualidad",
    number: 32,
    type: "textarea",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "Si tuvieras que escoger una cualidad tuya que no cambiarías por nada, ¿cuál sería?",
    helperText: "No tiene que ser algo enorme.",
    briitPose: "waiting",
    progressPercent: 80,
    skipLabel: "Prefiero pasar",
    getReaction: (_answer, skipped) =>
      skipped
        ? {
            text: "Está bien.",
            pose: "talking",
            beats: [
              { text: "Está bien.", pose: "talking" },
              { text: "Lo dejaré pendiente.", pose: "concerned" },
            ],
          }
        : {
            text: "Bien.",
            pose: "happy",
            beats: [
              { text: "Bien.", pose: "happy" },
              { text: "Esa respuesta sí me gusta.", pose: "concerned" },
            ],
          },
  },
  {
    id: "q33_bebe",
    number: 33,
    type: "choice",
    phase: "VERIFICACIÓN FINAL",
    prompt: "Cuando dices ‘bebé’, ¿a quién se lo dices?",
    briitPose: "talking",
    progressPercent: 82.5,
    options: [
      "A casi todo el mundo.",
      "A varias personas.",
      "Solo a ciertas personas.",
      "Al desarrollador de este juego.",
      "No voy a responder eso.",
    ],
    getReaction: (answer) =>
      String(answer).startsWith("A casi")
        ? {
            text: "Entendido.",
            pose: "thinking",
            beats: [
              { text: "Entendido.", pose: "thinking" },
              {
                text: "Eso podría decepcionar a ciertas partes interesadas.",
                pose: "talking",
              },
            ],
          }
        : String(answer).startsWith("A varias")
          ? {
              text: "Información registrada.",
              pose: "talking",
              beats: [
                { text: "Información registrada.", pose: "talking" },
                { text: "No sacaré conclusiones todavía.", pose: "thinking" },
              ],
            }
          : String(answer).startsWith("Solo")
            ? {
                text: "Ah.",
                pose: "surprised",
                beats: [
                  { text: "Ah.", pose: "surprised" },
                  { text: "Selectivo.", pose: "talking" },
                ],
              }
            : String(answer).startsWith("Al desarrollador")
              ? {
                  text: "...",
                  pose: "surprised",
                  beats: [
                    { text: "...", pose: "surprised" },
                    { text: "Información de máxima prioridad.", pose: "alert" },
                    { text: "Definitivamente guardaré eso.", pose: "happy" },
                  ],
                }
              : {
                  text: "Respuesta sospechosa.",
                  pose: "thinking",
                  beats: [
                    { text: "Respuesta sospechosa.", pose: "thinking" },
                    { text: "Pero permitida.", pose: "talking" },
                  ],
                },
  },
  {
    id: "q34_cumplido",
    number: 34,
    type: "choice",
    phase: "VERIFICACIÓN FINAL",
    prompt: "¿Con cuál de estos cumplidos te sonrojas más?",
    briitPose: "surprised",
    progressPercent: 85,
    options: [
      "Que soy inteligente.",
      "Que soy bonita.",
      "Que soy una buena doctora.",
      "Que canto bonito.",
      "Depende de quién me lo diga.",
    ],
    getReaction: (answer) =>
      String(answer).startsWith("Que soy inteligente")
        ? {
            text: "Anotado.",
            pose: "thinking",
            beats: [
              { text: "Anotado.", pose: "thinking" },
              { text: "Por si acaso, los registros coinciden.", pose: "happy" },
            ],
          }
        : String(answer).startsWith("Que soy bonita")
          ? {
              text: "Hmm.",
              pose: "thinking",
              beats: [
                { text: "Hmm.", pose: "thinking" },
                { text: "Información difícil de discutir.", pose: "happy" },
              ],
            }
          : String(answer).startsWith("Que soy una buena doctora")
            ? { text: "Eso sí parece importante para ti.", pose: "concerned" }
            : String(answer).startsWith("Que canto bonito")
              ? {
                  text: "Interesante.",
                  pose: "talking",
                  beats: [
                    { text: "Interesante.", pose: "talking" },
                    { text: "Habrá que verificarlo algún día.", pose: "happy" },
                  ],
                }
              : {
                  text: "Ah.",
                  pose: "surprised",
                  beats: [
                    { text: "Ah.", pose: "surprised" },
                    { text: "Entonces el contexto importa.", pose: "thinking" },
                    { text: "Información útil.", pose: "talking" },
                  ],
                },
  },
  {
    id: "q35_credito",
    number: 35,
    type: "textarea",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "¿Qué has hecho últimamente por lo que crees que deberías darte un poquito más de crédito?",
    helperText: "No tiene que ser algo enorme.",
    briitPose: "waiting",
    progressPercent: 87.5,
    skipLabel: "Prefiero pasar",
    getReaction: (answer, skipped) => {
      if (skipped)
        return {
          text: "Está bien.",
          pose: "talking",
          beats: [
            { text: "Está bien.", pose: "talking" },
            { text: "Sin presión.", pose: "concerned" },
          ],
        };
      const value = String(answer)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      return [
        "nada",
        "nada realmente",
        "ninguna cosa",
        "no se",
        "no he hecho nada",
      ].includes(value)
        ? {
            text: "Está bien.",
            pose: "concerned",
            beats: [
              { text: "Está bien.", pose: "concerned" },
              { text: "Lo dejaré pendiente.", pose: "talking" },
            ],
          }
        : {
            text: "Bien.",
            pose: "happy",
            beats: [
              { text: "Bien.", pose: "happy" },
              { text: "Y no lo minimices después.", pose: "concerned" },
            ],
          };
    },
  },
  {
    id: "q36_kit",
    number: 36,
    type: "multi-select",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "Necesito preparar un kit de emergencia para mejorarte el ánimo.\n\nEscoge exactamente tres cosas.",
    briitPose: "pointing",
    progressPercent: 90,
    options: [
      "Una buena conversación",
      "Algo salado para comer",
      "Música",
      "Cantar",
      "Dormir",
      "Salir a algún lado",
      "Una película o serie",
      "Que me dejen tranquila un rato",
      "Playa",
      "Otra cosa...",
    ],
    getReaction: () => ({
      text: "KIT DE BRITTANY — APROBADO.",
      pose: "happy",
      beats: [
        { text: "KIT DE BRITTANY — APROBADO.", pose: "happy" },
        { text: "Esto podría ser útil.", pose: "talking" },
      ],
    }),
  },
  {
    id: "q37_feliz",
    number: 37,
    type: "textarea",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "¿Qué te gustaría hacer más seguido simplemente porque te hace feliz?",
    helperText: "No tiene que ser algo productivo.",
    briitPose: "waiting",
    progressPercent: 92.5,
    skipLabel: "Prefiero pasar",
    getReaction: (answer, skipped) => {
      if (skipped)
        return {
          text: "Está bien.",
          pose: "talking",
          beats: [
            { text: "Está bien.", pose: "talking" },
            { text: "Lo dejamos abierto.", pose: "concerned" },
          ],
        };
      const value = String(answer)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      return ["nada", "no se", "ninguna cosa", "no tengo idea"].includes(value)
        ? {
            text: "Está bien.",
            pose: "concerned",
            beats: [
              { text: "Está bien.", pose: "concerned" },
              { text: "Puedes decidirlo después.", pose: "talking" },
            ],
          }
        : {
            text: "Buen plan.",
            pose: "happy",
            beats: [
              { text: "Buen plan.", pose: "happy" },
              {
                text: "OBJETIVO PERSONAL NO OFICIAL: GUARDADO.",
                pose: "pointing",
              },
            ],
          };
    },
  },
  {
    id: "q38_dia_dificil",
    number: 38,
    type: "choice",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "Cuando alguien que quieres está pasando un día difícil, ¿qué sueles hacer?",
    briitPose: "concerned",
    progressPercent: 95,
    options: [
      "Escucharlo.",
      "Intentar hacerlo reír.",
      "Quedarme ahí, aunque no hablemos mucho.",
      "Darle espacio.",
      "Intentar ayudar a resolver el problema.",
      "Depende de la persona y del momento.",
    ],
    getReaction: (answer) => {
      const value = String(answer);
      const first = value.startsWith("Escucharlo")
        ? {
            text: "Eso puede ayudar más de lo que parece.",
            pose: "concerned" as const,
          }
        : value.startsWith("Intentar hacerlo reír")
          ? { text: "Una estrategia bastante válida.", pose: "happy" as const }
          : value.startsWith("Quedarme ahí")
            ? {
                text: "A veces estar presente ya es suficiente.",
                pose: "concerned" as const,
              }
            : value.startsWith("Darle espacio")
              ? {
                  text: "También es una forma de cuidar.",
                  pose: "talking" as const,
                }
              : value.startsWith("Intentar ayudar")
                ? { text: "Muy doctora Maldonado.", pose: "thinking" as const }
                : { text: "Respuesta razonable.", pose: "talking" as const };
      const optionBeat = value.startsWith("Intentar ayudar")
        ? { text: "Intentando arreglar el problema.", pose: "talking" as const }
        : value.startsWith("Depende")
          ? {
              text: "No todo el mundo necesita lo mismo.",
              pose: "concerned" as const,
            }
          : null;
      return {
        text: first.text,
        pose: first.pose,
        beats: [
          first,
          ...(optionBeat ? [optionBeat] : []),
          {
            text: "A veces también hay personas que quieren hacer exactamente eso por ti.",
            pose: "concerned" as const,
          },
        ],
      };
    },
  },
  {
    id: "q39_nota_futuro",
    number: 39,
    type: "textarea",
    phase: "VERIFICACIÓN FINAL",
    prompt:
      "Si pudieras dejarle una nota corta a la Brittany de dentro de un año, ¿qué le dirías?",
    helperText: "Puede ser una frase o todo lo que quieras escribir.",
    briitPose: "waiting",
    progressPercent: 97.5,
    skipLabel: "Prefiero pasar",
    getReaction: (_answer, skipped) =>
      skipped
        ? {
            text: "Está bien.",
            pose: "talking",
            beats: [
              { text: "Está bien.", pose: "talking" },
              { text: "Esa también puede esperar.", pose: "concerned" },
            ],
          }
        : {
            text: "Guardado.",
            pose: "concerned",
            beats: [
              { text: "Guardado.", pose: "concerned" },
              { text: "No voy a comentar esa respuesta.", pose: "talking" },
              { text: "Esa era para ti.", pose: "concerned" },
            ],
          },
  },
  {
    id: "q40_identidad",
    number: 40,
    type: "choice",
    phase: "VERIFICACIÓN FINAL",
    prompt: "Última comprobación.\n\n¿Quién es Brittany?",
    briitPose: "determined",
    progressPercent: 97.5,
    options: [
      "La Dra. Maldonado.",
      "Bastante inteligente.",
      "Bastante guapa.",
      "Una amenaza moderada para sus propios tobillos.",
      "Brittany.",
    ],
    getReaction: () => ({
      text: "Correcto.",
      pose: "happy",
      beats: [
        { text: "Correcto.", pose: "happy" },
        { text: "Bueno...", pose: "thinking" },
        { text: "En realidad todas eran correctas.", pose: "talking" },
        { text: "Solo necesitaba que presionaras una.", pose: "pointing" },
      ],
    }),
  },
];
