const express = require("express");
const fs = require("fs");
const path = require("path");
const { auth, onlyRole } = require("../middleware/auth");

const router = express.Router();
const videoUploadDir = path.join(__dirname, "..", "..", "uploads", "videos");
const imageUploadDir = path.join(__dirname, "..", "..", "uploads", "images");
const allowedVideoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function saveUpload({ fileName, data, directory, allowedExtensions, maxBytes, urlPrefix, kind }) {
  if (!fileName || !data) {
    return { error: `${kind} file is required` };
  }

  const extension = path.extname(fileName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return { error: `Only ${kind} files are allowed` };
  }

  const buffer = Buffer.from(data, "base64");
  if (buffer.length > maxBytes) {
    return { error: `${kind} file is too large` };
  }

  await fs.promises.mkdir(directory, { recursive: true });
  const safeBaseName = path.basename(fileName, extension).replace(/[^a-z0-9-_]/gi, "-").slice(0, 60) || kind;
  const savedName = `${Date.now()}-${safeBaseName}${extension}`;
  await fs.promises.writeFile(path.join(directory, savedName), buffer);

  return {
    fileName: savedName,
    fileUrl: `${urlPrefix}/${savedName}`,
  };
}

router.post("/video", auth, onlyRole("teacher"), async (req, res) => {
  const { fileName, data } = req.body;
  const result = await saveUpload({
    fileName,
    data,
    directory: videoUploadDir,
    allowedExtensions: allowedVideoExtensions,
    maxBytes: 100 * 1024 * 1024,
    urlPrefix: "/uploads/videos",
    kind: "video",
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }
  return res.status(201).json({
    fileName: result.fileName,
    videoUrl: result.fileUrl,
  });
});

router.post("/image", auth, async (req, res) => {
  const result = await saveUpload({
    fileName: req.body.fileName,
    data: req.body.data,
    directory: imageUploadDir,
    allowedExtensions: allowedImageExtensions,
    maxBytes: 8 * 1024 * 1024,
    urlPrefix: "/uploads/images",
    kind: "image",
  });

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }
  return res.status(201).json({
    fileName: result.fileName,
    imageUrl: result.fileUrl,
  });
});

module.exports = router;
