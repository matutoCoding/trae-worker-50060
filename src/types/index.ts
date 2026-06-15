export interface Voyage {
  id: string;
  voyageNo: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  targetGround: string;
  plannedDays: number;
  captain: string;
  route: string;
  createdAt: string;
  updatedAt: string;
}

export interface FishingGround {
  id: string;
  voyageId: string;
  name: string;
  longitude: number;
  latitude: number;
  depth: number;
  weather: string;
  seaState: number;
  waterTemp: number;
  recordTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FishingOperation {
  id: string;
  voyageId: string;
  groundId: string;
  netNo: number;
  startTime: string;
  endTime: string;
  trawlDepth: number;
  trawlSpeed: number;
  netType: string;
  crewIds: string[];
  estimatedCatch: number;
  actualCatch: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface CatchRecord {
  id: string;
  voyageId: string;
  operationId: string;
  species: string;
  weight: number;
  quality: 'A' | 'B' | 'C';
  storageLocation: string;
  unitPrice: number;
  recordTime: string;
}

export interface FuelRecord {
  id: string;
  voyageId: string;
  type: 'consumption' | 'refuel';
  amount: number;
  unitPrice: number;
  portId?: string;
  operator: string;
  recordTime: string;
  remark: string;
}

export interface Crew {
  id: string;
  name: string;
  position: string;
  idCard: string;
  phone: string;
  skillLevel: string;
  joinDate: string;
  avatar?: string;
}

export interface CrewSchedule {
  id: string;
  voyageId: string;
  crewId: string;
  date: string;
  shiftType: 'day' | 'night' | 'standby';
  duties: string;
  status: 'scheduled' | 'on_duty' | 'off_duty';
}

export interface SafetyCheck {
  id: string;
  voyageId: string;
  checkType: string;
  checkDate: string;
  result: 'pass' | 'fail' | 'warning';
  issues: string;
  inspector: string;
  remark: string;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  seaState: number;
  visibility: number;
  weatherCondition: string;
}

export interface EmergencyPlan {
  id: string;
  type: string;
  name: string;
  steps: string[];
  contacts: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  position: string;
  phone: string;
  radio?: string;
}

export interface FinanceRecord {
  id: string;
  voyageId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  payer: string;
  receiver: string;
  recordDate: string;
  remark: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  costBreakdown: { category: string; amount: number }[];
}

export interface Port {
  id: string;
  name: string;
  country: string;
  longitude: number;
  latitude: number;
  facilities: string;
}

export interface DashboardStats {
  voyageProgress: number;
  todayCatch: number;
  fuelStock: number;
  crewOnDuty: number;
  totalCrew: number;
  safetyWarnings: number;
  recentOperations: FishingOperation[];
  recentCatch: CatchRecord[];
}
