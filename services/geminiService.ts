import { GoogleGenAI } from "@google/genai";
import { Target } from '../types';

const getAiClient = () => {
  // Asumiendo que la API KEY está disponible en el entorno
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key no encontrada. Las funciones de IA estarán deshabilitadas o simuladas.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTargetProfile = async (target: Target): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Servicio de IA no disponible: Falta API Key.";

  const prompt = `
    Analiza el siguiente objetivo de inteligencia para un informe forense.
    Nombre en Clave: ${target.codeName}
    Nombre Completo: ${target.fullName}
    Nivel de Riesgo: ${target.riskLevel}
    Notas: ${target.notes}
    Número de Dispositivos: ${target.devices.length}
    Evidencias Conocidas: ${target.evidence.length}
    Última Ubicación Conocida (Lat/Lng): ${target.lastKnownLocation ? `${target.lastKnownLocation.lat}, ${target.lastKnownLocation.lng}` : 'Desconocida'}

    Por favor proporciona:
    1. Una evaluación psicológica basada en las notas limitadas.
    2. Estrategia de vigilancia recomendada.
    3. Riesgos potenciales involucrados en la aprehensión.
    
    Mantén un tono profesional, estilo militar/inteligencia (OSINT). Responde en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se generó análisis.";
  } catch (error) {
    console.error("Fallo en Análisis de IA", error);
    return "Error generando el análisis. Por favor verifica la conexión y credenciales.";
  }
};

export const analyzeEvidenceImage = async (base64Image: string, mimeType: string, context: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Servicio de IA no disponible.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Flash is better for multimodal analysis/understanding
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Image } },
                    { text: `Analiza esta imagen en el contexto de: ${context}. Identifica objetos clave, posibles marcadores de ubicación y anomalías relevantes para una investigación. Responde en español.` }
                ]
            }
        });
        return response.text || "No se encontraron hallazgos.";
    } catch (error) {
        console.error("Fallo en Análisis de Imagen", error);
        return "Error analizando la imagen.";
    }
}