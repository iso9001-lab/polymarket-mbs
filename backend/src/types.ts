export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export interface Market {
  id: string;
  title: string;
  description?: string;
  qYes: number;
  qNo: number;
  b: number;
}

export interface Trade {
  id: string;
  marketId: string;
  userId?: string;
  deltaYes: number;
  cost: number;
  timestamp: number;
}
