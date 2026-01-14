export interface InvestmentProduct {
    id: number;
    product_code: string;
    name: string;
    interest_rate: number;
    policy_term: string; // or duration_months
    duration_months: number;
    min_amount: number;
    max_amount: number;
    age_limited: number;
}

export interface InvestmentFormData {
    product_id: string;
    customer_id: string;
    center_id: string;
    group_id: string;
    amount: string;
    nominees: Nominee[];
}

export interface Nominee {
    name: string;
    nic: string;
    relationship: string;
}
