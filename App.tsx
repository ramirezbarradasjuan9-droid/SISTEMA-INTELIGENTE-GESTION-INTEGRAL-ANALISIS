import React, { useState } from 'react';
import Layout from './components/Layout';
import TacticalMap from './components/TacticalMap';
import TargetDetail from './components/TargetDetail';
import EvidencePanel from './components/EvidencePanel';
import AIChat from './components/AIChat';
import { MOCK_TARGETS } from './constants';
import { Target, Evidence } from './types';
import { Users, AlertTriangle, Activity, Database } from 'lucide-react';
import { analyzeTargetProfile } from './services/geminiService';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targets, setTargets] = useState<Target[]>(MOCK_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<{targetId: string, content: string} | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const selectedTarget = targets.find(t => t.id === selectedTargetId);

  const handleAddEvidence = (targetId: string, evidence: Evidence) => {
    setTargets(prev => prev.map(t => {
        if (t.id === targetId) {
            return { ...t, evidence: [...t.evidence, evidence] };
        }
        return t;
    }));
  };

  const handleGenerateReport = async (target: Target) => {
      setReportLoading(true);
      const report = await analyzeTargetProfile(target);
      setAiReport({ targetId: target.id, content: report });
      setReportLoading(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
            <div className="space-y-6">
                 {/* KPI Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-panel border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-xs font-mono uppercase">Casos Activos</div>
                            <div className="text-3xl font-bold text-white mt-1">12</div>
                        </div>
                        <Users className="text-accent w-8 h-8 opacity-50" />
                    </div>
                    <div className="bg-panel border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-xs font-mono uppercase">Alto Riesgo</div>
                            <div className="text-3xl font-bold text-danger mt-1">3</div>
                        </div>
                        <AlertTriangle className="text-danger w-8 h-8 opacity-50" />
                    </div>
                    <div className="bg-panel border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-xs font-mono uppercase">Señales Int</div>
                            <div className="text-3xl font-bold text-data mt-1">842</div>
                        </div>
                        <Activity className="text-data w-8 h-8 opacity-50" />
                    </div>
                     <div className="bg-panel border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-xs font-mono uppercase">Datos</div>
                            <div className="text-3xl font-bold text-white mt-1">4.2 TB</div>
                        </div>
                        <Database className="text-white w-8 h-8 opacity-50" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    <div className="lg:col-span-2 bg-panel border border-gray-800 rounded-lg p-1">
                         <div className="absolute z-10 p-4 pointer-events-none">
                            <h3 className="text-white font-bold tracking-widest text-sm">MAPA DE AMENAZA GLOBAL</h3>
                         </div>
                         <TacticalMap targets={targets} height="h-full" />
                    </div>
                    <div className="bg-panel border border-gray-800 rounded-lg p-4 overflow-hidden flex flex-col">
                        <h3 className="text-gray-400 text-xs font-mono mb-3 uppercase">Alertas Recientes</h3>
                        <div className="space-y-3 overflow-y-auto pr-2">
                             {[1,2,3,4,5].map(i => (
                                 <div key={i} className="flex space-x-3 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer border-l-2 border-transparent hover:border-accent">
                                     <div className="text-[10px] font-mono text-gray-500 pt-1">09:4{i}</div>
                                     <div>
                                         <div className="text-sm text-white font-medium">Señal Interceptada</div>
                                         <div className="text-xs text-gray-400">Sector 4, París. Coincide con firma Phantom.</div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                 </div>
            </div>
        );
      case 'targets':
        return (
             <div className="h-full flex space-x-6">
                {/* Target List */}
                <div className={`w-1/3 flex flex-col space-y-4 ${selectedTarget ? 'hidden md:flex' : 'flex'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold text-white tracking-widest">OBJETIVOS</h2>
                        <span className="text-xs font-mono text-gray-500">{targets.length} ACTIVOS</span>
                     </div>
                     <div className="space-y-2 overflow-y-auto pr-2">
                        {targets.map(target => (
                            <div 
                                key={target.id}
                                onClick={() => setSelectedTargetId(target.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                    selectedTargetId === target.id 
                                    ? 'bg-accent/10 border-accent' 
                                    : 'bg-panel border-gray-800 hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${target.riskLevel === 'CRITICAL' ? 'bg-danger' : 'bg-accent'}`}></div>
                                    <div>
                                        <div className="font-bold text-white tracking-wide">{target.codeName}</div>
                                        <div className="text-xs text-gray-400 font-mono">{target.fullName}</div>
                                    </div>
                                    <div className="ml-auto text-xs font-mono text-gray-600 uppercase">{target.status === 'active' ? 'Activo' : target.status}</div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Target Detail */}
                <div className={`flex-1 bg-panel/50 border border-gray-800 rounded-xl p-6 ${selectedTarget ? 'block' : 'hidden md:block'}`}>
                     {selectedTarget ? (
                         <div className="h-full relative">
                             <TargetDetail 
                                target={selectedTarget} 
                                onClose={() => setSelectedTargetId(null)}
                                onGenerateReport={handleGenerateReport}
                            />
                            {/* AI Report Modal Overlay */}
                            {aiReport && aiReport.targetId === selectedTarget.id && (
                                <div className="absolute inset-0 bg-black/90 z-20 p-8 rounded-lg animate-in fade-in overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
                                        <h3 className="text-accent font-mono text-lg flex items-center"><Activity className="mr-2" /> REPORTE FORENSE IA</h3>
                                        <button onClick={() => setAiReport(null)} className="text-gray-400 hover:text-white">CERRAR</button>
                                    </div>
                                    <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {aiReport.content}
                                    </div>
                                </div>
                            )}
                            {reportLoading && (
                                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                                    <div className="text-accent font-mono animate-pulse">GENERANDO INFORME DE INTELIGENCIA...</div>
                                </div>
                            )}
                         </div>
                     ) : (
                         <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm">
                             SELECCIONA UN OBJETIVO PARA VER PERFIL
                         </div>
                     )}
                </div>
             </div>
        );
      case 'map':
        return (
            <div className="h-full flex flex-col">
                <div className="mb-4 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white tracking-widest">MAPA TÁCTICO</h2>
                    <div className="font-mono text-xs text-accent">FEED EN VIVO ACTIVO</div>
                </div>
                <div className="flex-1 bg-panel border border-gray-800 rounded-lg overflow-hidden relative">
                     <TacticalMap 
                        targets={targets} 
                        height="h-full" 
                        selectedTargetId={selectedTargetId}
                        onSelectTarget={setSelectedTargetId}
                     />
                </div>
            </div>
        );
      case 'evidence':
        return <EvidencePanel targets={targets} onAddEvidence={handleAddEvidence} />;
      case 'ai':
        return (
            <div className="h-full max-w-4xl mx-auto">
                 <AIChat />
            </div>
        );
      default:
        return <div>Selecciona una pestaña</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;