const Plan = require('../models/Plan');

// @desc    Get all plans (Public / Member can see active, Admin can see all)
// @route   GET /api/plans
// @access  Public / Private
exports.getPlans = async (req, res) => {
  try {
    const query = {};
    // If not admin, only show active plans
    if (!req.user || req.user.role !== 'admin') {
      query.active = true;
    }
    const plans = await Plan.find(query).sort({ price: 1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single plan by ID
// @route   GET /api/plans/:id
// @access  Public
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private (Admin only)
exports.createPlan = async (req, res) => {
  try {
    const { name, description, durationMonths, price, features, tag, active } = req.body;

    const plan = await Plan.create({
      name,
      description,
      durationMonths,
      price,
      features: Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : []),
      tag: tag || '',
      active: active !== undefined ? active : true,
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private (Admin only)
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const { name, description, durationMonths, price, features, tag, active } = req.body;
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (durationMonths !== undefined) plan.durationMonths = durationMonths;
    if (price !== undefined) plan.price = price;
    if (features !== undefined) {
      plan.features = Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : []);
    }
    if (tag !== undefined) plan.tag = tag;
    if (active !== undefined) plan.active = active;

    await plan.save();
    res.json({ success: true, message: 'Plan updated successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private (Admin only)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
