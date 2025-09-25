export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  /** The price for the given quantity (e.g., price for a 500ml pouch) */
  price: number;
  /** The quantity of the product package (e.g., 500) */
  quantity: number;
  /** The unit for the quantity (e.g., ml) */
  unit: Unit;
  photo?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: Unit;
  price: number;
  total: number;
}

export interface DailyOrder {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  status: 'pending' | 'delivered';
  createdAt: string;
}

export type Unit = 'ml' | 'L' | 'gm' | 'kg' | 'piece';
