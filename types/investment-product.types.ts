export interface InvestmentProduct {
    id: number;
    product_code: string;
    name: string;
    interest_rate: number;
    age_limited: number;
    duration_months: number;
    min_amount: number;
    max_amount: number;
    interest_payout_frequency: 'monthly' | 'quarterly' | 'maturity';
    
    early_withdrawal_penalty: number;
    created_at?: string;
    updated_at?: string;
}

export interface InvestmentProductFormData {
    product_code: string;
    name: string;
    interest_rate: number;
    age_limited: number;
    duration_months: number;
    min_amount: number;
    max_amount: number;
    interest_payout_frequency: 'monthly' | 'quarterly' | 'maturity';
    early_withdrawal_penalty: number;
}
