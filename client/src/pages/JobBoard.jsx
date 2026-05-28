import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, LogOut, Plus, Trash2, Building, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { getApplications, createApplication, updateApplication, deleteApplication, logout } from '../services/api';

const initialColumns = {
  'Wishlist': { id: 'Wishlist', title: 'Wishlist', items: [] },
  'Applied': { id: 'Applied', title: 'Applied', items: [] },
  'Interviewing': { id: 'Interviewing', title: 'Interviewing', items: [] },
  'Offered': { id: 'Offered', title: 'Offered', items: [] },
  'Rejected': { id: 'Rejected', title: 'Rejected', items: [] }
};

const JobBoard = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({ companyName: '', jobTitle: '', location: '', salary: '', status: 'Wishlist' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
    } else {
      setUser(userData);
      fetchJobs();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const data = await getApplications();
      
      const newCols = JSON.parse(JSON.stringify(initialColumns));
      data.forEach(app => {
        if (newCols[app.status]) {
          newCols[app.status].items.push(app);
        } else {
          newCols['Wishlist'].items.push(app); // fallback
        }
      });
      
      setColumns(newCols);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId];
      const destCol = columns[destination.droppableId];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });

      // Update backend
      try {
        await updateApplication(removed._id, { status: destination.droppableId });
      } catch (err) {
        console.error('Failed to update status', err);
        // revert logic could be added here
      }
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const addedJob = await createApplication(newJob);
      const col = columns[newJob.status];
      setColumns({
        ...columns,
        [newJob.status]: { ...col, items: [addedJob, ...col.items] }
      });
      setShowAddModal(false);
      setNewJob({ companyName: '', jobTitle: '', location: '', salary: '', status: 'Wishlist' });
    } catch (err) {
      console.error('Failed to add job', err);
    }
  };

  const handleDeleteJob = async (id, status) => {
    try {
      await deleteApplication(id);
      const col = columns[status];
      setColumns({
        ...columns,
        [status]: { ...col, items: col.items.filter(item => item._id !== id) }
      });
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 bg-noise relative overflow-hidden flex flex-col">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <nav className="sticky top-0 z-50 liquid-glass border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <Sparkles className="text-yellow-500 w-7 h-7" />
              <h1 className="text-xl font-extrabold tracking-tight text-white">SyncATS</h1>
            </div>
            <div className="hidden sm:flex space-x-2 border-l border-white/10 pl-6">
              <Link to="/dashboard" className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Analyzer</Link>
              <Link to="/jobs" className="text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 font-medium">Job Board</Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-full transition-all glow-yellow"
            >
              <Plus size={16} />
              <span>Add Job</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-x-auto p-6 max-w-screen-2xl mx-auto w-full relative z-10 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-6 items-start h-full pb-10">
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="w-80 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl flex flex-col max-h-full liquid-glass-card shadow-lg">
                  <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-2xl flex justify-between items-center backdrop-blur-md">
                    <h3 className="font-bold text-white tracking-wide">{column.title}</h3>
                    <span className="bg-white/10 text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full">{column.items.length}</span>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-4 overflow-y-auto min-h-[150px] custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                      >
                        {column.items.map((item, index) => (
                          <Draggable key={item._id} draggableId={item._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group p-4 mb-3 rounded-xl border transition-all ${
                                  snapshot.isDragging 
                                    ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_10px_30px_rgba(234,179,8,0.2)] rotate-2 scale-105' 
                                    : 'bg-black/60 border-white/10 hover:border-white/20 hover:bg-black/80 shadow-inner'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-white text-sm">{item.jobTitle}</h4>
                                  <button onClick={() => handleDeleteJob(item._id, columnId)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="flex items-center text-gray-400 text-xs mb-1.5 font-medium">
                                  <Building size={12} className="mr-1.5 text-yellow-500/70" />
                                  {item.companyName}
                                </div>
                                {item.location && (
                                  <div className="flex items-center text-gray-500 text-xs mb-1.5">
                                    <MapPin size={12} className="mr-1.5" />
                                    {item.location}
                                  </div>
                                )}
                                {item.salary && (
                                  <div className="flex items-center text-green-400/80 text-xs font-semibold">
                                    <DollarSign size={12} className="mr-1.5" />
                                    {item.salary}
                                  </div>
                                )}
                                <div className="text-[10px] text-gray-600 mt-3 pt-2 border-t border-white/5 text-right font-medium">
                                  Added {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden liquid-glass-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] pointer-events-none"></div>
            <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Add Application</h2>
            <form onSubmit={handleAddJob} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name *</label>
                <input required value={newJob.companyName} onChange={e => setNewJob({...newJob, companyName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Title *</label>
                <input required value={newJob.jobTitle} onChange={e => setNewJob({...newJob, jobTitle: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                  <input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all shadow-inner text-sm" placeholder="Remote, NY, etc." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Salary</label>
                  <input value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all shadow-inner text-sm" placeholder="$100k - $120k" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                <select value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer shadow-inner">
                  {Object.keys(columns).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-gray-300 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all shadow-lg glow-yellow">Add Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default JobBoard;
