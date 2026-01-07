import React, { useState, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Paperclip, X, FileImage } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  images?: string[]; // Base64 strings for display
}

interface Attachment {
  file: File;
  preview: string;
  base64Data: string; // Raw base64 without prefix for API
  mimeType: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Sistema en Línea. Soy capaz de analizar expedientes, cruzar referencias de evidencia y analizar imágenes tácticas o documentos. ¿Cómo puedo asistir?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Simple Base64 conversion
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              const result = event.target.result as string;
              // Extract raw base64 and mime type
              const base64Data = result.split(',')[1];
              
              // Robust MIME type detection: Fallback to extraction from data URL if file.type is empty
              let mimeType = file.type;
              if (!mimeType && result.includes(':') && result.includes(';')) {
                mimeType = result.split(':')[1].split(';')[0];
              }
              // Final fallback
              if (!mimeType) mimeType = 'image/jpeg';
              
              newAttachments.push({
                file,
                preview: result, // Full data URL for UI display
                base64Data,      // Raw base64 for API
                mimeType: mimeType
              });
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    
    const currentInput = input;
    const currentAttachments = [...attachments];
    
    // UI Update immediately
    const userMessage: Message = { 
        role: 'user', 
        text: currentInput,
        images: currentAttachments.map(a => a.preview)
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key Faltante");

        const ai = new GoogleGenAI({ apiKey });

        // Prepare contents for Gemini (Multimodal)
        const parts: any[] = [];
        
        // Add images first
        currentAttachments.forEach(att => {
            parts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: att.base64Data
                }
            });
        });

        // Add text prompt
        if (currentInput) {
            parts.push({ text: currentInput });
        } else if (currentAttachments.length > 0) {
            // If only images sent, provide a default context prompt
            parts.push({ text: "Analiza esta imagen y describe detalles relevantes para inteligencia forense." });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Supports multimodal
            contents: { parts },
            config: {
                systemInstruction: "Eres un asistente avanzado de análisis de inteligencia para una unidad de ciberseguridad y forense digital. Si recibes imágenes, analiza objetos, textos, ubicaciones y anomalías. Sé conciso, táctico y básate en datos. Responde en español."
            }
        });
        
        const text = response.text || "No se recibió respuesta.";
        setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'model', text: "Error de Conexión: No se pudo procesar la solicitud o analizar los archivos adjuntos." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-panel border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-black/40 p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-white font-bold tracking-wide">ANALISTA IA</h3>
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-gray-500 font-mono">EN LÍNEA // MULTIMODAL</span>
                    </div>
                </div>
            </div>
            {!process.env.API_KEY && (
                <div className="flex items-center text-orange-500 text-xs font-mono bg-orange-500/10 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    SIN API KEY
                </div>
            )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    
                    {/* Render Images if present */}
                    {msg.images && msg.images.length > 0 && (
                        <div className={`flex flex-wrap gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.images.map((img, i) => (
                                <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-700">
                                    <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-accent/20 text-white border border-accent/30 rounded-tr-none' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none font-mono whitespace-pre-wrap'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="flex justify-start">
                    <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-700 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-gray-800">
            {/* Attachment Previews */}
            {attachments.length > 0 && (
                <div className="flex space-x-3 mb-3 overflow-x-auto pb-2">
                    {attachments.map((att, idx) => (
                        <div key={idx} className="relative w-16 h-16 group flex-shrink-0">
                            <img src={att.preview} className="w-full h-full object-cover rounded border border-accent/50" />
                            <button 
                                onClick={() => removeAttachment(idx)}
                                className="absolute -top-2 -right-2 bg-black border border-gray-600 rounded-full p-0.5 text-gray-400 hover:text-danger"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative flex items-center space-x-2">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-accent transition-colors border border-gray-700"
                    title="Adjuntar Imagen"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={attachments.length > 0 ? "Añadir contexto a la imagen..." : "Escribe consulta para análisis..."}
                    className="flex-1 bg-black/50 border border-gray-700 rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-accent font-mono transition-colors"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input && attachments.length === 0}
                    className="p-3 bg-accent hover:bg-sky-400 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-black transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AIChat;