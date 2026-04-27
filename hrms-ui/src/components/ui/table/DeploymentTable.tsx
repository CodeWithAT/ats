import { StatusCell } from './StatusCell';

export default function DeploymentTable() {
  // Simulated Server Data
  const deployments = [
    { id: 1, name: 'Project Alpha', env: 'Production', url: 'alpha.example.com', status: 'Ready', commit: 'alb2c3d', time: '2m' },
    { id: 2, name: 'Project Beta', env: 'Preview', url: 'beta.example.com', status: 'Building', commit: 'feat-lorem', time: '5m' },
    { id: 3, name: 'Project Gamma', env: 'Production', url: 'gamma.example.com', status: 'Error', commit: 'fix-dolor', time: '1h' },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Deployment</th>
            <th className="px-6 py-3">State</th>
            <th className="px-6 py-3">Commit</th>
            <th className="px-6 py-3">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deployments.map((dep) => (
            <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{dep.name} <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full ml-2">{dep.env}</span></div>
                <div className="text-sm text-gray-500">{dep.url}</div>
              </td>
              {/* Using the modular cell library here */}
              <td className="px-6 py-4">
                <StatusCell status={dep.status as any} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                <div className="truncate w-48">"Update dependencies and fix UI..."</div>
                <div className="text-xs text-gray-400 mt-1">⎇ {dep.commit}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{dep.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}