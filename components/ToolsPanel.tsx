import React, { useState } from 'react';
import { Target } from '../types';
import { Link, Copy, ShieldAlert, Terminal, Activity, Zap, CheckCircle, Lock } from 'lucide-react';

interface ToolsPanelProps {
  targets: Target[];
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ targets }) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerate = () => {
    if (!sourceUrl) return;
    
    setIsGenerating(true);
    setLogs([]);
    setGeneratedLink('');

    addLog("Iniciando secuencia de encapsulamiento...");
    
    setTimeout(() => addLog("Analizando URL de origen..."), 500);
    setTimeout(() => addLog("Inyectando script de telemetría pasiva..."), 1200);
    setTimeout(() => addLog("Ofuscando parámetros de ruta..."), 2000);
    
    setTimeout(() => {
        const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
        const mockLink = `https://s.igg.os/v/${hash}?ref=${selectedTarget || 'anon'}`;
        setGeneratedLink(mockLink);
        addLog("Enlace táctico generado exitosamente.");
        setIsGenerating(false);
    }, 2800);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedLink);
      addLog("Enlace copiado al portapapeles.");
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-widest flex items-center">
            <Terminal className="w-6 h-6 mr-3 text-accent" />
            CAJA DE HERRAMIENTAS
        </h2>
        <p className="text-gray-500 text-sm font-mono mt-1">UTILIDADES DE OPERACIONES DE CAMPO Y CIBERINTELIGENCIA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          
          {/* Main Tool: Link Generator */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-panel border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Link className="w-24 h-24 text-accent" />
                  </div>
                  
                  <div className="relative z-10">
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center">
                          <Zap className="w-4 h-4 text-accent mr-2" />
                          GENERADOR DE ENLACES TÁCTICOS
                      </h3>
                      <p className="text-gray-400 text-xs font-mono mb-6 max-w-md">
                          Encapsula contenido multimedia (videos/imágenes) en un enlace de rastreo geoespacial. 
                          <br/><span className="text-orange-500 flex items-center mt-1"><ShieldAlert className="w-3 h-3 mr-1"/> Requiere interacción del objetivo (Click).</span>
                      </p>

                      <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-xs text-gray-500 font-mono">URL DE ORIGEN (VIDEO/IMAGEN)</label>
                                  <input 
                                      type="text" 
                                      value={sourceUrl}
                                      onChange={(e) => setSourceUrl(e.target.value)}
                                      placeholder="https://youtube.com/watch?v=..."
                                      className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none font-mono"
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-xs text-gray-500 font-mono">ASIGNAR A OBJETIVO (OPCIONAL)</label>
                                  <select 
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none font-mono"
                                  >
                                      <option value="">-- Sin Asignar --</option>
                                      {targets.map(t => (
                                          <option key={t.id} value={t.id}>{t.codeName}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !sourceUrl}
                            className={`w-full py-3 rounded font-bold font-mono text-sm transition-all flex items-center justify-center ${
                                isGenerating 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-accent/10 text-accent border border-accent hover:bg-accent hover:text-black'
                            }`}
                          >
                              {isGenerating ? (
                                  <>
                                    <Activity className="w-4 h-4 mr-2 animate-spin" /> PROCESANDO ENCRIPTACIÓN...
                                  </>
                              ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" /> GENERAR ENLACE SEGURO
                                  </>
                              )}
                          </button>

                          {generatedLink && (
                              <div className="bg-black/60 border border-green-500/30 rounded p-4 animate-in fade-in slide-in-from-top-2">
                                  <label className="text-[10px] text-green-500 font-mono mb-1 block">ENLACE GENERADO:</label>
                                  <div className="flex items-center space-x-2">
                                      <code className="flex-1 bg-black border border-gray-800 p-2 rounded text-green-400 font-mono text-sm break-all">
                                          {generatedLink}
                                      </code>
                                      <button 
                                        onClick={copyToClipboard}
                                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
                                        title="Copiar"
                                      >
                                          <Copy className="w-4 h-4" />
                                      </button>
                                  </div>
                                  <div className="mt-2 flex items-center text-[10px] text-gray-500">
                                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                      Listo para distribución. El enlace expira en 24h.
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Console Output */}
              <div className="bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto custom-scrollbar">
                  <div className="text-gray-500 border-b border-gray-800 pb-2 mb-2">REGISTRO DE SISTEMA</div>
                  {logs.length === 0 && <span className="text-gray-700 italic">Esperando comandos...</span>}
                  {logs.map((log, i) => (
                      <div key={i} className="text-accent/80 mb-1">
                          <span className="text-gray-600 mr-2">{'>'}</span>{log}
                      </div>
                  ))}
              </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-4">
              <div className="bg-panel border border-gray-800 rounded-lg p-4">
                   <h4 className="text-white text-sm font-bold mb-3 flex items-center">
                       <Activity className="w-4 h-4 mr-2 text-data" />
                       ESTADO DE LA RED
                   </h4>
                   <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Nodos Activos</span>
                           <span className="text-white font-mono">1,024</span>
                       </div>
                       <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Ancho de Banda</span>
                           <span className="text-white font-mono">840 Mbps</span>
                       </div>
                       <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Proxy</span>
                           <span className="text-green-500 font-mono">SEGURO (TOR)</span>
                       </div>
                   </div>
              </div>

              <div className="bg-panel border border-gray-800 rounded-lg p-4 opacity-70 pointer-events-none">
                  <h4 className="text-white text-sm font-bold mb-3 text-gray-500">DECODIFICADOR IMEI</h4>
                  <div className="h-20 bg-black/40 rounded border border-gray-800 flex items-center justify-center text-xs text-gray-600">
                      MÓDULO INACTIVO
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default ToolsPanel;