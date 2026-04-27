

// Independent Status Cell Component
export const StatusCell = ({ status }: { status: 'Ready' | 'Building' | 'Error' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Ready': return { color: 'bg-blue-500', text: 'Ready' };
      case 'Building': return { color: 'bg-yellow-400', text: 'Building' };
      case 'Error': return { color: 'bg-red-500', text: 'Error' };
      default: return { color: 'bg-gray-400', text: 'Unknown' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
      <span className="text-sm font-medium text-gray-700">{config.text}</span>
    </div>
  );
};