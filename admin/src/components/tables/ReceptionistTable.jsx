import ResizableTh from '../ResizableTh';

const ReceptionistTable = ({ appointments, onMarkComplete }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'checked': return 'bg-blue-100 text-blue-700';
            case 'waiting': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'checked': return 'Checked In';
            case 'waiting': return 'Waiting';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</ResizableTh>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name</ResizableTh>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</ResizableTh>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stylist</ResizableTh>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</ResizableTh>
                            <ResizableTh className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</ResizableTh>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    Nothing to see here
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appointment) => (
                                <tr key={appointment._id || appointment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-gray-900">{appointment.time}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{appointment.name}</span>
                                            <span className="text-xs text-gray-500">{appointment.gender} • {appointment.age}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{appointment.reason}</td>
                                    <td className="p-4 text-sm text-gray-600">{appointment.stylist}</td>
                                    <td className="p-4 text-sm font-semibold text-gray-900">₹{appointment.price || 0}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </span>
                                            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => onMarkComplete && onMarkComplete(appointment.id)}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
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

export default ReceptionistTable;
