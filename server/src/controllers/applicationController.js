import JobApplication from '../models/JobApplication.js';

export const getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createApplication = async (req, res) => {
  try {
    const { companyName, jobTitle, status, location, salary, notes, dateApplied } = req.body;
    
    const newApplication = new JobApplication({
      userId: req.user.id,
      companyName,
      jobTitle,
      status: status || 'Wishlist',
      location,
      salary,
      notes,
      dateApplied
    });

    const savedApp = await newApplication.save();
    res.status(201).json(savedApp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create application' });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    // Check ownership
    if (app.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedApp = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedApp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update application' });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    // Check ownership
    if (app.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await app.deleteOne();
    res.json({ message: 'Application removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete application' });
  }
};
