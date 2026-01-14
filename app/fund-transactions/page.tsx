"use client";

import React, { useState } from 'react';
import { FundTruncationStats } from '../../components/fund-transactions/FundTruncationStats';
import { ShareholdersTable } from '../../components/fund-transactions/InvestmentsTable';
import { CustomerInvestmentsTable } from '../../components/fund-transactions/CustomerInvestmentsTable';
import { LoanDisbursementTable } from '../../components/fund-transactions/LoanDisbursementTable';
import { SalaryDisbursementTable } from '../../components/fund-transactions/SalaryDisbursementTable';
import { PayoutModal } from '../../components/fund-transactions/PayoutModal';
import { toast } from 'react-toastify';
import { Calendar } from 'lucide-react';
import { financeService } from '../../services/finance.service';
import { investmentService } from '../../services/investment.service';
import { shareholderService } from '../../services/shareholder.service';

export default function FundTransactionsPage() {
    const [activeTab, setActiveTab] = useState<'shareholders' | 'investments' | 'loans' | 'salaries'>('shareholders');
    const [payoutModal, setPayoutModal] = useState<{
        isOpen: boolean;
        recipientName: string;
        amount: number;
        type: 'loan' | 'salary' | 'bulk-salary';
        bankDetails?: {
            bankName: string;
            accountNumber: string;
        };
        id: string | string[];
    }>({
        isOpen: false,
        recipientName: '',
        amount: 0,
        type: 'loan',
        bankDetails: undefined,
        id: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        total_income: 0,
        total_expense: 0,
        net_flow: 0,
        total_truncation: 0,
        total_shareholder_investment: 0,
        total_customer_investment: 0
    });
    const [shareholders, setShareholders] = useState<any[]>([]);
    const [customerInvestments, setCustomerInvestments] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);

    const fetchShareholders = async () => {
        try {
            const data = await shareholderService.getAll();
            setShareholders(data.shareholders);
        } catch (error) {
            console.error('Failed to fetch shareholders', error);
        }
    };

    const fetchInvestments = async () => {
        try {
            const data = await investmentService.getInvestments();
            setCustomerInvestments(data);
        } catch (error) {
            console.error('Failed to fetch investments', error);
        }
    };

    const fetchLoans = async () => {
        try {
            const data = await financeService.getApprovedLoans();
            setLoans(data);
        } catch (error) {
            toast.error('Failed to fetch loans for disbursement');
        }
    };

    const fetchStats = async () => {
        try {
            const data = await financeService.getBranchTransactions();
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const fetchSalaries = async () => {
        try {
            const data = await financeService.getPendingSalaries();
            setSalaries(data);
        } catch (error) {
            toast.error('Failed to fetch pending salaries');
        }
    };

    React.useEffect(() => {
        fetchShareholders();
        fetchInvestments();
        fetchLoans();
        fetchSalaries();
        fetchStats();
    }, []);

    const handleDisburseClick = (type: 'loan' | 'salary', record: any) => {
        setPayoutModal({
            isOpen: true,
            recipientName: type === 'loan' ? record.customer?.full_name : record.staff?.full_name,
            amount: type === 'loan' ? parseFloat(record.approved_amount) : parseFloat(record.net_payable),
            bankDetails: type === 'loan' && record.borrower_bank_details ? {
                bankName: record.borrower_bank_details.bank_name,
                accountNumber: record.borrower_bank_details.account_number
            } : undefined,
            type,
            id: record.id
        });
    };

    const handleBulkSalaryDisburse = (selectedRecords: any[]) => {
        const totalAmount = selectedRecords.reduce((sum, rec) => sum + parseFloat(rec.net_payable), 0);
        setPayoutModal({
            isOpen: true,
            recipientName: `${selectedRecords.length} Staff Members (Bulk Transfer)`,
            amount: totalAmount,
            type: 'bulk-salary',
            id: selectedRecords.map(r => r.id.toString())
        });
    };

    const handleConfirmPayout = async (refNo: string, remark: string) => {
        setIsLoading(true);
        try {
            if (payoutModal.type === 'loan') {
                await financeService.disburseLoan(Number(payoutModal.id));
                toast.success('Loan disbursed successfully!');
                await fetchLoans();
            } else if (payoutModal.type === 'salary') {
                await financeService.disburseSalary(Number(payoutModal.id));
                toast.success('Salary disbursed successfully!');
                await fetchSalaries();
            } else if (payoutModal.type === 'bulk-salary') {
                const ids = payoutModal.id as string[];
                // Parallel promises for bulk disbursement
                await Promise.all(ids.map(id => financeService.disburseSalary(Number(id))));
                toast.success(`${ids.length} Salaries disbursed successfully!`);
                await fetchSalaries();
            }
            fetchStats();
            setPayoutModal(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
            toast.error(error.message || 'Disbursement failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Fund Truncation</h1>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mt-1">Manage organization investments and loan disbursements</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex bg-gray-50 dark:bg-gray-900 rounded-xl p-1">
                        {['day', 'month', 'year', 'all'].map((period) => (
                            <button
                                key={period}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${period === 'day'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <FundTruncationStats stats={stats} />

            {/* Tabs */}
            <div className="space-y-6">
                <div className="flex gap-12 border-b border-gray-100 dark:border-gray-700 px-4">
                    {[
                        { id: 'shareholders', label: 'Shareholders' },
                        { id: 'investments', label: 'Investments' },
                        { id: 'loans', label: 'Loan Payment Details' },
                        { id: 'salaries', label: 'Salary Payment' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'shareholders' && <ShareholdersTable records={shareholders} />}
                    {activeTab === 'investments' && <CustomerInvestmentsTable records={customerInvestments} />}
                    {activeTab === 'loans' && (
                        <LoanDisbursementTable
                            records={loans}
                            onDisburse={(rec) => handleDisburseClick('loan', rec)}
                        />
                    )}
                    {activeTab === 'salaries' && (
                        <SalaryDisbursementTable
                            records={salaries}
                            onDisburse={(rec) => handleDisburseClick('salary', rec)}
                            onBulkDisburse={handleBulkSalaryDisburse}
                        />
                    )}
                </div>
            </div>

            <PayoutModal
                isOpen={payoutModal.isOpen}
                onClose={() => setPayoutModal(prev => ({ ...prev, isOpen: false }))}
                recipientName={payoutModal.recipientName}
                amount={payoutModal.amount}
                bankDetails={payoutModal.bankDetails}
                onConfirm={handleConfirmPayout}
            />
        </div>
    );
}
