const User = require("../models/User");

async function submitKyc(req, res) {
  const { kycDocumentUrl } = req.body;
  const teacher = await User.findOneAndUpdate(
    { _id: req.user.id, role: "teacher" },
    { kycDocumentUrl, kycStatus: "pending" },
    { new: true }
  );

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  return res.json({ message: "KYC submitted", teacher });
}

async function verifyKycForDemo(req, res) {
  const teacher = await User.findByIdAndUpdate(req.params.teacherId, { kycStatus: "verified" }, { new: true });
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }
  return res.json({ message: "KYC verified", teacher });
}

module.exports = { submitKyc, verifyKycForDemo };
