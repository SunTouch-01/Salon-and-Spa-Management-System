import ResizableTh from '../ResizableTh';

const defaultLoginHistory = [
    {
        id: 1,
        device: "Windows",
        browser: "Chrome",
        ip: "192.168.1.2",
        date: "30 Jan 2026"
    },
    {
        id: 2,
        device: "Android",
        browser: "Edge",
        ip: "192.168.1.8",
        date: "29 Jan 2026"
    }
];

const LoginHistoryTable = ({ loginHistory = defaultLoginHistory }) => {
    return (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
            <h2 className="text-xl font-semibold text-primary mb-6">📊 Login Activity</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse mt-2">
                    <thead>
                        <tr>
                            <ResizableTh className="p-3 bg-secondary text-gray-800 rounded-l-lg text-sm font-semibold uppercase">Device</ResizableTh>
                            <ResizableTh className="p-3 bg-secondary text-gray-800 text-sm font-semibold uppercase">Browser</ResizableTh>
                            <ResizableTh className="p-3 bg-secondary text-gray-800 text-sm font-semibold uppercase">IP</ResizableTh>
                            <ResizableTh className="p-3 bg-secondary text-gray-800 rounded-r-lg text-sm font-semibold uppercase">Date</ResizableTh>
                        </tr>
                    </thead>
                    <tbody className="space-y-2">
                        {loginHistory.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    Nothing to see here
                                </td>
                            </tr>
                        ) : (
                            <>
                                {loginHistory.map((login, index) => (
                                    <>
                                        <tr key={login.id} className="hover:bg-accent-cream transition-colors group">
                                            <td className="p-3 bg-bg-light rounded-l-lg mt-2 group-hover:bg-accent-cream">{login.device}</td>
                                            <td className="p-3 bg-bg-light group-hover:bg-accent-cream">{login.browser}</td>
                                            <td className="p-3 bg-bg-light group-hover:bg-accent-cream">{login.ip}</td>
                                            <td className="p-3 bg-bg-light rounded-r-lg group-hover:bg-accent-cream">{login.date}</td>
                                        </tr>
                                        {index < loginHistory.length - 1 && <tr className="block h-2"></tr>}
                                    </>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoginHistoryTable;
