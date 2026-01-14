import { Staff } from './staff.types';
import { Customer } from './customer.types';
import { Loan } from './loan.types';

// Backend Schema matching App\Models\Branch
export interface Branch {
    id: number; // Backend uses auto-increment ID
    branch_id: string; // The specific string ID (e.g. "BR001")
    branch_code?: string; // 2-letter prefix (e.g. "CN")
    branch_name: string;
    location: string;
    address: string | null;
    district?: string;
    province?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    staff_ids: string[] | null;
    created_at?: string;
    updated_at?: string;

    // Laravel withCount fields
    customers_count?: number;
    loans_count?: number;

    // Optional compatibility fields for UI if needed (derived or defaults)
    status: 'active' | 'inactive';
    manager?: string;
    customerCount?: number;
    loanCount?: number;

    // Relations
    staffs?: Staff[];
    customers?: Customer[];
    loans?: Loan[];
}

export interface BranchFormData {
    branch_id?: string;
    branch_code: string; // 2-letter prefix
    branch_name: string;
    location?: string;
    address: string;
    district: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    manager_name: string;
    manager_staff_id?: string;
    staff_ids?: string[];
    status?: 'active' | 'inactive';
}

export interface BranchStats {
    totalBranches: number;
    activeBranches: number;
    totalCustomers: number;
    totalLoans: number;
}

// API Response Wrappers
export interface ApiResponse<T> {
    status: string;
    status_code: number;
    message: string;
    data: T;
    error?: string;
    errors?: Record<string, string[]>;
}

