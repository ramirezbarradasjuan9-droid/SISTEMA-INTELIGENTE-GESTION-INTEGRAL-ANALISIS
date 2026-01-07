import { Target, RiskLevel } from './types';

export const MOCK_TARGETS: Target[] = [
  {
    id: 'T-001',
    codeName: 'PHANTOM',
    fullName: 'Alexei Volkov',
    riskLevel: RiskLevel.CRITICAL,
    status: 'active',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    lastKnownLocation: { lat: 48.8566, lng: 2.3522 }, // Paris
    notes: 'Presunto líder del sindicato cibernético "Midnight". Viajes frecuentes entre Europa del Este y Francia. Utiliza teléfonos satelitales encriptados.',
    devices: [
      { id: 'd1', type: 'Smartphone', model: 'iPhone 14 Pro', imei: '354829103847123', status: 'active' },
      { id: 'd2', type: 'Laptop', model: 'ThinkPad X1', imei: 'N/A', status: 'active' }
    ],
    evidence: [
      { id: 'e1', filename: 'reunion_paris.jpg', type: 'image', uploadedAt: '2023-10-15T14:30:00Z', gps: { lat: 48.8566, lng: 2.3522 }, description: 'Foto de vigilancia en Cafe de Flore.', url: 'https://picsum.photos/400/300?random=10' },
    ],
    callLogs: [
      { id: 'c1', timestamp: '2023-10-26T09:00:00Z', duration: 124, direction: 'outbound', cellTowerId: 'PAR-092', gpsEstimate: { lat: 48.8580, lng: 2.3500 } },
      { id: 'c2', timestamp: '2023-10-26T14:15:00Z', duration: 450, direction: 'inbound', cellTowerId: 'PAR-095', gpsEstimate: { lat: 48.8600, lng: 2.3600 } }
    ]
  },
  {
    id: 'T-002',
    codeName: 'VIPER',
    fullName: 'Sarah Chen',
    riskLevel: RiskLevel.HIGH,
    status: 'active',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    lastKnownLocation: { lat: 35.6762, lng: 139.6503 }, // Tokyo
    notes: 'Gestora financiera. Experta en lavado con criptoactivos. Frecuentemente localizada en distritos tecnológicos de alta gama.',
    devices: [
      { id: 'd3', type: 'Tablet', model: 'iPad Pro', imei: '99001234123412', status: 'active' }
    ],
    evidence: [],
    callLogs: []
  },
  {
    id: 'T-003',
    codeName: 'GHOST',
    fullName: 'Sujeto Desconocido',
    riskLevel: RiskLevel.MEDIUM,
    status: 'active',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    lastKnownLocation: { lat: 40.7128, lng: -74.0060 }, // NYC
    notes: 'Mensajero de bajo nivel. Vínculos con Volkov confirmados mediante metadatos interceptados.',
    devices: [],
    evidence: [],
    callLogs: []
  }
];

export const NAV_ITEMS = [
  { label: 'TABLERO', icon: 'LayoutDashboard', id: 'dashboard' },
  { label: 'OBJETIVOS', icon: 'Users', id: 'targets' },
  { label: 'MAPA OPS', icon: 'Map', id: 'map' },
  { label: 'EVIDENCIA', icon: 'FileText', id: 'evidence' },
  { label: 'ANALISTA IA', icon: 'Bot', id: 'ai' },
];