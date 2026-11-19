export type Role = 'ADMIN' | 'STAFF';

export type YardStatus = 'ACTIVE' | 'INACTIVE';

export type RoutingDecision = 'DISMANTLE' | 'KEEP_WHOLE';

export type VehicleStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  canMakeOperations: boolean;
  createdAt: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  role: Role;
  canMakeOperations: boolean;
  password?: string;
}

export interface UserUpdatePayload {
  canMakeOperations?: boolean;
  active?: boolean;
}

export interface Yard {
  id: number;
  yardCode: string;
  name: string;
  country: string;
  city: string;
  address: string;
  status: YardStatus;
  createdAt: string;
  assignedVehicleCount: number;
  activeVehicleCount: number;
}

export interface YardCreatePayload {
  name: string;
  country: string;
  city: string;
  address: string;
}

export interface YardUpdatePayload {
  name: string;
  country: string;
  city: string;
  address: string;
}

export interface Vehicle {
  id: number;
  assetCode: string;
  vin: string;
  make: string;
  model: string;
  manufactureYear: number;
  yardId: number;
  yardName: string;
  yardCode: string;
  routingDecision: RoutingDecision;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
  readOnly: boolean;
}

export interface VehicleCreatePayload {
  vin: string;
  make: string;
  model: string;
  manufactureYear: number;
  yardId: number;
  routingDecision: RoutingDecision;
  notes?: string;
}

export interface VehicleUpdatePayload {
  make: string;
  model: string;
  manufactureYear: number;
  yardId: number;
  routingDecision: RoutingDecision;
  notes?: string;
}

export interface DashboardSummary {
  totalYards: number;
  activeYards: number;
  inactiveYards: number;
  totalVehicles: number;
  vehiclesReceived: number;
  vehiclesInProgress: number;
  vehiclesCompleted: number;
  vehiclesDismantle: number;
  vehiclesKeepWhole: number;
}
