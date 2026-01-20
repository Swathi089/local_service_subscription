// controllers/provider.controller.js

const getDashboard = async (req, res) => {
  res.json({ success: true, message: 'Provider dashboard' });
};

const getProfile = async (req, res) => {
  res.json({ success: true, data: {} });
};

const updateProfile = async (req, res) => {
  res.json({ success: true, message: 'Provider profile updated' });
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile
};
