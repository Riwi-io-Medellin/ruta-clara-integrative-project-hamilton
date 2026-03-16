import ai_service from '../services/groq.service.js'
import { supabase } from '../config/db.js'

// Mejorar clasificación de un reporte
export const improve_report = async (req, res) => {
  try {
    const { tarea_id } = req.body

    if (!tarea_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Falta tarea_id' 
      })
    }

    const { data: tarea, error: tareaError } = await supabase
      .from('tareas')
      .select(`
        *,
        activos(id_activo, etiqueta, tipos_activo(nombre), zona_id, zonas(nombre, piso))
      `)
      .eq('id_tarea', tarea_id)
      .single()

    if (tareaError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tarea no encontrada' 
      })
    }

    const analisis = await ai_service.improve_report_classification({
      tipo_dano: tarea.tipo_dano,
      activo: tarea.activos?.etiqueta || 'Desconocido',
      zona: tarea.activos?.zonas?.nombre || 'Desconocida',
      descripcion: tarea.tipo_dano
    })

    if (!analisis.success) {
      return res.status(500).json({
        success: false,
        error: 'Error al procesar con IA'
      })
    }

    if (analisis.analisis_ia?.prioridad) {
      await supabase
        .from('tareas')
        .update({ prioridad_ia: analisis.analisis_ia.prioridad })
        .eq('id_tarea', tarea_id)
    }

    res.json({
      success: true,
      tarea_id,
      mejoras: analisis.analisis_ia
    })
  } catch (err) {
    console.error('[AI] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Obtener orden optimizado de tareas
export const get_optimized_task_order = async (req, res) => {
  try {
    const { zona_id } = req.query

    const query = supabase
      .from('tareas')
      .select(`
        id_tarea,
        tipo_dano,
        prioridad_ia,
        activos(etiqueta, zona_id, zonas(nombre))
      `)
      .eq('estado_tarea', 'Pendiente')

    if (zona_id) {
      query.eq('activos.zona_id', parseInt(zona_id))
    }

    const { data: tareas, error: tareasError } = await query

    if (tareasError) {
      return res.status(500).json({ success: false, error: tareasError.message })
    }

    if (tareas.length === 0) {
      return res.json({ success: true, mensaje: 'No hay tareas pendientes', tareas: [] })
    }

    const tareasFormatted = tareas.map(t => ({
      id_tarea: t.id_tarea,
      tipo_dano: t.tipo_dano,
      zona: t.activos?.[0]?.zonas?.nombre || 'Desconocida',
      prioridad_ia: t.prioridad_ia,
      activo: t.activos?.[0]?.etiqueta || 'Desconocido'
    }))

    const optimizacion = await ai_service.optimize_task_order(tareasFormatted)

    res.json({
      success: true,
      tareas_analizadas: tareas.length,
      optimizacion: optimizacion.optimizacion_ia
    })
  } catch (err) {
    console.error('[AI] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Sugerir órdenes de compra
export const suggest_purchases = async (req, res) => {
  try {
    const { data: repuestos, error: repuestosError } = await supabase
      .from('repuestos')
      .select(`
        id_repuesto,
        nombre,
        stock_actual,
        stock_minimo,
        categorias_repuestos(nombre)
      `)
      .lt('stock_actual', 50)

    if (repuestosError) {
      return res.status(500).json({ success: false, error: repuestosError.message })
    }

    if (repuestos.length === 0) {
      return res.json({ success: true, mensaje: 'Todos los repuestos tienen stock suficiente', sugerencias: [] })
    }

    const sugerencias = await ai_service.suggest_purchase_orders(repuestos)

    res.json({
      success: true,
      repuestos_analizados: repuestos.length,
      sugerencias_compra: sugerencias.sugerencias_compra
    })
  } catch (err) {
    console.error('[AI] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Mejorar descripción de un reporte
export const improve_description = async (req, res) => {
  try {
    const { descripcion, tipo_dano, activo, zona } = req.body

    if (!descripcion || descripcion.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Falta la descripción' })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('[Controller] GROQ_API_KEY no está configurada')
      return res.status(503).json({
        success: false,
        error: 'Servicio de IA no disponible. Configura GROQ_API_KEY en .env'
      })
    }

    console.log('[improveDescription] Enviando a IA:', { descripcion, tipo_dano, activo, zona })

    const mejora = await ai_service.improve_report_description(
      descripcion.trim(),
      {
        tipo_dano: tipo_dano || '',
        activo: activo || '',
        zona: zona || ''
      }
    )

    console.log('[improveDescription] Respuesta de IA:', mejora)

    if (!mejora.success) {
      console.error('[Controller] Fallo en improveDescription:', mejora)
      return res.status(500).json({
        success: false,
        error: mejora.error || 'Error al procesar con IA',
        details: mejora.details || null
      })
    }

    res.json({
      success: true,
      original: descripcion,
      mejorado: mejora.mejorado
    })
  } catch (err) {
    console.error('[improveDescription] Error:', err.message, err)
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Error interno del servidor'
    })
  }
}

export default {
  improve_report,
  get_optimized_task_order,
  suggest_purchases,
  improve_description
}