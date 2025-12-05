export interface Position {
  yesShares: number;
  noShares: number;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  balance: number;
  positions: {
    [marketId: string]: Position;
  };
  isAdmin?: boolean;
}

export interface Market {
  id: string;
  title: string;
  description?: string;
  qYes: number;
  qNo: number;
  b: number;
  status?: 'open' | 'resolved';
  result?: 'YES' | 'NO';
}

export interface Trade {
  id: string;
  marketId: string;
  userId?: string;
  deltaYes: number;
  deltaNo: number;
  cost: number;
  timestamp: number;
}
