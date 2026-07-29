export interface UserSession {
  id: string;
  name: string;
  role: 'admin' | 'cashier' | 'technician';
}
