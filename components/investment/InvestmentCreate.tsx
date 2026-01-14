'use client';

import React, { useState, useEffect } from 'react';
import { User, DollarSign, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { investmentService } from '@/services/investment.service';
import { InvestmentProduct, Nominee } from '@/types/investment.types';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types/customer.types';

export function InvestmentCreate() {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<InvestmentProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [formData, setFormData] = useState({
        product_id: '',
        customer_id: '',
        center_id: '',
        group_id: '',
        amount: '',
        term: '',
        interest_rate: '',
        nominees: [] as Nominee[]
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsRes, customersRes] = await Promise.all([
                    investmentService.getProducts(),
                    customerService.getCustomers({ customer_type: 'Investor' })
                ]);
                setProducts(productsRes);
                setCustomers(customersRes);
            } catch (error) {
                toast.error('Failed to load initial data');
            }
        };
        fetchInitialData();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customer_id: customer.id }));
        setSearchTerm('');
        setIsSearching(false);
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === Number(productId));
        if (product) {
            setFormData(prev => ({
                ...prev,
                product_id: productId,
                interest_rate: product.interest_rate.toString(),
                term: product.duration_months.toString()
            }));
        } else {
            setFormData(prev => ({ ...prev, product_id: productId, interest_rate: '', term: '' }));
        }
    };

    const addNominee = () => {
        setFormData(prev => ({
            ...prev,
            nominees: [...prev.nominees, { name: '', nic: '', relationship: '' }]
        }));
    };

    const removeNominee = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nominees: prev.nominees.filter((_, i) => i !== index)
        }));
    };

    const updateNominee = (index: number, field: keyof Nominee, value: any) => {
        const newNominees = [...formData.nominees];
        newNominees[index] = { ...newNominees[index], [field]: value };
        setFormData(prev => ({ ...prev, nominees: newNominees }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic Validation
        if (!formData.customer_id || !formData.product_id || !formData.amount) {
            toast.error('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        const payload = {
            product_id: formData.product_id,
            customer_id: formData.customer_id,
            amount: formData.amount,
            interest: formData.interest_rate,
            policy_term: formData.term,
            nominees: formData.nominees
        };

        try {
            await investmentService.createInvestment(payload);
            toast.success('Investment created successfully');
            // Reset form
            setFormData({
                product_id: '',
                customer_id: '',
                center_id: '',
                group_id: '',
                amount: '',
                term: '',
                interest_rate: '',
                nominees: []
            });
            setSelectedCustomer(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create investment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Investment</h1>
                    <p className="text-gray-500">Create a new investment record for a customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Investor Selection Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Investor Selection
                    </h2>
                    <div className="space-y-4">
                        {!selectedCustomer ? (
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Investor</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Search by Name or NIC..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsSearching(true);
                                    }}
                                    onFocus={() => setIsSearching(true)}
                                />
                                {isSearching && searchTerm && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b border-gray-100 last:border-0"
                                                    onClick={() => handleCustomerSelect(customer)}
                                                >
                                                    <span className="font-medium text-gray-900">{customer.full_name}</span>
                                                    <span className="text-sm text-gray-500">NIC: {customer.customer_code}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500">No investors found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-blue-900">{selectedCustomer.full_name}</p>
                                    <p className="text-sm text-blue-700">NIC: {selectedCustomer.customer_code}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    title="Change Investor"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Investment Details Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        Investment Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.product_id}
                                onChange={(e) => handleProductChange(e.target.value)}
                            >
                                <option value="">Select Investment Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - {p.age_limited ?? 0}+ Years</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Policy Term (Months)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 outline-none"
                                readOnly
                                value={formData.term}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 outline-none"
                                readOnly
                                value={formData.interest_rate}
                            />
                        </div>
                    </div>
                </div>

                {/* Nominees Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Nominees
                        </h2>
                        <button
                            type="button"
                            onClick={addNominee}
                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4" /> Add Nominee
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.nominees.map((nominee, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={nominee.name}
                                        onChange={(e) => updateNominee(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">NIC</label>
                                    <input
                                        type="text"
                                        placeholder="Enter NIC number"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={nominee.nic}
                                        onChange={(e) => updateNominee(index, 'nic', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Relationship</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={nominee.relationship}
                                            onChange={(e) => updateNominee(index, 'relationship', e.target.value)}
                                        >
                                            <option value="">Select Relationship</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Child">Child</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="pt-5">
                                        <button
                                            type="button"
                                            onClick={() => removeNominee(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Nominee"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {formData.nominees.length === 0 && (
                            <div className="text-center py-6 text-gray-500 text-sm italic">
                                No nominees added yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {isLoading ? 'Creating...' : 'Create Investment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
