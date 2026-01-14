'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, BadgeDollarSign, Download, Plus } from 'lucide-react';
import { CustomerInvestmentsTable } from '../../components/fund-transactions/CustomerInvestmentsTable';
import { investmentService } from '../../services/investment.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

export default function InvestmentsListPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = async () => {
        try {
            setLoading(true);
            const data = await investmentService.getInvestments();
            setInvestments(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvestments = investments.filter(inv =>
        inv.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Investment Accounts</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage and track all customer investment subscriptions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/investments/create')}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Investment</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                            <BadgeDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active Principal</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
                                LKR {investments.reduce((sum, inv) => sum + Number(inv.amount), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Filters and List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Transaction ID, Customer, or Product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-gray-700 dark:text-gray-300 font-medium"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-bold">Loading investment accounts...</p>
                        </div>
                    </div>
                ) : (
                    <CustomerInvestmentsTable records={filteredInvestments} />
                )}
            </div>
            <ToastContainer />
        </div>
    );
}
