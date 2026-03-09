import { useState, useMemo } from 'react';
import ResizableTh from '../ResizableTh';
import { FaEdit, FaTrash, FaCheck, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const AppointmentsTable = ({ appointments, onEdit, onDelete, onMarkComplete }) => {
    const [sortOrder, setSortOrder] = useState('latest');

    // Sort appointments based on sort order
    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            // Parse dates for sorting - handle both string and Date formats
            // The date could be a locale string or ISO string
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (sortOrder === 'latest') {
                return dateB.getTime() - dateA.getTime();
            } else {
                return dateA.getTime() - dateB.getTime();
            }
        });
    }, [appointments, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest');
    };

    // Helper to get badge color for category
    const getCategoryBadge = (category) => {
        if (category === 'walk-in') {
            return 'bg-orange-100 text-orange-700';
        }
        return 'bg-blue-100 text-blue-700'; // online
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            <ResizableTh className="p-4">Client</ResizableTh>
                            <ResizableTh className="p-4">Contact</ResizableTh>
                            <ResizableTh className="p-4">Staff</ResizableTh>
                            <ResizableTh className="p-4">
                                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={toggleSortOrder}>
                                    <span>Date</span>
                                    <span className="text-primary">
                                        {sortOrder === 'latest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                    </span>
                                </div>
                            </ResizableTh>
                            <ResizableTh className="p-4">Service Type</ResizableTh>
                            <ResizableTh className="p-4">Category</ResizableTh>
                            <ResizableTh className="p-4">Price</ResizableTh>
                            <ResizableTh className="p-4">Note</ResizableTh>
                            <ResizableTh className="p-4 text-center">Actions</ResizableTh>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Nothing to see here
                                </td>
                            </tr>
                        ) : (
                            sortedAppointments.map((appointment) => (

                                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{appointment.name}</td>
                                    <td className="p-4 text-gray-600">{appointment.mobile}</td>
                                    <td className="p-4 text-gray-600">{appointment.staff}</td>
                                    <td className="p-4 text-gray-600">{appointment.date}</td>
                                    <td className="p-4 text-gray-600">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                                            {appointment.serviceType}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(appointment.category)}`}>
                                            {appointment.category === 'walk-in' ? 'Walk-in' : 'Online'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-semibold">₹{appointment.price}</td>
                                    <td className="p-4 text-gray-500 italic max-w-xs truncate" title={appointment.note}>
                                        {appointment.note || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            {appointment.status !== 'completed' && onMarkComplete && (
                                                <button
                                                    onClick={() => onMarkComplete(appointment.id)}
                                                    className="text-green-500 hover:text-green-700 transition-colors"
                                                    title="Mark as Complete"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEdit(appointment)}
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDelete(appointment.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete"
                                            >
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
    );
};

export default AppointmentsTable;
