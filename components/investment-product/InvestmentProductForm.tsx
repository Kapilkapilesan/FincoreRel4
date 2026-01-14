'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Calculator, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InvestmentProduct, InvestmentProductFormData } from '../../types/investment-product.types';
import { investmentProductService } from '../../services/investment-product.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InvestmentProductFormData) => void;
    initialData?: InvestmentProduct | null;
}

interface ValidationErrors {
    [key: string]: string;
}

export function InvestmentProductForm({ isOpen, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState({
        product_code: '',
        name: '',
        interest_rate: '0',
        age_limited: '18',
        duration_months: '12',
        min_amount: '1000',
        max_amount: '1000000',
        interest_payout_frequency: 'maturity' as InvestmentProduct['interest_payout_frequency'],
        early_withdrawal_penalty: '1.00'
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [isLoadingCode, setIsLoadingCode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    product_code: initialData.product_code || '',
                    name: initialData.name || '',
                    interest_rate: String(initialData.interest_rate),
                    age_limited: String(initialData.age_limited),
                    duration_months: String(initialData.duration_months),
                    min_amount: String(initialData.min_amount),
                    max_amount: String(initialData.max_amount),
                    interest_payout_frequency: initialData.interest_payout_frequency,
                    early_withdrawal_penalty: String(initialData.early_withdrawal_penalty)
                });
            } else {
                setFormData({
                    product_code: 'Loading...',
                    name: '',
                    interest_rate: '0',
                    age_limited: '18',
                    duration_months: '12',
                    min_amount: '1000',
                    max_amount: '1000000',
                    interest_payout_frequency: 'maturity',
                    early_withdrawal_penalty: '1.00'
                });

                // Fetch next code
                const fetchNextCode = async () => {
                    setIsLoadingCode(true);
                    try {
                        const code = await investmentProductService.getNextCode();
                        setFormData(prev => ({ ...prev, product_code: code }));
                    } catch (error) {
                        console.error('Error fetching next code:', error);
                        setFormData(prev => ({ ...prev, product_code: '' }));
                    } finally {
                        setIsLoadingCode(false);
                    }
                };
                fetchNextCode();
            }
            setErrors({});
            setTouched({});
        }
    }, [initialData, isOpen]);

    const getFieldError = useCallback((name: string, value: any): string | null => {
        switch (name) {
            case 'product_code':
                if (!value.trim()) return 'Product code is required';
                if (value.trim().length < 2) return 'Product code must be at least 2 characters';
                break;
            case 'name':
                if (!value.trim()) return 'Product name is required';
                if (value.trim().length < 3) return 'Name must be at least 3 characters';
                break;
            case 'interest_rate':
                const rate = parseFloat(value);
                if (isNaN(rate) || rate <= 0) return 'Interest rate must be greater than 0';
                if (rate > 100) return 'Interest rate cannot exceed 100%';
                break;
            case 'age_limited':
                const age = parseInt(value);
                if (isNaN(age) || age < 18) return 'Minimum age must be at least 18';
                break;
            case 'duration_months':
                const duration = parseInt(value);
                if (isNaN(duration) || duration < 1) return 'Term must be at least 1 month';
                break;
            case 'min_amount':
                const minAt = parseFloat(value);
                if (isNaN(minAt) || minAt < 0) return 'Minimum amount cannot be negative';
                break;
            case 'max_amount':
                const maxAt = parseFloat(value);
                const minVal = parseFloat(formData.min_amount);
                if (isNaN(maxAt)) return 'Maximum amount is required';
                if (maxAt <= minVal) return 'Maximum amount must be greater than minimum amount';
                break;
            case 'early_withdrawal_penalty':
                const penalty = parseFloat(value);
                if (isNaN(penalty) || penalty < 0) return 'Penalty cannot be negative';
                if (penalty > 100) return 'Penalty cannot exceed 100%';
                break;
        }
        return null;
    }, [formData.min_amount]);

    const validateField = (name: string, value: any) => {
        const error = getFieldError(name, value);
        setErrors(prev => {
            const next = { ...prev };
            if (error) next[name] = error;
            else delete next[name];
            return next;
        });
        return !error;
    };

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, (formData as any)[name]);
    };

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            validateField(name, value);
        }
        if (name === 'min_amount' && touched.max_amount) {
            validateField('max_amount', formData.max_amount);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = () => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            const error = getFieldError(key, (formData as any)[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

        if (!isValid) return;

        onSave({
            product_code: formData.product_code.trim().toUpperCase(),
            name: formData.name.trim(),
            interest_rate: parseFloat(formData.interest_rate),
            age_limited: parseInt(formData.age_limited),
            duration_months: parseInt(formData.duration_months),
            min_amount: parseFloat(formData.min_amount),
            max_amount: parseFloat(formData.max_amount),
            interest_payout_frequency: formData.interest_payout_frequency,
            early_withdrawal_penalty: parseFloat(formData.early_withdrawal_penalty)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{initialData ? 'Edit' : 'Add'} Investment Product</h2>
                            <p className="text-blue-100 text-sm opacity-90">Configure financial parameters and rules</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    >
                        <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Identification</h3>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Code <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.product_code}
                                    onChange={e => handleInputChange('product_code', e.target.value.toUpperCase())}
                                    onBlur={() => handleBlur('product_code')}
                                    placeholder="e.g. FD12"
                                    readOnly={!initialData}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm font-mono ${!initialData ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                                        } ${touched.product_code && errors.product_code ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                        }`}
                                />
                                {isLoadingCode && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            {!initialData && (
                                <p className="text-[10px] text-blue-600 font-bold mt-1 tracking-tight">AUTO-GENERATED SEQUENCE</p>
                            )}
                            {touched.product_code && errors.product_code && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.product_code}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => handleInputChange('name', e.target.value)}
                                onBlur={() => handleBlur('name')}
                                placeholder="e.g. Fixed Deposit - 12 Months"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.name && errors.name ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {touched.name && errors.name && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Financial Parameters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Financial configuration</h3>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (%) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.interest_rate}
                                    onChange={e => handleInputChange('interest_rate', e.target.value)}
                                    onBlur={() => handleBlur('interest_rate')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.interest_rate && errors.interest_rate ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                        }`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                            </div>
                            {touched.interest_rate && errors.interest_rate && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.interest_rate}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Term (Months) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={formData.duration_months}
                                onChange={e => handleInputChange('duration_months', e.target.value)}
                                onBlur={() => handleBlur('duration_months')}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.duration_months && errors.duration_months ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {touched.duration_months && errors.duration_months && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.duration_months}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Investment (LKR)</label>
                            <input
                                type="number"
                                value={formData.min_amount}
                                onChange={e => handleInputChange('min_amount', e.target.value)}
                                onBlur={() => handleBlur('min_amount')}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.min_amount && errors.min_amount ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {touched.min_amount && errors.min_amount && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.min_amount}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Investment (LKR)</label>
                            <input
                                type="number"
                                value={formData.max_amount}
                                onChange={e => handleInputChange('max_amount', e.target.value)}
                                onBlur={() => handleBlur('max_amount')}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.max_amount && errors.max_amount ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {touched.max_amount && errors.max_amount && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.max_amount}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Eligibility & Payout Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Eligible Age</label>
                            <input
                                type="number"
                                value={formData.age_limited}
                                onChange={e => handleInputChange('age_limited', e.target.value)}
                                onBlur={() => handleBlur('age_limited')}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.age_limited && errors.age_limited ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                    }`}
                            />
                            {touched.age_limited && errors.age_limited && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.age_limited}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Frequency</label>
                            <select
                                value={formData.interest_payout_frequency}
                                onChange={e => handleInputChange('interest_payout_frequency', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm bg-white"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="maturity">On Maturity</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Early Withdrawal Penalty (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.early_withdrawal_penalty}
                                    onChange={e => handleInputChange('early_withdrawal_penalty', e.target.value)}
                                    onBlur={() => handleBlur('early_withdrawal_penalty')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm ${touched.early_withdrawal_penalty && errors.early_withdrawal_penalty ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'
                                        }`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                            </div>
                            {touched.early_withdrawal_penalty && errors.early_withdrawal_penalty && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.early_withdrawal_penalty}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all shadow-sm active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center gap-2"
                    >
                        {initialData ? <Save className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const Save = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);
