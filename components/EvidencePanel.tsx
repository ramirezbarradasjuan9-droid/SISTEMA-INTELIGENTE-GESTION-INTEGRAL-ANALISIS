import React, { useState, useRef } from 'react';
import { Evidence, Target } from '../types';
import { Upload, FileImage, MapPin, Search } from 'lucide-react';
import { analyzeEvidenceImage } from '../services/geminiService';

interface EvidencePanelProps {
  targets: Target[];
  onAddEvidence: (targetId: string, evidence: Evidence) => void;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ targets, onAddEvidence }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targets[0]?.id || '');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setAnalyzing(true);
    
    // Simulate reading file and extracting mock EXIF
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Mock Geo-Intelligence Extraction
        const mockLat = 48.8566 + (Math.random() - 0.5) * 0.1;
        const mockLng = 2.3522 + (Math.random() - 0.5) * 0.1;
        
        // Optional: Call Gemini to analyze the image content
        let analysis = "Metadatos extraídos automáticamente.";
        if (process.env.API_KEY) {
             const base64Data = base64.split(',')[1];
             
             // Robust MIME detection
             let mimeType = file.type;
             if (!mimeType && base64.includes(':') && base64.includes(';')) {
                mimeType = base64.split(':')[1].split(';')[0];
             }
             
             analysis = await analyzeEvidenceImage(base64Data, mimeType || 'image/jpeg', "Investigación de Caso Forense");
        }

        const newEvidence: Evidence = {
            id: `ev-${Date.now()}`,
            filename: file.name,
            type: 'image',
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file), // For preview
            gps: { lat: mockLat, lng: mockLng },
            description: analysis
        };

        onAddEvidence(selectedTargetId, newEvidence);
        setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
       <div className="flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-widest">ALMACÉN DE EVIDENCIA</h2>
                <p className="text-gray-500 text-sm font-mono mt-1">REPOSITORIO DE ACTIVOS DIGITALES SEGUROS</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-panel border border-gray-700 rounded px-3 py-1">
                <span className="text-xs text-gray-400">VINCULAR A:</span>
                <select 
                    value={selectedTargetId} 
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="bg-transparent text-accent text-sm font-mono focus:outline-none"
                >
                    {targets.map(t => (
                        <option key={t.id} value={t.id}>{t.codeName}</option>
                    ))}
                </select>
            </div>
       </div>

       {/* Drag & Drop Zone */}
       <div 
         className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-accent bg-accent/5' : 'border-gray-700 bg-panel/50 hover:border-gray-500'}`}
         onDragEnter={handleDrag} 
         onDragLeave={handleDrag} 
         onDragOver={handleDrag} 
         onDrop={handleDrop}
         onClick={() => fileInputRef.current?.click()}
       >
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
            
            {analyzing ? (
                <div className="text-center space-y-3">
                     <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                     <p className="text-accent font-mono animate-pulse">EXTRAYENDO METADATOS EXIF...</p>
                </div>
            ) : (
                <>
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-white font-medium">Arrastra archivos de evidencia aquí</p>
                    <p className="text-gray-500 text-sm mt-2">Soporta JPG, PNG con datos EXIF</p>
                    <button className="mt-4 px-4 py-2 bg-accent hover:bg-sky-400 text-black font-bold text-sm rounded transition-colors">
                        EXAMINAR ARCHIVOS
                    </button>
                </>
            )}
       </div>

       {/* Gallery */}
       <div className="flex-1 overflow-y-auto">
            <h3 className="text-gray-400 text-xs font-mono mb-4 uppercase border-b border-gray-800 pb-2">Subidas Recientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {targets.flatMap(t => t.evidence.map(e => ({...e, targetName: t.codeName}))).map((item) => (
                    <div key={item.id} className="bg-panel border border-gray-800 rounded-lg overflow-hidden group hover:border-accent/50 transition-colors">
                        <div className="h-40 bg-black relative overflow-hidden">
                            <img src={item.url} alt={item.filename} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                <span className="text-xs text-white font-mono">{item.filename}</span>
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                                <span className="text-accent">{item.targetName}</span>
                            </div>
                            {item.gps && (
                                <div className="flex items-center text-[10px] text-data font-mono bg-green-900/10 p-1 rounded">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {item.gps.lat.toFixed(6)}, {item.gps.lng.toFixed(6)}
                                </div>
                            )}
                            <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};

export default EvidencePanel;