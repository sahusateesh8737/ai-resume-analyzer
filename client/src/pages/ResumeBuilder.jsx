import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Download, ArrowLeft, Loader2, Code, FileText, Layout } from 'lucide-react';
import { getResume, downloadExport, tailorResume, resolveTailorDiffs } from '../services/api';
import HarvardTemplate from '../components/ResumeTemplates/HarvardTemplate';
import ModernTemplate from '../components/ResumeTemplates/ModernTemplate';
import DeveloperTemplate from '../components/ResumeTemplates/DeveloperTemplate';
import DiffApprover from '../components/DiffApprover'; 
import { useReactToPrint } from 'react-to-print';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [template, setTemplate] = useState('modern');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorSession, setTailorSession] = useState(null);
  
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Resume_${template}`,
  });

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const data = await getResume(id);
      setResume(data);
    } catch (err) {
      setError('Failed to load resume data. It may not have structured data yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription) return;
    setTailoring(true);
    try {
      const result = await tailorResume(id, jobDescription);
      setTailorSession({
        tailorId: result.tailorId,
        diffs: result.diffs
      });
    } catch (err) {
      setError('Failed to generate AI tailored suggestions.');
    } finally {
      setTailoring(false);
    }
  };

  const handleResolveDiffs = async (resolutions) => {
    if (!tailorSession) return;
    try {
      const result = await resolveTailorDiffs(id, tailorSession.tailorId, resolutions);
      // Update local resume structured data
      setResume({ ...resume, structuredData: result.structuredData });
      setTailorSession(null);
      setJobDescription('');
    } catch (err) {
      setError('Failed to apply approved changes.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (error || !resume?.structuredData) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl text-red-400">
          {error || 'This resume does not have structured JSON data. Please upload a new resume.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 pb-12 bg-noise relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 liquid-glass border-b border-white/10 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-white/20"></div>
            <h1 className="text-xl font-bold text-white flex items-center">
              <Layout className="w-5 h-5 mr-2 text-yellow-500" /> Resume Builder
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition">
              <Download className="w-4 h-4 mr-2" /> PDF
            </button>
            <button onClick={() => downloadExport(id, 'docx', template)} className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition">
              <Download className="w-4 h-4 mr-2" /> DOCX
            </button>
            <button onClick={() => downloadExport(id, 'latex', template)} className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition">
              <Download className="w-4 h-4 mr-2" /> LaTeX
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Sidebar: Controls & AI Tailor */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Format Switcher */}
          <div className="liquid-glass-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center"><Layout className="w-5 h-5 mr-2 text-yellow-500" /> Templates</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setTemplate('modern')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${template === 'modern' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <div className="flex items-center"><Layout className="w-5 h-5 mr-3" /> Modern (Two-Column)</div>
                {template === 'modern' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
              </button>
              
              <button 
                onClick={() => setTemplate('harvard')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${template === 'harvard' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <div className="flex items-center"><FileText className="w-5 h-5 mr-3" /> Harvard (Standard)</div>
                {template === 'harvard' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
              </button>
              
              <button 
                onClick={() => setTemplate('developer')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${template === 'developer' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
              >
                <div className="flex items-center"><Code className="w-5 h-5 mr-3" /> Developer (Terminal)</div>
                {template === 'developer' && <div className="w-2 h-2 rounded-full bg-yellow-500"></div>}
              </button>
            </div>
          </div>

          {/* AI Tailor */}
          <div className="liquid-glass-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-yellow-500" /> AI Tailor</h2>
            <p className="text-sm text-gray-400 mb-4">Paste a target job description, and our AI will suggest targeted rewrites for your summary and experience bullet points.</p>
            
            <textarea
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500/50 text-sm h-32 mb-4 resize-none"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={tailoring || tailorSession}
            />
            
            {!tailorSession ? (
              <button
                onClick={handleTailor}
                disabled={tailoring || !jobDescription}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition ${tailoring || !jobDescription ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400 glow-yellow'}`}
              >
                {tailoring ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {tailoring ? 'Generating Diffs...' : 'Tailor Resume'}
              </button>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl text-yellow-400 text-sm text-center">
                Review the suggestions in the main panel to apply them.
              </div>
            )}
          </div>
          
        </div>

        {/* Right Content: Preview & Diff Viewer */}
        <div className="lg:col-span-8">
          
          {tailorSession ? (
             <DiffApprover 
               diffs={tailorSession.diffs} 
               onResolve={handleResolveDiffs} 
               onCancel={() => { setTailorSession(null); setJobDescription(''); }}
             />
          ) : (
            <div className="bg-gray-100 rounded-2xl overflow-hidden p-8 shadow-2xl relative">
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold z-10 backdrop-blur-sm">
                Live Preview
              </div>
              <div className="scale-[0.85] origin-top transform-gpu transition-all">
                <div ref={componentRef} className="bg-white" style={{ padding: '0', margin: '0' }}>
                  {template === 'harvard' && <HarvardTemplate data={resume.structuredData} />}
                  {template === 'modern' && <ModernTemplate data={resume.structuredData} />}
                  {template === 'developer' && <DeveloperTemplate data={resume.structuredData} />}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
