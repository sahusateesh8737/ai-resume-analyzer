import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Activity, LogOut, Sparkles, Clock, CheckCircle, ChevronRight, Loader2, UserSearch, Check } from 'lucide-react';
import { analyzeResume, getHistory, logout, auditLinkedIn } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  
  // LinkedIn State
  const [activeTab, setActiveTab] = useState('resume');
  const [aboutText, setAboutText] = useState('');
  const [linkedinResult, setLinkedinResult] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
    } else {
      setUser(userData);
      fetchHistory();
    }
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Please provide both a resume file and a job description.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const result = await analyzeResume(formData);
      // Update local user credits
      const updatedUser = { ...user, credits: result.creditsRemaining };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      navigate(`/analysis/${result.analysis._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkedInAudit = async () => {
    if (!aboutText || !jobDescription) {
      setError('Please provide both LinkedIn About text and a job description.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await auditLinkedIn(aboutText, jobDescription);
      const updatedUser = { ...user, credits: result.creditsRemaining };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLinkedinResult(result.auditResult);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to audit LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 pb-12 bg-noise relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 liquid-glass border-b border-white/10 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <Sparkles className="text-yellow-500 w-7 h-7" />
              <h1 className="text-xl font-extrabold tracking-tight text-white">SyncATS</h1>
            </div>
            <div className="hidden sm:flex space-x-2 border-l border-white/10 pl-6">
              <Link to="/dashboard" className="text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 font-medium">Analyzer</Link>
              <Link to="/jobs" className="text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium">Job Board</Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
              <span className="text-sm font-medium text-gray-400">Credits</span>
              <span className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">{user?.credits || 0}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        
        {/* Tool Selector Tabs */}
        <div className="flex space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'resume' 
                ? 'bg-yellow-500 text-black shadow-lg glow-yellow' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileText size={18} />
            <span>Resume Analyzer</span>
          </button>
          <button 
            onClick={() => setActiveTab('linkedin')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'linkedin' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            <UserSearch size={18} />
            <span>Profile Auditor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: New Analysis */}
          <div className="lg:col-span-8 space-y-6">
            <div className="liquid-glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="mb-8 relative z-10">
                <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <Activity className="w-7 h-7 text-yellow-500" />
                  <span>Start New Analysis</span>
                </h2>
                <p className="text-gray-400 mt-2 text-lg">Upload your resume and the target job description to get your match score.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 backdrop-blur-md border border-red-500/30 text-red-300 rounded-2xl text-sm flex items-start space-x-3 relative z-10">
                  <div className="mt-0.5"><Activity size={16} /></div>
                  <div>{error}</div>
                </div>
              )}
              
              <div className="space-y-8 relative z-10">
                {/* Job Description Input (Shared) */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center space-x-2">
                    <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-inner">1</span>
                    <span>Paste Target Job Description</span>
                  </label>
                  <textarea
                    className="w-full p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 min-h-[160px] transition-all resize-y text-sm text-gray-200 placeholder-gray-600 shadow-inner"
                    placeholder="E.g. We are looking for a Senior Frontend Engineer with experience in React, TypeScript, and modern CSS frameworks..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {activeTab === 'resume' ? (
                  <>
                    {/* File Upload Dropzone */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center space-x-2">
                    <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-inner">2</span>
                    <span>Upload Resume</span>
                  </label>
                  <div 
                    {...getRootProps()} 
                    className={`relative overflow-hidden border border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300
                      ${isDragActive 
                        ? 'border-yellow-500 bg-yellow-500/10 scale-[1.02] shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                        : 'border-white/20 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50 shadow-inner'
                      }`}
                  >
                    <input {...getInputProps()} />
                    
                    {file ? (
                      <div className="flex flex-col items-center space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full border border-yellow-500/30 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">{file.name}</p>
                          <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isDragActive ? 'bg-yellow-500/20 border-yellow-500/30 border' : 'bg-white/5 border border-white/10'}`}>
                          <Upload className={`w-8 h-8 ${isDragActive ? 'text-yellow-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-gray-300 font-medium text-lg">Drag & drop your resume</p>
                          <p className="text-gray-500 text-sm mt-1">Supports PDF and DOCX formats</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !file || !jobDescription}
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 
                    ${loading || !file || !jobDescription 
                      ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' 
                      : 'bg-yellow-500 text-black border border-yellow-400 hover:bg-yellow-400 glow-yellow transform hover:-translate-y-1'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Analyze Resume</span>
                    </>
                  )}
                </button>

                  </>
                ) : (
                  <>
                    {/* LinkedIn Profile Input */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center space-x-2">
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-inner">2</span>
                        <span>Paste LinkedIn "About" Section</span>
                      </label>
                      <textarea
                        className="w-full p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 min-h-[160px] transition-all resize-y text-sm text-gray-200 placeholder-gray-600 shadow-inner"
                        placeholder="Paste your LinkedIn About section here..."
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleLinkedInAudit}
                      disabled={loading || !aboutText || !jobDescription}
                      className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 
                        ${loading || !aboutText || !jobDescription 
                          ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 border border-blue-400 transform hover:-translate-y-1'
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Auditing Profile...</span>
                        </>
                      ) : (
                        <>
                          <UserSearch className="w-6 h-6" />
                          <span>Audit Profile (1 Credit)</span>
                        </>
                      )}
                    </button>

                    {/* LinkedIn Results */}
                    {linkedinResult && (
                      <div className="mt-8 bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden animate-in slide-in-from-bottom-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                          <h3 className="text-2xl font-bold text-white flex items-center">
                            <UserSearch className="text-blue-400 mr-3" size={28} />
                            Profile Audit Results
                          </h3>
                          <div className={`px-4 py-2 rounded-xl font-bold border shadow-inner ${linkedinResult.score >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' : linkedinResult.score >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                            Score: {linkedinResult.score}/100
                          </div>
                        </div>
                        
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-white mb-4">Feedback & Suggestions</h4>
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">{linkedinResult.feedback}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-bold text-white mb-4">Missing Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {linkedinResult.missingKeywords?.map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-300 rounded-lg text-sm border border-red-500/20">
                                {kw}
                              </span>
                            ))}
                            {(!linkedinResult.missingKeywords || linkedinResult.missingKeywords.length === 0) && (
                              <span className="text-gray-400 text-sm flex items-center"><Check size={16} className="text-green-500 mr-2" /> Your profile covers all key terms!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-4">
            <div className="liquid-glass-card p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-white border-b border-white/10 pb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span>Recent Scans</span>
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-12 px-4 bg-black/40 rounded-2xl border border-white/10 border-dashed">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm font-medium">No past analyses found.</p>
                  <p className="text-gray-500 text-xs mt-2">Your recent scans will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => navigate(`/analysis/${item._id}`)}
                      className="group relative bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-yellow-500/30 hover:bg-white/5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_30px_rgba(234,179,8,0.1)]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3 w-[70%]">
                          <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 group-hover:bg-yellow-500/20 group-hover:text-yellow-400 group-hover:border-yellow-500/30 transition-all">
                            <FileText size={16} />
                          </div>
                          <span className="font-semibold text-sm text-gray-200 truncate group-hover:text-white transition-colors">{item.resumeId?.fileName || 'Resume'}</span>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border shadow-inner ${
                          item.atsScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          item.atsScore >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.atsScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                        <span>{new Date(item.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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

export default Dashboard;
