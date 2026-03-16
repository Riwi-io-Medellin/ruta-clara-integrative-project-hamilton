import axios from 'axios'

const GROQ_API_KEY = process.env.GROQ_API_KEY

if (!GROQ_API_KEY) {
  console.error('[AIService] ❌ GROQ_API_KEY no configurada en .env. La funcionalidad de IA no funcionará.')
} else {
  console.log('[AIService] ✅ GROQ_API_KEY configurada correctamente')
}

const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY || ''}`,
    'Content-Type': 'application/json'
  }
})

// Helper: llama a la API de Groq y devuelve el texto de respuesta
async function callGroq(systemPrompt, userPrompt, maxTokens = 800) {
  const response = await groqClient.post('/chat/completions', {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: maxTokens
  })
  return response.data.choices[0].message.content
}

// Helper: limpia bloques markdown y parsea JSON
function parseJSON(text) {
  let clean = text.trim()
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(clean)
}

const ai_service = {
  /**
   * Analizar reportes de daños y sugerir mejoras en clasificación
   */
  async improve_report_classification(evento) {
    try {
      const systemPrompt = 'Eres un experto en mantenimiento de infraestructura tecnológica. Analiza reportes de daños y proporciona clasificaciones precisas. Responde SIEMPRE en JSON válido sin markdown.'

      const userPrompt = `
Analiza este reporte de mantenimiento y proporciona:
1. Clasificación de severidad (1-10)
2. Categoría de daño sugerida
3. Tipo de herramientas necesarias
4. Tiempo estimado en minutos
5. Materiales/Repuestos probables

Datos del evento:
- Tipo de daño inicial: "${evento.tipo_dano}"
- Activo afectado: "${evento.activo}"
- Ubicación: "${evento.zona}"
- Descripción: "${evento.descripcion || 'Sin descripción detallada'}"

Responde SOLO en JSON sin markdown:
{
  "prioridad": <número 1-10>,
  "categoria": "<categoría>",
  "herramientas": ["<herramienta1>", "<herramienta2>"],
  "tiempo_estimado_minutos": <número>,
  "repuestos_probables": ["<repuesto1>", "<repuesto2>"],
  "recomendaciones": "<texto corto>"
}
      `

      console.log('[AIService] Enviando solicitud a Groq para clasificar reporte...')
      const content = await callGroq(systemPrompt, userPrompt, 500)
      const analysis = parseJSON(content)

      return {
        success: true,
        original: evento,
        analisis_ia: analysis
      }
    } catch (err) {
      console.error('[AIService] Error:', err.response?.data || err.message)
      return {
        success: false,
        error: err.message,
        analisis_ia: null
      }
    }
  },

  /**
   * Sugerir orden de tareas optimizado por eficiencia
   */
  async optimize_task_order(tareas) {
    try {
      const tareasText = tareas.map((t, i) =>
        `${i + 1}. ID: ${t.id_tarea}, Daño: ${t.tipo_dano}, Zona: ${t.zona}, Prioridad IA: ${t.prioridad_ia}`
      ).join('\n')

      const systemPrompt = 'Eres un experto en optimización de rutas y procesos. Ordena tareas para máxima eficiencia. Responde SIEMPRE en JSON válido sin markdown.'

      const userPrompt = `
Tienes estas tareas de mantenimiento. Ordénalas por EFICIENCIA considerando:
1. Agrupar por tipo de herramienta (electricidad primero, luego mecánica, etc.)
2. Agrupar por zona para minimizar desplazamientos
3. Respetar la prioridad (números altos = más urgentes)

Tareas:
${tareasText}

Responde SOLO en JSON:
{
  "orden_optimizado": [
    {
      "posicion": 1,
      "tarea_id": <id>,
      "razon": "<explicación breve>"
    }
  ],
  "tiempo_total_estimado_minutos": <número>,
  "notas": "<observaciones>"
}
      `

      console.log('[AIService] Enviando solicitud a Groq para optimizar tareas...')
      const content = await callGroq(systemPrompt, userPrompt, 800)
      const optimization = parseJSON(content)

      return {
        success: true,
        tareas_originales: tareas.length,
        optimizacion_ia: optimization
      }
    } catch (err) {
      console.error('[AIService] Error:', err.response?.data || err.message)
      return {
        success: false,
        error: err.message,
        optimizacion_ia: null
      }
    }
  },

  /**
   * Mejorar descripción de un reporte usando el contexto del componente dañado
   */
  async improve_report_description(descripcionOriginal, contexto = {}) {
    try {
      // Construir lista de componentes dañados de forma legible
      const componentesLabel = {
        'pantalla o torre': 'Pantalla o Torre',
        'cable': 'Cable',
        'enchufe': 'Enchufe/Toma eléctrica',
        'teclado': 'Teclado',
        'silla': 'Silla',
        'otro': 'Otro componente'
      }
      const tiposDano = (contexto.tipo_dano || '')
        .split(',')
        .map(t => componentesLabel[t.trim().toLowerCase()] || t.trim())
        .filter(Boolean)
        .join(', ')

      const componenteInfo = tiposDano
        ? `El usuario seleccionó que el/los componente(s) dañado(s) es/son: ${tiposDano}.`
        : 'No se especificó el componente dañado.'

      const systemPrompt = `Eres un técnico de mantenimiento de TI con 10 años de experiencia redactando reportes de fallas. 
