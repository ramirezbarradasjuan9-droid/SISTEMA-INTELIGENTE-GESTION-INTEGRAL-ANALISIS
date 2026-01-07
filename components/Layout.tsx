import React from 'react';
import { LayoutDashboard, Users, Map, FileText, Bot, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tablero' },
    { id: 'targets', icon: Users, label: 'Objetivos' },
    { id: 'map', icon: Map, label: 'Mapa Ops' },
    { id: 'evidence', icon: FileText, label: 'Evidencia' },
    { id: 'ai', icon: Bot, label: 'Analista IA' },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-gray-200 overflow-hidden font-sans selection:bg-accent/30 selection:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-panel border-r border-gray-800 flex flex-col justify-between shrink-0 z-50">
        <div>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-black/20">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse mr-3"></div>
                <span className="font-mono text-xl font-bold tracking-widest text-white">SIGG<span className="text-accent">.OS</span></span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 px-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive 
                                ? 'bg-accent/10 text-white border-l-2 border-accent' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'group-hover:text-accent transition-colors'}`} />
                            <span className="font-medium tracking-wide text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-gray-800">
            <button className="flex items-center space-x-3 text-gray-500 hover:text-white w-full px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm">
                <Settings className="w-4 h-4" />
                <span>Config Sistema</span>
            </button>
             <button className="flex items-center space-x-3 text-gray-500 hover:text-danger w-full px-4 py-2 mt-1 hover:bg-white/5 rounded-lg transition-colors text-sm">
                <LogOut className="w-4 h-4" />
                <span>Bloqueo Seguro</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-panel/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
                <span className="text-accent">CONECTADO</span>
                <span>//</span>
                <span>ENCRIPTADO: AES-256</span>
                <span>//</span>
                <span>LATENCIA: 12ms</span>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <div className="text-xs text-gray-400">OPERADOR</div>
                    <div className="text-sm font-bold text-white">ADMIN_01</div>
                </div>
                <div className="w-10 h-10 rounded bg-gray-700 border border-gray-600 overflow-hidden">
                    <img src="https://picsum.photos/100/100?grayscale" alt="Admin" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-6 relative">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(#2D9CDB 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;