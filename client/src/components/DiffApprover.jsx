import React, { useState } from 'react';
import { Check, X, CheckCircle, Lightbulb } from 'lucide-react';

const DiffApprover = ({ diffs, onResolve, onCancel }) => {
  // Store resolutions: { [diffId]: 'approved' | 'rejected' }
  const [resolutions, setResolutions] = useState({});

  const handleResolve = (diffId, status) => {
    setResolutions(prev => ({ ...prev, [diffId]: status }));
  };

  const isAllResolved = Object.keys(resolutions).length === diffs.length;

  const handleSubmit = () => {
    const resolutionArray = Object.keys(resolutions).map(diffId => ({
      diffId,
      status: resolutions[diffId]
    }));
    onResolve(resolutionArray);
  };

  return (
    <div className="liquid-glass-card p-8">
      <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Lightbulb className="text-yellow-500 w-6 h-6 mr-3" />
            AI Suggested Revisions
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Review the changes. The AI has rewritten these sections to better match the job description.</p>
        </div>
        <div className="text-sm font-bold bg-black/40 px-4 py-2 rounded-lg border border-white/10 text-gray-300">
          {Object.keys(resolutions).length} / {diffs.length} Reviewed
        </div>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        {diffs.map((diff, index) => {
          const status = resolutions[diff._id];
          
          return (
            <div key={diff._id || index} className={`rounded-xl overflow-hidden border transition-all duration-300 ${status === 'approved' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : status === 'rejected' ? 'border-red-500/30' : 'border-white/10 bg-black/40'}`}>
              
              {/* Header */}
              <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/5">
                <div className="text-xs font-mono text-gray-400 bg-black/50 px-2 py-1 rounded">Path: {diff.path}</div>
                
                {status ? (
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {status === 'approved' ? 'Approved' : 'Rejected'}
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={() => handleResolve(diff._id, 'rejected')} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleResolve(diff._id, 'approved')} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old Value (Red) */}
                <div className={`p-4 rounded-lg text-sm bg-red-950/30 border border-red-900/50 ${status === 'approved' ? 'opacity-50 line-through text-gray-500' : 'text-red-200'}`}>
                  <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Original</div>
                  {diff.oldValue || <span className="italic text-gray-600">Empty</span>}
                </div>
                
                {/* New Value (Green) */}
                <div className={`p-4 rounded-lg text-sm bg-green-950/30 border border-green-900/50 ${status === 'rejected' ? 'opacity-50 line-through text-gray-500' : 'text-green-200'}`}>
                  <div className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">Suggested</div>
                  {diff.newValue}
                </div>
              </div>

              {/* Reason */}
              {diff.reason && (
                <div className="px-4 pb-4 pt-2">
                  <div className="text-xs text-yellow-500/80 bg-yellow-500/5 px-3 py-2 rounded border border-yellow-500/10 flex items-start">
                    <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{diff.reason}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end space-x-4 border-t border-white/10 pt-6">
        <button 
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!isAllResolved}
          className={`px-8 py-2.5 rounded-xl font-bold flex items-center transition ${isAllResolved ? 'bg-yellow-500 text-black hover:bg-yellow-400 glow-yellow' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
        >
          {isAllResolved && <CheckCircle className="w-5 h-5 mr-2" />}
          Apply Changes
        </button>
      </div>

    </div>
  );
};

export default DiffApprover;
