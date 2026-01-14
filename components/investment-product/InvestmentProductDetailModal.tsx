'use client';

import React from 'react';
import {
    X,
    Calculator,
    ShieldCheck,
    Clock,
    Wallet,
    BarChart3,
    Tag,
    AlertCircle,
    TrendingUp,
    UserCheck,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { InvestmentProduct } from '../../types/investment-product.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: InvestmentProduct | null;
}

export function InvestmentProductDetailModal({ isOpen, onClose, product }: Props) {
    if (!isOpen || !product) return null;

    const detailRows = [
        { label: 'Minimum Age', value: `${product.age_limited || 18}+ Years`, icon: UserCheck },
        { label: 'Payout Frequency', value: product.interest_payout_frequency, icon: BarChart3, highlight: true },
        { label: 'Early Withdrawal', value: `${product.early_withdrawal_penalty}% Penalty`, icon: AlertCircle, color: 'text-red-500' },
        { label: 'Date Created', value: product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A', icon: Calendar },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                {/* Header Section */}
                <div className="relative p-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-black tracking-widest uppercase font-mono">
                            {product.product_code}
                        </span>
                        <div className="h-1 w-1 bg-white/30 rounded-full" />
                        <span className="text-blue-100 text-xs font-bold uppercase tracking-wider">Product Specifications</span>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {product.name}
                    </h2>

                    <div className="flex items-center gap-2 text-blue-100/80">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Verify official product parameters below</span>
                    </div>
                </div>

                {/* Main Stats Row */}
                <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                    <div className="bg-white p-6 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Annual Yield</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-green-600">{Number(product.interest_rate)}</span>
                            <span className="text-lg font-black text-green-600">%</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Term</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-indigo-600">{product.duration_months}</span>
                            <span className="text-sm font-black text-indigo-600 uppercase">Mo</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Limits section */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Investment Limits</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Minimum</p>
                                <p className="text-lg font-black text-gray-900">LKR {Number(product.min_amount).toLocaleString()}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300" />
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Maximum</p>
                                <p className="text-lg font-black text-gray-900">LKR {Number(product.max_amount).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details Grid */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        {detailRows.map((row, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className={`p-2 rounded-lg bg-gray-50 flex-shrink-0`}>
                                    <row.icon className={`w-4 h-4 ${row.color || 'text-gray-500'}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{row.label}</p>
                                    <p className={`text-sm font-black truncate capitalize ${row.highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
                                        {row.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Advice */}
                <div className="p-6 bg-indigo-50/50 border-t border-indigo-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-[11px] font-bold text-indigo-700 leading-tight">
                        This configured product governs the interest calculation for all active accounts under this scheme.
                    </p>
                </div>
            </div>
        </div>
    );
}
