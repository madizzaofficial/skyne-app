export interface RoutineItem {
  productId: string;
  moment: "matin" | "soir";
  order: number;
  done: boolean;
}

export interface ScanHistoryItem {
  productId: string;
  scannedAt: string;
}
