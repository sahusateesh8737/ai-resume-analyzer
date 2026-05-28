import express from 'express';
import { processAnalysis, getHistory, getAnalysisById, createCoverLetter, createInterviewQuestions, createGrammarCheck, auditLinkedIn } from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('resume'), processAnalysis);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getAnalysisById);

// Advanced AI Features
router.post('/:id/cover-letter', protect, createCoverLetter);
router.post('/:id/interview-prep', protect, createInterviewQuestions);
router.post('/:id/grammar-check', protect, createGrammarCheck);

// LinkedIn Auditor
router.post('/linkedin-audit', protect, auditLinkedIn);

export default router;
