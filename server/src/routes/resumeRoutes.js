import express from 'express';
import { exportPDF, exportDOCX, exportLaTeX } from '../controllers/exportController.js';
import { tailorResume } from '../services/gemini.js';
import Resume from '../models/Resume.js';
import ResumeTailor from '../models/ResumeTailor.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Exports
router.get('/:id/export/pdf', exportPDF);
router.get('/:id/export/docx', exportDOCX);
router.get('/:id/export/latex', exportLaTeX);

// Tailoring (Diff generation)
router.post('/:id/tailor', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resume = await Resume.findById(req.params.id);
    
    if (!resume || !resume.structuredData) {
      return res.status(404).json({ message: 'Resume structured data not found' });
    }

    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const diffs = await tailorResume(resume.structuredData, jobDescription);
    
    // Save to ResumeTailor
    const tailor = await ResumeTailor.create({
      resumeId: resume.id,
      userId: req.user.id,
      jobDescription,
      diffs
    });

    res.json({ tailorId: tailor.id, diffs });
  } catch (error) {
    console.error('Tailor error:', error);
    res.status(500).json({ message: 'Failed to tailor resume' });
  }
});

// Approve/Reject Diffs
router.post('/:id/tailor/:tailorId/resolve', async (req, res) => {
  try {
    const { resolutions } = req.body; // Array of { diffId, status: 'approved'|'rejected' }
    const tailor = await ResumeTailor.findById(req.params.tailorId);
    
    if (!tailor) return res.status(404).json({ message: 'Tailor session not found' });
    if (tailor.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const resume = await Resume.findById(req.params.id);
    let structuredData = { ...resume.structuredData };

    // Update diff statuses and apply approved changes
    resolutions.forEach(resolution => {
      const diff = tailor.diffs.id(resolution.diffId);
      if (diff) {
        diff.status = resolution.status;
        if (resolution.status === 'approved') {
          // Apply change (Naive path resolution for MVP)
          // E.g., path: "work[0].summary" -> structuredData.work[0].summary = newValue
          try {
            // Very basic path setter for MVP (using eval is unsafe in production, using lodash.set is better, but we'll do a simple split)
            const parts = diff.path.split(/[.\[\]]+/).filter(Boolean);
            let obj = structuredData;
            for (let i = 0; i < parts.length - 1; i++) {
              obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = diff.newValue;
          } catch (err) {
            console.error('Failed to apply diff at path:', diff.path);
          }
        }
      }
    });

    await tailor.save();

    // Save updated resume data
    resume.structuredData = structuredData;
    // Mongoose Mixed types require markModified
    resume.markModified('structuredData');
    await resume.save();

    res.json({ message: 'Resolutions applied', structuredData: resume.structuredData });
  } catch (error) {
    console.error('Resolve error:', error);
    res.status(500).json({ message: 'Failed to resolve diffs' });
  }
});

// Fetch Resume Data directly for Builder
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    if (resume.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

export default router;
