import { API_BASE_URL, getHeaders } from './api.config';
import { InvestmentFormData, InvestmentProduct } from '@/types/investment.types';

export const investmentService = {
    getProducts: async (): Promise<InvestmentProduct[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/investment-products`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch investment products');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching investment products:', error);
            throw error;
        }
    },

    getInvestments: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/investments`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch investments');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching investments:', error);
            throw error;
        }
    },

    createInvestment: async (data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/investments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                const msg = responseData.errors
                    ? Object.values(responseData.errors).flat().join(', ')
                    : (responseData.message || 'Failed to create investment');
                throw new Error(msg);
            }

            return responseData;
        } catch (error) {
            console.error('Error creating investment:', error);
            throw error;
        }
    }
};
