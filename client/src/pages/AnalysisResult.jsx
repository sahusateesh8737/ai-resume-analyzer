import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, MessageSquare, BookOpen, Loader2, Sparkles, Download, Layout } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RechartsTooltip } from 'recharts';
import { useReactToPrint } from 'react-to-print';
import { getAnalysisById, generateCoverLetter, generateInterviewQuestions, checkGrammarTone } from '../services/api';

const AnalysisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('score');
  
  const contentRef = useRef(null);
  
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await getAnalysisById(id);
        setData(result);
      } catch (err) {
        setError('Failed to load analysis details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    try {
      const result = await generateCoverLetter(id);
      setData(prev => ({ ...prev, coverLetter: result.coverLetter }));
    } catch (err) {
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateInterview = async () => {
    setGenerating(true);
    try {
      const result = await generateInterviewQuestions(id);
      setData(prev => ({ ...prev, interviewQuestions: result.interviewQuestions }));
    } catch (err) {
      alert('Failed to generate interview questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateGrammar = async () => {
    setGenerating(true);
    try {
      const result = await checkGrammarTone(id);
      setData(prev => ({ ...prev, grammarFeedback: result.grammarFeedback }));
    } catch (err) {
      alert('Failed to check grammar and tone. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `SyncATS_Report_${data?.resumeId?.fileName || 'Resume'}`,
  });

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#050505] bg-noise">
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
    </div>
  );
  if (error) return <div className="text-center mt-20 text-red-500 font-medium bg-[#050505] min-h-screen">{error}</div>;
  if (!data) return <div className="text-center mt-20 text-gray-500 bg-[#050505] min-h-screen">No data found.</div>;

  const scoreData = [
    { name: 'Score', value: data.atsScore || 0 },
    { name: 'Remaining', value: 100 - (data.atsScore || 0) }
  ];
  
  const COLORS = [(data.atsScore || 0) >= 80 ? '#10b981' : (data.atsScore || 0) >= 50 ? '#eab308' : '#ef4444', 'rgba(255,255,255,0.1)'];

  const radarData = [
    { subject: 'ATS Match', A: data.atsScore || 0, fullMark: 100 },
    { subject: 'Matched Skills', A: Math.min((data.matchedKeywords?.length || 0) * 15, 100), fullMark: 100 },
    { subject: 'Missing Skills', A: Math.max(100 - ((data.missingKeywords?.length || 0) * 10), 0), fullMark: 100 },
    { subject: 'Impact Metric', A: data.grammarFeedback ? 85 : 40, fullMark: 100 },
    { subject: 'Readability', A: 80, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] py-10 px-4 sm:px-6 bg-noise relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white font-medium mb-6 transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-md">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        
        <div ref={contentRef} id="analysis-report-content" className="liquid-glass-card overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Analysis Report</h1>
              <p className="text-gray-400 text-sm mt-2 flex items-center">
                <FileText size={16} className="mr-2 text-yellow-500" /> {data.resumeId?.fileName || 'Resume'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0 relative z-10">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-sm text-gray-300 font-medium shadow-inner hidden lg:block">
                Analyzed on <span className="text-white ml-1">{new Date(data.analyzedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <Link 
                to={`/resume/${data.resumeId?._id}/builder`}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition-all w-full sm:w-auto justify-center"
              >
                <Layout size={18} className="mr-2" /> Open Builder
              </Link>
              <button 
                onClick={handleDownloadPDF} 
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold flex items-center transition-all glow-yellow w-full sm:w-auto justify-center"
              >
                <Download size={18} className="mr-2" /> Export ATS Report
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-white/10 bg-black/20 px-4 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('score')}
              className={`whitespace-nowrap px-6 py-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all ${activeTab === 'score' ? 'border-yellow-500 text-yellow-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <CheckCircle size={18} /> <span>Score & Fixes</span>
            </button>
            <button 
              onClick={() => setActiveTab('cover-letter')}
              className={`whitespace-nowrap px-6 py-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all ${activeTab === 'cover-letter' ? 'border-yellow-500 text-yellow-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <FileText size={18} /> <span>Cover Letter Generator</span>
            </button>
            <button 
              onClick={() => setActiveTab('interview')}
              className={`whitespace-nowrap px-6 py-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all ${activeTab === 'interview' ? 'border-yellow-500 text-yellow-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <MessageSquare size={18} /> <span>Interview Prep</span>
            </button>
            <button 
              onClick={() => setActiveTab('grammar')}
              className={`whitespace-nowrap px-6 py-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all ${activeTab === 'grammar' ? 'border-yellow-500 text-yellow-400 bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <BookOpen size={18} /> <span>Tone & Grammar</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-10">
            
            {/* Tab: Score & Fixes */}
            {activeTab === 'score' && (
              <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 rounded-full blur-[60px]"></div>
                    <h3 className="text-xl font-bold text-white mb-8 relative z-10 tracking-wide">ATS Match Score</h3>
                    <div className="w-64 h-64 relative z-10" style={{ minHeight: '256px', minWidth: '256px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={scoreData}
                            innerRadius={80}
                            outerRadius={105}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={6}
                          >
                            {scoreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-white drop-shadow-md">{data.atsScore || 0}%</span>
                        <span className="text-sm font-bold text-yellow-500 mt-2 uppercase tracking-widest">Match Rate</span>
                      </div>
                    </div>

                    <div className="w-full mt-10">
                      <h3 className="text-lg font-bold text-gray-300 mb-4 tracking-wide text-center uppercase text-sm">Skill Distribution</h3>
                      <div className="h-48 w-full" style={{ minHeight: '192px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Profile" dataKey="A" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#eab308', color: '#fff', borderRadius: '8px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-10">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px]"></div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center relative z-10">
                        <CheckCircle className="text-green-400 mr-3" size={24} />
                        Matched Keywords
                      </h3>
                      <div className="flex flex-wrap gap-3 relative z-10">
                        {data.matchedKeywords?.map((kw, i) => (
                          <span key={i} className="px-4 py-2 bg-green-500/10 text-green-300 rounded-xl text-sm font-semibold border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            {kw}
                          </span>
                        ))}
                        {(!data.matchedKeywords || data.matchedKeywords.length === 0) && (
                          <span className="text-gray-400 italic text-sm bg-black/40 px-5 py-3 rounded-xl border border-white/5 w-full">No significant keywords matched.</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px]"></div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center relative z-10">
                        <XCircle className="text-red-400 mr-3" size={24} />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-3 relative z-10">
                        {data.missingKeywords?.map((kw, i) => (
                          <span key={i} className="px-4 py-2 bg-red-500/10 text-red-300 rounded-xl text-sm font-semibold border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            {kw}
                          </span>
                        ))}
                        {(!data.missingKeywords || data.missingKeywords.length === 0) && (
                          <span className="text-gray-400 italic text-sm bg-black/40 px-5 py-3 rounded-xl border border-white/5 w-full">Great job! No crucial keywords are missing.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 liquid-glass p-10 rounded-3xl border border-yellow-500/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                  <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center relative z-10">
                    <Sparkles className="w-8 h-8 mr-3 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /> Actionable Feedback
                  </h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium text-lg relative z-10">
                    {data.feedback}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Cover Letter */}
            {activeTab === 'cover-letter' && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                {!data.coverLetter ? (
                  <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-md">
                    <FileText className="w-20 h-20 text-yellow-500/50 mx-auto mb-6" />
                    <h3 className="text-3xl font-extrabold text-white mb-4">Draft a Targeted Cover Letter</h3>
                    <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">Let AI write a highly personalized cover letter based on your resume and the exact requirements of this job description.</p>
                    <button 
                      onClick={handleGenerateCoverLetter}
                      disabled={generating}
                      className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 py-4 rounded-full transition-all transform hover:-translate-y-1 inline-flex items-center glow-yellow text-lg shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2)]"
                    >
                      {generating ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2"/> Generate Cover Letter (1 Credit)</>}
                    </button>
                  </div>
                ) : (
                  <div className="liquid-glass border border-white/10 rounded-3xl shadow-xl p-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 relative z-10">
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <FileText className="w-6 h-6 mr-3 text-yellow-400" /> Your Generated Cover Letter
                      </h3>
                      <button 
                        onClick={() => navigator.clipboard.writeText(data.coverLetter)}
                        className="text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="text-gray-200 leading-loose whitespace-pre-wrap font-serif text-lg bg-black/20 p-8 rounded-2xl border border-white/5 relative z-10 shadow-inner">
                      {data.coverLetter}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Interview Prep */}
            {activeTab === 'interview' && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                {(!data.interviewQuestions || data.interviewQuestions.length === 0) ? (
                  <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-md">
                    <MessageSquare className="w-20 h-20 text-yellow-500/50 mx-auto mb-6" />
                    <h3 className="text-3xl font-extrabold text-white mb-4">Technical Interview Prep</h3>
                    <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">Generate 5 highly targeted interview questions specifically designed to probe the gaps between your resume and the job description.</p>
                    <button 
                      onClick={handleGenerateInterview}
                      disabled={generating}
                      className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 py-4 rounded-full transition-all transform hover:-translate-y-1 inline-flex items-center glow-yellow text-lg shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2)]"
                    >
                      {generating ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2"/> Generate Questions (1 Credit)</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {data.interviewQuestions.map((q, idx) => (
                      <div key={idx} className="liquid-glass border border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-[0_10px_40px_rgba(234,179,8,0.1)] transition-all group">
                        <div className="flex items-start space-x-6">
                          <div className="bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-black rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.4)] text-xl border border-yellow-300/50">
                            Q{idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-white mb-4 leading-snug">{q.question}</h4>
                            <div className="bg-yellow-500/10 text-yellow-200 text-sm p-4 rounded-xl border border-yellow-500/20 mb-4 font-medium backdrop-blur-sm">
                              <span className="font-extrabold text-yellow-400 uppercase tracking-wider text-xs mr-2 border-b border-yellow-400/30 pb-0.5">Why they ask:</span> {q.context}
                            </div>
                            <div className="bg-green-500/10 text-green-200 text-sm p-4 rounded-xl border border-green-500/20 font-medium backdrop-blur-sm">
                              <span className="font-extrabold text-green-400 uppercase tracking-wider text-xs mr-2 border-b border-green-400/30 pb-0.5">Suggested approach:</span> {q.suggestedAnswer}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Tone & Grammar */}
            {activeTab === 'grammar' && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                {!data.grammarFeedback ? (
                  <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-md">
                    <BookOpen className="w-20 h-20 text-yellow-500/50 mx-auto mb-6" />
                    <h3 className="text-3xl font-extrabold text-white mb-4">Tone & Grammar Check</h3>
                    <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">Analyze your resume for passive voice, weak action verbs, and repetitive words to make your bullet points more impactful.</p>
                    <button 
                      onClick={handleGenerateGrammar}
                      disabled={generating}
                      className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 py-4 rounded-full transition-all transform hover:-translate-y-1 inline-flex items-center glow-yellow text-lg shadow-[inset_0_-2px_10px_rgba(0,0,0,0.2)]"
                    >
                      {generating ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5 mr-2"/> Check Grammar (1 Credit)</>}
                    </button>
                  </div>
                ) : (
                  <div className="liquid-glass border border-white/10 rounded-3xl shadow-xl p-10 relative">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-6 flex items-center relative z-10">
                      <BookOpen className="w-6 h-6 mr-3 text-yellow-400" /> Editing & Tone Review
                    </h3>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg bg-black/20 p-8 rounded-2xl border border-white/5 relative z-10 shadow-inner">
                      {data.grammarFeedback}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
