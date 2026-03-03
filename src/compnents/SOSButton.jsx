import { AlertCircle } from 'lucide-react';

const SOSButton = () => {
  return (
    <div className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center">
      <h3 className="text-red-600 font-bold mb-2">Shivam: SOS Logic Yahan Likho</h3>
      <button className="bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:bg-red-700 transition-all">
        <AlertCircle size={24} />
        Send SOS
      </button>
    </div>
  );
};

export default SOSButton;