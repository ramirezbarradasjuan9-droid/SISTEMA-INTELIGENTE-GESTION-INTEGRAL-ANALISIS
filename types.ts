export interface Coordinate {
  lat: number;
  lng: number;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Device {
  id: string;
  type: string;
  model: string;
  imei: string;
  status: 'active' | 'inactive' | 'seized';
}

export interface Evidence {
  id: string;
  filename: string;
  type: 'image' | 'document' | 'log';
  uploadedAt: string;
  gps?: Coordinate;
  description?: string;
  url: string;
}

export interface CallLog {
  id: string;
  timestamp: string;
  duration: number; // seconds
  direction: 'inbound' | 'outbound';
  cellTowerId: string;
  gpsEstimate: Coordinate;
}

export interface Target {
  id: string;
  codeName: string;
  fullName: string;
  riskLevel: RiskLevel;
  status: 'active' | 'closed' | 'archived';
  avatarUrl: string;
  devices: Device[];
  evidence: Evidence[];
  callLogs: CallLog[];
  notes: string;
  lastKnownLocation?: Coordinate;
}

export interface DashboardStats {
  activeCases: number;
  totalEvidence: number;
  highRiskTargets: number;
  interceptedCalls: number;
}