Redactas reportes PRECISOS, CORTOS y PROFESIONALES como los que se entregan en una orden de trabajo real.
REGLAS:
- Máximo 3 oraciones en el texto_mejorado
- Primera oración: componente afectado + síntoma exacto
- Segunda oración: impacto operativo (qué deja de funcionar)
- Tercera oración (opcional): condición observada o urgencia
- Corrige ortografía sin cambiar los hechos
- NUNCA uses frases genéricas como "presenta problemas" o "está en malas condiciones"
- Sé específico: menciona el tipo exacto de componente (ej: "cable HDMI", "enchufe izquierdo", "teclado USB")
- Responde SIEMPRE en JSON válido sin markdown`

      const userPrompt = `
DATOS DEL REPORTE:
- Componente(s) dañado(s): ${tiposDano || 'No especificado'}
- Puesto/Activo: ${contexto.activo || 'No especificado'}
- Ubicación: ${contexto.zona || 'No especificada'}

DESCRIPCIÓN DEL USUARIO:
"${descripcionOriginal}"

TAREA:
Redacta un reporte técnico breve y preciso de máximo 3 oraciones.
Ejemplo de formato esperado:
"El cable HDMI del puesto 12 presenta ruptura en el conector, impidiendo la transmisión de señal de video entre la torre y el monitor. Se requiere reemplazo inmediato del cable para restablecer la operatividad del equipo."

RESPONDE SOLO en JSON sin markdown:
{
  "texto_mejorado": "<reporte técnico de máximo 3 oraciones, preciso y profesional>",
  "cambios_principales": ["<corrección o mejora 1>", "<corrección o mejora 2>"],
  "observaciones_tecnicas": "<acción recomendada concreta, ej: reemplazar cable HDMI de 1.8m>"
}
      `

      console.log('[AIService] Enviando solicitud a Groq para mejorar descripción...')
      console.log('[AIService] Componentes dañados:', tiposDano)
      const content = await callGroq(systemPrompt, userPrompt, 800)
      console.log('[AIService] Respuesta de Groq recibida:', content.substring(0, 100) + '...')

      const improvement = parseJSON(content)

      return {
        success: true,
        original: descripcionOriginal,
        mejorado: improvement
      }
    } catch (err) {
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      }
      console.error('[AIService] Error en improveReportDescription:', errorDetails)
      return {
        success: false,
        error: err.response?.data?.error?.message || err.message,
        details: errorDetails,
        mejorado: null
      }
    }
  },

  /**
   * Generar recomendación de compra basada en historial
   */
  async suggest_purchase_orders(repuestosEnStock) {
    try {
      const repuestosText = repuestosEnStock.map(r =>
        `${r.nombre}: ${r.stock_actual}/${r.stock_minimo} unidades`
      ).join('\n')

      const systemPrompt = 'Eres un experto en gestión de inventario. Sugiere órdenes de compra inteligentes. Responde SIEMPRE en JSON válido sin markdown.'

      const userPrompt = `
Basándote en este inventario, sugiere órdenes de compra considerando:
1. Repuestos bajo stock_minimo
2. Patrones de consumo
3. Cantidad económica de compra (lotes mínimos)

Inventario actual:
${repuestosText}

Responde SOLO en JSON:
{
  "ordenes_sugeridas": [
    {
      "repuesto": "<nombre>",
      "cantidad_actual": <número>,
      "cantidad_comprar": <número>,
      "razon": "<explicación>"
    }
  ],
  "presupuesto_estimado": "Consultar con proveedor",
  "urgencia": "<ALTA|MEDIA|BAJA>"
}
      `

      console.log('[AIService] Enviando solicitud a Groq para sugerir compras...')
      const content = await callGroq(systemPrompt, userPrompt, 600)
      const purchase = parseJSON(content)

      return {
        success: true,
        sugerencias_compra: purchase
      }
    } catch (err) {
      console.error('[AIService] Error:', err.response?.data || err.message)
      return {
        success: false,
        error: err.message,
        sugerencias_compra: null
      }
    }
  }
}

export default ai_service