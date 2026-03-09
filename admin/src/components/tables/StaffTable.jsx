import ResizableTh from '../ResizableTh';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StaffTable = ({ staffList, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Sr.No</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">ID</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Profession</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Contact</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Salary</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</ResizableTh>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {staffList.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-8 text-center text-gray-500">
                                    Nothing to see here
                                </td>
                            </tr>
                        ) : (
                            staffList.map((staff, index) => (
                                <tr
                                    key={staff._id || staff.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4 text-gray-700 font-mono text-sm">
                                        {index + 1}
                                    </td>
                                    <td className="p-4 text-gray-700 font-mono text-sm hidden md:table-cell">
                                        {staff._id?.substring(20) || staff.id}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {staff.name}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize
                      ${staff.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                    staff.role === 'receptionist' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            {staff.profession}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {!staff.isActive && (
                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                                    Inactive
                                                </span>
                                            )}
                                            {staff.onLeave && (
                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                                    On Leave
                                                </span>
                                            )}
                                            {staff.isActive && !staff.onLeave && (
                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-700 text-sm hidden md:table-cell">
                                        {staff.mobile || staff.contact}
                                    </td>
                                    <td className="p-4 text-gray-700 text-sm hidden md:table-cell">
                                        {staff.email}
                                    </td>
                                    <td className="p-4 text-sm font-semibold text-gray-900">
                                        ₹{staff.salary || 0}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => onEdit(staff)}
                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onDelete(staff._id)}
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

export default StaffTable;
