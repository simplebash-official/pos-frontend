export interface Customer {
  id: string;
  key: string;
  name: string;
  contactPerson?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  tags: string[];
  notes?: string;
  outstandingBalanceCents: number;
  totalPurchasesCents: number;
  createdAt: string;
  updatedAt: string;
  version?: number;
  deletedAt?: string;
  updatedByDevice?: string;
}

export interface CustomerInput {
  name: string;
  primaryPhone: string;
  contactPerson?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  tags?: string[];
  notes?: string;
}

export interface CustomerListParams {
  [key: string]: string | number | undefined;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerTagsResponse {
  tags: string[];
}
