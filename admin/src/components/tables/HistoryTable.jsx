import ResizableTh from '../ResizableTh';

const payments = [
    {
        id: "TXN001",
        name: "Harsh Patil",
        action: "Payment Successful",
        date: "2026-01-12"
    },
    {
        id: "TXN002",
        name: "Aarav Sharma",
        action: "Payment Failed",
        date: "2026-01-13"
    },
    {
        id: "TXN003",
        name: "Sneha Kulkarni",
        action: "Refund Issued",
        date: "2026-01-14"
    },
    {
        id: "TXN004",
        name: "Rohit Mehta",
        action: "Payment Successful",
        date: "2026-01-15"
    }
];

export default function HistoryTable() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</ResizableTh>
                            <ResizableTh className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</ResizableTh>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    Nothing to see here
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4 text-gray-700 font-mono text-sm">
                                        {payment.id}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {payment.name}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
                      ${payment.action === 'Payment Successful' ? 'bg-green-100 text-green-700' :
                                                    payment.action === 'Payment Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                                        >
                                            {payment.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {payment.date}
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
