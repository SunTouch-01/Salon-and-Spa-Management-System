import { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import ResizableTh from '../ResizableTh';
import { FaEdit, FaFilter } from 'react-icons/fa';

const RevenueTable = ({ stylists, onEditSalary }) => {
    const { selectedSalon } = useSalon();
    const [expenses, setExpenses] = useState([]);
    const [duration, setDuration] = useState('month'); // week, month, year
    const [loading, setLoading] = useState(false);
    const [totalExpenses, setTotalExpenses] = useState(0);

    // Fetch expenses based on duration
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                let url = `http://localhost:5050/expenses/by-duration?duration=${duration}`;
                if (selectedSalon) {
                    url += `&salonId=${selectedSalon._id}`;
                }

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setExpenses(data.expenses || []);
                    setTotalExpenses(data.total || 0);
                }
            } catch (error) {
                console.error('Error fetching expenses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [duration, selectedSalon]);

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

    const getDurationLabel = () => {
        switch (duration) {
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            default: return 'This Month';
        }
    };

    // If stylists prop is provided, show original stylist table
    if (stylists && stylists.length > 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <h2 className="p-6 text-xl font-bold text-gray-900 border-b border-gray-100">Stylist List</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-sm font-semibold text-gray-500 uppercase">
                                <ResizableTh className="p-4 border-b border-gray-100">Sr No</ResizableTh>
                                <ResizableTh className="p-4 border-b border-gray-100">Name</ResizableTh>
                                <ResizableTh className="p-4 border-b border-gray-100">Status</ResizableTh>
                                <ResizableTh className="p-4 border-b border-gray-100">Appointments</ResizableTh>
                                <ResizableTh className="p-4 border-b border-gray-100">Annual Salary</ResizableTh>
                                <ResizableTh className="p-4 border-b border-gray-100 text-center">Actions</ResizableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stylists.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Nothing to see here
                                    </td>
                                </tr>
                            ) : (
                                stylists.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-700">{d.id}</td>
                                        <td className="p-4 font-medium text-gray-900">{d.name}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
                    ${d.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                d.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">{d.cases}</td>
                                        <td className="p-4 text-gray-700 font-mono">{d.salary}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => onEditSalary && onEditSalary(d)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Edit Salary"
                                                >
                                                    <FaEdit />
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
        );
    }

    // Show Expenses Table with Duration Filter
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Expenses Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Total: ₹{totalExpenses.toLocaleString()} ({getDurationLabel()})</p>
                </div>
                <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-400" />
                    <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm font-medium"
                    >
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="year">Annually</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 text-sm font-semibold text-gray-500 uppercase">
                            <ResizableTh className="p-4 border-b border-gray-100">Date</ResizableTh>
                            <ResizableTh className="p-4 border-b border-gray-100">Description</ResizableTh>
                            <ResizableTh className="p-4 border-b border-gray-100">Category</ResizableTh>
                            <ResizableTh className="p-4 border-b border-gray-100">Payment Mode</ResizableTh>
                            <ResizableTh className="p-4 border-b border-gray-100 text-right">Amount</ResizableTh>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    Loading expenses...
                                </td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    No expenses found for {getDurationLabel().toLowerCase()}
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-700">
                                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="p-4">
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700">{expense.paymentMode}</td>
                                    <td className="p-4 text-right font-bold text-red-600">
                                        -₹{expense.amount?.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueTable;
