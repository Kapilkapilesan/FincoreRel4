import React from 'react';
import { BadgeDollarSign, User, Calendar, Tag, Clock, ArrowUpRight } from 'lucide-react';

interface CustomerInvestment {
    id: number;
    transaction_id: string;
    amount: number | string;
    interest: number | string;
    policy_term: string;
    customer?: {
        full_name: string;
        customer_code: string;
    };
    product?: {
        name: string;
        product_code: string;
        interest_payout_frequency?: string;
    };
    time_stamp: string;
}

export function CustomerInvestmentsTable({ records }: { records: CustomerInvestment[] }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <BadgeDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customer Investment Accounts</h3>
                            <p className="text-xs text-gray-500 font-medium">List of all active customer investment subscriptions</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold uppercase tracking-wider">
                        {records.length} Active Accounts
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment Info</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Details</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Scheme</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invested Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {records.length > 0 ? records.map((record) => (
                            <tr key={record.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md inline-block self-start">
                                            {record.transaction_id}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-gray-400 uppercase">
                                            <Tag className="w-3 h-3" />
                                            Cert Issued
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center font-black text-gray-600 dark:text-gray-300 shadow-sm border border-white dark:border-gray-600">
                                            {record.customer?.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 transition-colors">
                                                {record.customer?.full_name || 'N/A'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Code: {record.customer?.customer_code}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                                                {record.product?.product_code || 'FD-001'}
                                            </span>
                                            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{record.product?.name || 'Fixed Deposit'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {record.interest}% Rate
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                <Clock className="w-3 h-3" />
                                                {record.policy_term} Months
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {record.product?.interest_payout_frequency || 'Maturity'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-base font-black text-gray-900 dark:text-gray-100">
                                            LKR {Number(record.amount).toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Principal Amount</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-xs font-bold">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            {new Date(record.time_stamp).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 pl-5">
                                            {new Date(record.time_stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <BadgeDollarSign className="w-12 h-12 opacity-20" />
                                        <p className="font-bold text-sm">No investment records found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
