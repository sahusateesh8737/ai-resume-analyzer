import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Target, Sparkles, CheckCircle, BarChart3, Edit3, History, ArrowRight } from 'lucide-react';

const FadeInSection = ({ children }) => {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div ref={domRef} className={`fade-in-section ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans relative overflow-hidden bg-noise">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-amber-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 1. Header / Navigation */}
      <header className="fixed w-full top-0 z-50 bg-black/40 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <span className="font-bold text-2xl tracking-tight text-white">SyncATS</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors">Home</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors">How It Works</a>
              <a href="#features" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors">Free Limits</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard" className="bg-yellow-500 text-black px-6 py-2.5 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/25">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white font-medium hidden sm:block transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-yellow-500 text-black px-6 py-2.5 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-lg glow-yellow">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (The Hook) */}
      <section id="home" className="pt-32 pb-16 md:pt-40 md:pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 mr-2" /> AI-Powered Resume Analyzer
              </div>
              <h1 className="text-5xl tracking-tight font-extrabold text-white sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
                <span className="block mb-2">Stop Guessing.</span>
                <span className="block text-gradient-yellow mb-2">Start Matching.</span>
                <span className="block">Beat the ATS.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Upload your resume and job description. Our AI analyzes your text, exposes missing keywords, and gives you a clear ATS compatibility score in seconds.
              </p>
              <div className="mt-10 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                {user ? (
                  <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-black bg-yellow-500 hover:bg-yellow-400 glow-yellow transition-all transform hover:-translate-y-1">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-black bg-yellow-500 hover:bg-yellow-400 glow-yellow transition-all transform hover:-translate-y-1">
                      Analyze My Resume Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <p className="mt-4 text-sm text-gray-500 font-medium">
                      No credit card required. Get 5 free scans on signup.
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0 lg:col-span-6 relative">
              {/* Visual Mockup - Glassmorphism */}
              <div className="relative mx-auto w-full glassy-panel rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-all duration-500 max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent rounded-3xl pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <FileText className="text-gray-300 w-8 h-8" />
                    </div>
                    <div>
                      <div className="h-2.5 w-24 bg-gray-600 rounded-full"></div>
                      <div className="h-2 w-16 bg-gray-700 rounded-full mt-3"></div>
                    </div>
                  </div>
                  <ArrowRight className="text-yellow-500 w-6 h-6 animate-pulse" />
                  <div className="text-center">
                    <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">92%</div>
                    <div className="text-xs text-gray-400 font-medium tracking-wider uppercase mt-1">Match Score</div>
                  </div>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <CheckCircle className="text-yellow-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">Added keyword: <span className="font-bold text-white">React.js</span></div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <CheckCircle className="text-yellow-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">Added keyword: <span className="font-bold text-white">TypeScript</span></div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Sparkles className="text-yellow-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-200">Improved bullet point impact metric by <span className="font-bold text-yellow-400">40%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Social Proof / Trust */}
      <FadeInSection>
        <section className="border-y border-white/10 py-12 bg-black/20 backdrop-blur-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl font-medium text-gray-400">
              "Helping developers, engineers, and professionals land their next role with <span className="text-yellow-500">data-driven</span> feedback."
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* 3. "How It Works" Section */}
      <FadeInSection>
        <section id="how-it-works" className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-sm text-yellow-500 font-bold tracking-widest uppercase mb-2">The Process</h2>
              <p className="text-4xl leading-tight font-extrabold text-white sm:text-5xl">
                How SyncATS gives you the <span className="text-gradient-yellow">unfair advantage</span>.
              </p>
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting line for desktop */}
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

                <div className="relative text-center group">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto bg-black border border-yellow-500/30 text-yellow-400 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all mb-8 relative z-10 transform group-hover:-translate-y-2">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">1. Upload & Extract</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Drop your PDF or DOCX. Our parser accurately extracts your experience without losing formatting data.
                  </p>
                </div>

                <div className="relative text-center group">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto bg-black border border-yellow-500/30 text-yellow-400 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all mb-8 relative z-10 transform group-hover:-translate-y-2">
                    <Target className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">2. Job Description</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Give our AI the exact requirements of your dream role so it knows exactly what to look for.
                  </p>
                </div>

                <div className="relative text-center group">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto bg-yellow-500 text-black rounded-2xl glow-yellow mb-8 relative z-10 transform group-hover:-translate-y-2 transition-all">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">3. Score & Fixes</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Instantly receive an ATS score, keyword gap analysis, and AI-driven rewrites for your bullet points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 4. Features Section */}
      <FadeInSection>
        <section id="features" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl leading-tight font-extrabold text-white sm:text-5xl">
                Everything you need to <span className="text-gradient-yellow">get past the bots</span>.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              <div className="flex group">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-yellow-400 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-white">Smart ATS Scoring</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed text-lg">
                    Get a definitive 0-100% score based on industry-standard parsing algorithms matching your resume to the JD.
                  </p>
                </div>
              </div>

              <div className="flex group">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-yellow-400 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-white">Keyword Gap Detection</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed text-lg">
                    Instantly see which hard and soft skills are missing from your resume that the employer is actively searching for.
                  </p>
                </div>
              </div>

              <div className="flex group">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-yellow-400 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
                    <Edit3 className="h-8 w-8" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-white">AI Bullet-Point Rewriter</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed text-lg">
                    Weak verbs? Missing metrics? Our AI engine suggests stronger, impact-driven bullet points to make your experience stand out.
                  </p>
                </div>
              </div>

              <div className="flex group">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-yellow-400 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
                    <History className="h-8 w-8" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold text-white">Version History</h3>
                  <p className="mt-3 text-gray-400 leading-relaxed text-lg">
                    Track your progress. Save your previous scans and watch your match score improve as you edit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 6. Final Call to Action */}
      <FadeInSection>
        <section className="relative z-10 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/10 pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center glassy-panel p-16 rounded-[3rem] border border-yellow-500/20">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
              Ready to <span className="text-gradient-yellow">optimize</span> your application?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of job seekers today and land your dream role faster.
            </p>
            <div className="flex justify-center">
              {user ? (
                <Link to="/dashboard" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-bold rounded-full text-black bg-yellow-500 hover:bg-yellow-400 glow-yellow transition-all transform hover:-translate-y-1">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-bold rounded-full text-black bg-yellow-500 hover:bg-yellow-400 glow-yellow transition-all transform hover:-translate-y-1">
                  Start Scanning Now <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* 7. Footer */}
      <footer className="bg-[#020202] py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 text-white mb-6 md:mb-0">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <span className="font-bold text-xl tracking-tight text-gray-200">SyncATS</span>
            </div>
            <div className="flex space-x-8 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} SyncATS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
