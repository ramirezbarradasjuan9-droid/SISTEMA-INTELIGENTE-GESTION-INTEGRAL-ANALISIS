import React from 'react';
import { Target, RiskLevel } from '../types';
import { Shield, Smartphone, Globe, Activity, AlertTriangle, FileText, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TargetDetailProps {
  target: Target;
  onClose: () => void;
  onGenerateReport: (t: Target) => void;
}

const TargetDetail: React.FC<TargetDetailProps> = ({ target, onClose, onGenerateReport }) => {
  const riskColor = target.riskLevel === RiskLevel.CRITICAL ? 'text-danger' : 
                    target.riskLevel === RiskLevel.HIGH ? 'text-orange-500' : 
                    'text-accent';

  const riskLabel: Record<string, string> = {
    LOW: 'BAJO',
    MEDIUM: 'MEDIO',
    HIGH: 'ALTO',
    CRITICAL: 'CRÍTICO'
  };

  const activityData = [
    { name: 'Llamadas', value: target.callLogs.length || 1 },
    { name: 'Ubicaciones', value: 4 }, // Mock
    { name: 'Transferencias', value: 2 }, // Mock
  ];
  const COLORS = ['#2D9CDB', '#00FF41', '#EF4444'];

  return (
    <div className="h-full flex flex-col space-y-4 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img src={target.avatarUrl} alt={target.codeName} className="w-16 h-16 rounded-full border-2 border-accent object-cover opacity-80" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent/20 to-transparent"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-widest">{target.codeName}</h2>
            <div className="flex items-center space-x-2 font-mono text-sm">
                <span className="text-gray-400">ID: {target.id}</span>
                <span className="text-gray-600">|</span>
                <span className={`${riskColor} font-bold flex items-center`}>
                    RIESGO {riskLabel[target.riskLevel] || target.riskLevel} <AlertTriangle className="w-3 h-3 ml-1" />
                </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => onGenerateReport(target)}
                className="px-3 py-1 bg-accent/10 border border-accent/50 text-accent hover:bg-accent/20 rounded font-mono text-xs flex items-center"
            >
                <Activity className="w-3 h-3 mr-2" /> PERFIL IA
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2">
        
        {/* Info Column */}
        <div className="space-y-4">
            <div className="bg-panel border border-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-xs font-mono mb-3 uppercase flex items-center">
                    <Shield className="w-3 h-3 mr-2" /> Datos Biomètricos
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Nombre Completo</span>
                        <span className="text-white font-mono">{target.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Estado</span>
                        <span className="text-data font-mono uppercase">{target.status === 'active' ? 'Activo' : target.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Última Vez</span>
                        <span className="text-accent font-mono">hace 2 hrs</span>
                    </div>
                </div>
            </div>

            <div className="bg-panel border border-gray-800 p-4 rounded-lg">
                <h3 className="text-gray-400 text-xs font-mono mb-3 uppercase flex items-center">
                    <Smartphone className="w-3 h-3 mr-2" /> Dispositivos
                </h3>
                {target.devices.length > 0 ? (
                    target.devices.map(d => (
                        <div key={d.id} className="mb-2 p-2 bg-black/20 rounded border border-gray-800 flex justify-between items-center">
                            <div>
                                <div className="text-white text-xs font-bold">{d.model}</div>
                                <div className="text-gray-500 text-[10px] font-mono">IMEI: {d.imei}</div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${d.status === 'active' ? 'bg-data shadow-[0_0_5px_#00FF41]' : 'bg-gray-600'}`}></div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-600 text-xs italic">Sin dispositivos registrados.</div>
                )}
            </div>
        </div>

        {/* Notes & Map Context Column */}
        <div className="lg:col-span-2 space-y-4">
            <div className="bg-panel border border-gray-800 p-4 rounded-lg min-h-[150px]">
                <h3 className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center">
                    <FileText className="w-3 h-3 mr-2" /> Notas del Caso
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-mono opacity-80">
                    {target.notes}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-panel border border-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center">
                        <Activity className="w-3 h-3 mr-2" /> Mix de Actividad
                    </h3>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={activityData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={25} 
                                    outerRadius={40} 
                                    fill="#8884d8" 
                                    paddingAngle={5} 
                                    dataKey="value" 
                                    stroke="none"
                                >
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-panel border border-gray-800 p-4 rounded-lg">
                     <h3 className="text-gray-400 text-xs font-mono mb-2 uppercase flex items-center">
                        <Globe className="w-3 h-3 mr-2" /> Movimientos Recientes
                    </h3>
                    <div className="space-y-2 text-xs font-mono">
                        {target.callLogs.slice(0, 3).map((log, i) => (
                            <div key={log.id} className="flex justify-between border-b border-gray-800 pb-1">
                                <span className="text-accent">{log.cellTowerId}</span>
                                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString('es-ES')}</span>
                            </div>
                        ))}
                         {target.callLogs.length === 0 && <div className="text-gray-600 italic">Sin datos de movimiento.</div>}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TargetDetail;