const Certificate = require("../models/Certificate");

async function listCertificates(req, res) {
  const certificates = await Certificate.find({ student: req.user.id })
    .populate({
      path: "course",
      select: "courseName teacher",
      populate: { path: "teacher", select: "fullName" }
    })
    .sort({ issuedAt: -1 });
  return res.json(certificates);
}

module.exports = { listCertificates };
