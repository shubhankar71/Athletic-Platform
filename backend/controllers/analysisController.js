const mongoose = require('mongoose');
const Analysis = require('../models/Analysis.js');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Sends Cloudinary video URL to Python ML service for analysis,
 * saves the result to MongoDB, and returns JSON payload.
 */
const runAnalysis = async (req, res) => {
  try {
    const { videoUrl, publicId } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'videoUrl is required.' });
    }

    console.log(`[Backend API] Requesting ML service analysis for video URL: ${videoUrl}`);

    // Call Python FastAPI ML Service
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/ml/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_url: videoUrl,
        user_id: userId ? userId.toString() : null,
      }),
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      throw new Error(`ML Service responded with status ${mlResponse.status}: ${errText}`);
    }

    const mlResult = await mlResponse.json();

    // Construct visualization URLs from ML service output filenames
    const vizData = mlResult.visualizations || {};
    const formattedVisualizations = {
      landmarkTrajectory: vizData.landmarkTrajectory ? `${ML_SERVICE_URL}/api/ml/visualizations/${vizData.landmarkTrajectory}` : '',
      jointAngles: vizData.jointAngles ? `${ML_SERVICE_URL}/api/ml/visualizations/${vizData.jointAngles}` : '',
      stability: vizData.stability ? `${ML_SERVICE_URL}/api/ml/visualizations/${vizData.stability}` : '',
      scoreBreakdown: vizData.scoreBreakdown ? `${ML_SERVICE_URL}/api/ml/visualizations/${vizData.scoreBreakdown}` : '',
      predictionConfidence: vizData.predictionConfidence ? `${ML_SERVICE_URL}/api/ml/visualizations/${vizData.predictionConfidence}` : '',
    };
    mlResult.visualizations = formattedVisualizations;
    mlResult.videoUrl = videoUrl;

    // Persist analysis record in MongoDB with user ownership reference
    let savedRecord = null;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const analysisDoc = new Analysis({
          user: userId,
          videoUrl: videoUrl,
          cloudinaryPublicId: publicId || '',
          stroke: mlResult.prediction.stroke,
          confidence: mlResult.prediction.confidence,
          confidenceBreakdown: mlResult.prediction.confidence_breakdown,
          scores: mlResult.scores,
          bodyAnalysis: mlResult.body_analysis,
          feedback: mlResult.feedback,
          coachingText: mlResult.coaching_text,
          videoMetadata: mlResult.video_metadata,
          pdfFilename: mlResult.pdf_filename,
          pdfDownloadUrl: mlResult.pdf_download_url,
          visualizations: formattedVisualizations,
          status: 'completed',
        });

        savedRecord = await analysisDoc.save();
      } catch (dbErr) {
        console.warn('[Backend API] Failed to save analysis to MongoDB (proceeding anyway):', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      analysisId: savedRecord ? savedRecord._id : null,
      data: mlResult,
    });
  } catch (error) {
    console.error('[Backend API] Analysis error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete video ML analysis.',
    });
  }
};


/**
 * Get analysis history ONLY for current logged in athlete (Ownership isolation)
 */
const getMyAnalyses = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && req.user && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const query = { user: req.user._id };
      const sessions = await Analysis.find(query).sort({ createdAt: -1 }).limit(50);
      return res.status(200).json({ success: true, data: sessions });
    }
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching analysis history:', error.message);
    return res.status(200).json({ success: true, data: [] });
  }
};

/**
 * Get single analysis session by ID with ownership verification
 */
const getAnalysisById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const analysis = await Analysis.findById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Analysis session not found.' });
      }

      if (req.user && analysis.user && analysis.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own analysis records.',
        });
      }

      return res.status(200).json({ success: true, data: analysis });
    }
    return res.status(404).json({ success: false, message: 'Analysis session not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving analysis session.' });
  }
};

/**
 * PDF download route with ownership check
 */
const getAnalysisPdf = async (req, res) => {
  try {
    let pdfFilename = req.params.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const analysis = await Analysis.findById(req.params.id);
      if (analysis) {
        if (req.user && analysis.user && analysis.user.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only download your own analysis PDF reports.',
          });
        }
        if (analysis.pdfFilename) {
          pdfFilename = analysis.pdfFilename;
        }
      }
    }

    // Proxy PDF fetch from Python ML FastAPI Service
    const pdfRes = await fetch(`${ML_SERVICE_URL}/api/ml/pdf/${pdfFilename}`);
    if (!pdfRes.ok) {
      return res.status(404).json({ success: false, message: 'PDF report file missing on ML service.' });
    }

    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error generating PDF report download.' });
  }
};

module.exports = {
  runAnalysis,
  getMyAnalyses,
  getAnalysisHistory: getMyAnalyses,
  getAnalysisById,
  getAnalysisPdf,
};
