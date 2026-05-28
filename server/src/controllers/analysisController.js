import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Analysis from '../models/Analysis.js';
import { parseResume } from '../services/parser.js';
import { analyzeResume, generateCoverLetter, generateInterviewQuestions, checkGrammarTone, auditLinkedInProfile, parseToJSONResume } from '../services/gemini.js';

export const processAnalysis = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!jobDescription || !file) {
      return res.status(400).json({ message: 'Job description and resume file are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(403).json({ message: 'Insufficient credits. Please upgrade or contact support.' });
    }

    // 1. Parse Resume (PDF/DOCX)
    const extractedText = await parseResume(file.buffer, file.mimetype);

    // 1b. Parse into JSON Resume schema
    let structuredData = null;
    try {
      structuredData = await parseToJSONResume(extractedText);
    } catch (e) {
      console.error('Failed to parse strict JSON resume', e);
    }

    // 2. Save Resume
    const resume = await Resume.create({
      userId: user.id,
      fileName: file.originalname,
      extractedText,
      structuredData
    });

    // 3. Analyze with Gemini
    const aiResult = await analyzeResume(extractedText, jobDescription);

    // 4. Save Analysis
    const analysis = await Analysis.create({
      resumeId: resume.id,
      jobDescription,
      atsScore: aiResult.atsScore,
      matchedKeywords: aiResult.matchedKeywords,
      missingKeywords: aiResult.missingKeywords,
      feedback: typeof aiResult.feedback === 'string' ? aiResult.feedback : JSON.stringify(aiResult.feedback),
    });

    // 5. Decrement user credits
    user.credits -= 1;
    await user.save();

    res.status(201).json({
      message: 'Analysis completed successfully',
      analysis,
      creditsRemaining: user.credits,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Failed to process analysis', error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    // Find all resumes for this user, then populate their analyses
    const resumes = await Resume.find({ userId: req.user.id });
    const resumeIds = resumes.map((r) => r.id);

    const history = await Analysis.find({ resumeId: { $in: resumeIds } })
      .populate('resumeId', 'fileName uploadedAt')
      .sort({ analyzedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Failed to retrieve history' });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('resumeId', 'fileName extractedText uploadedAt userId');
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Check ownership
    if (analysis.resumeId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this analysis' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Failed to retrieve analysis' });
  }
};

export const createCoverLetter = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('resumeId');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    
    if (analysis.resumeId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (analysis.coverLetter) {
      return res.json({ coverLetter: analysis.coverLetter });
    }

    const coverLetter = await generateCoverLetter(analysis.resumeId.extractedText, analysis.jobDescription);
    analysis.coverLetter = coverLetter;
    await analysis.save();

    res.json({ coverLetter });
  } catch (error) {
    console.error('Error in createCoverLetter:', error);
    res.status(500).json({ message: 'Failed to generate cover letter' });
  }
};

export const createInterviewQuestions = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('resumeId');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    
    if (analysis.resumeId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (analysis.interviewQuestions && analysis.interviewQuestions.length > 0) {
      return res.json({ interviewQuestions: analysis.interviewQuestions });
    }

    const interviewQuestions = await generateInterviewQuestions(analysis.resumeId.extractedText, analysis.jobDescription);
    analysis.interviewQuestions = interviewQuestions;
    await analysis.save();

    res.json({ interviewQuestions });
  } catch (error) {
    console.error('Error in createInterviewQuestions:', error);
    res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};

export const createGrammarCheck = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('resumeId');
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    
    if (analysis.resumeId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (analysis.grammarFeedback) {
      return res.json({ grammarFeedback: analysis.grammarFeedback });
    }

    const grammarFeedback = await checkGrammarTone(analysis.resumeId.extractedText);
    analysis.grammarFeedback = grammarFeedback;
    await analysis.save();

    res.json({ grammarFeedback });
  } catch (error) {
    console.error('Error in createGrammarCheck:', error);
    res.status(500).json({ message: 'Failed to check grammar and tone' });
  }
};

export const auditLinkedIn = async (req, res) => {
  try {
    const { aboutText, jobDescription } = req.body;
    
    if (!aboutText || !jobDescription) {
      return res.status(400).json({ message: 'LinkedIn About text and Job Description are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(403).json({ message: 'Insufficient credits. Please upgrade or contact support.' });
    }

    const auditResult = await auditLinkedInProfile(aboutText, jobDescription);

    // Decrement credits
    user.credits -= 1;
    await user.save();

    res.json({
      auditResult,
      creditsRemaining: user.credits
    });
  } catch (error) {
    console.error('Error in auditLinkedIn:', error);
    res.status(500).json({ message: 'Failed to audit LinkedIn profile' });
  }
};
