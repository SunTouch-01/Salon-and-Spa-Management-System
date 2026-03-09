import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSearch, FaReceipt, FaArrowUp, FaArrowDown, FaTimes, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { useSalon } from '../../context/SalonContext';

const DEFAULT_CATEGORIES = ['Products', 'Utilities', 'Rent', 'Salaries', 'Maintenance', 'Marketing', 'Equipment', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

export default function Expenses() {
    const { selectedSalon } = useSalon();
    const categoriesRef = useRef(null);
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({ thisMonth: 0, lastMonth: 0, categoryBreakdown: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [newCategory, setNewCategory] = useState('');
    const [formData, setFormData] = useState({
        category: 'Other',
        description: '',
        amount: 0,
        paymentMode: 'Cash',
        date: new Date().toISOString().split('T')[0]
    });


    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = selectedSalon
                ? `http://localhost:5050/expenses?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/expenses';
            if (categoryFilter !== 'All') {
                url += `&category=${encodeURIComponent(categoryFilter)}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = selectedSalon
                ? `http://localhost:5050/expenses/stats?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/expenses/stats';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats({
                    thisMonth: data.thisMonth || 0,
                    lastMonth: data.lastMonth || 0,
                    categoryBreakdown: data.categoryBreakdown || []
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };


    useEffect(() => {
        fetchExpenses();
        fetchStats();
        fetchCategories();
    }, [selectedSalon, categoryFilter]);

    // Refresh stats when expenses change
    useEffect(() => {
        fetchStats();
    }, [expenses.length]);



    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = selectedSalon
                ? `http://localhost:5050/categories?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/categories';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const categoryNames = data.map(cat => cat.name);
                // Merge default categories with fetched ones, removing duplicates
                const mergedCategories = [...new Set([...DEFAULT_CATEGORIES, ...categoryNames])];
                setCategories(mergedCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        if (!selectedSalon) {
            alert('Please select a salon first');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5050/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    salonId: selectedSalon._id,
                    name: newCategory.trim()
                })
            });

            if (response.ok) {
                const savedCategory = await response.json();
                setCategories(prev => [...new Set([...prev, savedCategory.name])]);
                setFormData(prev => ({ ...prev, category: savedCategory.name }));
                setNewCategory('');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category');
        }
    };

    const handleWheel = (e) => {
        if (categoriesRef.current) {
            e.preventDefault();
            categoriesRef.current.scrollLeft += e.deltaY;
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                salonId: selectedSalon?._id
            };

            const method = editingExpense ? 'PUT' : 'POST';
            const url = editingExpense
                ? `http://localhost:5050/expenses/${editingExpense._id}`
                : 'http://localhost:5050/expenses';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchExpenses();
                fetchStats();
                closeModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Error saving expense');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            category: expense.category || 'Other',
            description: expense.description || '',
            amount: expense.amount || 0,
            paymentMode: expense.paymentMode || 'Cash',
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchExpenses();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingExpense(null);
        setFormData({
            category: 'Other',
            description: '',
            amount: 0,
            paymentMode: 'Cash',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const getPercentageChange = () => {
        if (stats.lastMonth === 0) return stats.thisMonth > 0 ? 100 : 0;
        return ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1);
    };

    const filteredExpenses = expenses.filter(expense =>
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryColor = (category) => {
        const colors = {
            'Products': 'bg-blue-100 text-blue-700',
            'Utilities': 'bg-yellow-100 text-yellow-700',
            'Rent': 'bg-purple-100 text-purple-700',
            'Salaries': 'bg-green-100 text-green-700',
            'Maintenance': 'bg-orange-100 text-orange-700',
            'Marketing': 'bg-pink-100 text-pink-700',
            'Equipment': 'bg-indigo-100 text-indigo-700',
            'Other': 'bg-gray-100 text-gray-700'
        };
        return colors[category] || colors['Other'];
    };

    return (
        <div className="min-h-screen bg-bg-light">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
                    <p className="text-gray-500 mt-2">Track and manage salon expenses for {selectedSalon?.name || 'All Branches'}.</p>
                </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                    >
                        <FaPlus />
                        Add Expense
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <FaReceipt className="text-red-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">₹{Number(stats.thisMonth).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <FaCalendarAlt className="text-gray-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Month</p>
                                <p className="text-2xl font-bold text-gray-900">₹{Number(stats.lastMonth).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${parseFloat(getPercentageChange()) > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                                {parseFloat(getPercentageChange()) > 0 ? (
                                    <FaArrowUp className="text-red-600 text-xl" />
                                ) : (
                                    <FaArrowDown className="text-green-600 text-xl" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Change</p>
                                <p className={`text-2xl font-bold ${parseFloat(getPercentageChange()) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {getPercentageChange()}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative w-full max-w-xl">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div 
                        ref={categoriesRef}
                        onWheel={handleWheel}
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 cursor-grab active:cursor-grabbing"
                        style={{ scrollbarWidth: 'thin', msOverflowStyle: 'auto' }}
                    >
                        {['All', ...categories].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${categoryFilter === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Payment Mode</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                ) : filteredExpenses.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No expenses found</td></tr>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{expense.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {expense.paymentMode}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-red-600">
                                                -₹{expense.amount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEdit(expense)} className="text-primary hover:text-secondary">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(expense._id)} className="text-red-500 hover:text-red-700">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingExpense ? 'Edit Expense Record' : 'Add New Expense'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingExpense ? 'Update expense category and transaction details.' : 'Record a new transaction for your salon expenses.'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <form id="expense-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer bg-white"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Add New Category</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="Enter new category name"
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={!newCategory.trim()}
                                            className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g., Monthly electricity bill"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₹) *</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                                    <select
                                        name="paymentMode"
                                        value={formData.paymentMode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer bg-white"
                                    >
                                        {PAYMENT_MODES.map(mode => (
                                            <option key={mode} value={mode}>{mode}</option>
                                        ))}
                                    </select>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer - Pinned */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                form="expense-form"
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all shadow-md shadow-primary/20 font-bold active:scale-95"
                            >
                                {editingExpense ? 'Update Record' : 'Record Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
