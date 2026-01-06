// routes.js
import express from "express";
import {
  createMeeting,
  validateMeeting,
  generateVideoSDKToken,
  getMeetingRecordings,
} from "./videosdk.js";

const router = express.Router();

// Create meeting
router.post("/create-meeting", async (req, res) => {
  try {
    const meeting = await createMeeting();
    res.json({ meetingId: meeting.roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

// Validate meeting
router.get("/validate/:id", async (req, res) => {
  try {
    const meeting = await validateMeeting(req.params.id);
    return res.json({ valid: true, data: meeting });
  } catch (err) {
    console.error("Validation error:", err?.response?.data || err?.message);

    let message = "Unknown error occurred";

    const status = err?.response?.status;

    if (status === 404) {
      message = "Meeting ID does not exist or has expired";
    } else if (status === 401) {
      message = "Authentication failed. Invalid VideoSDK credentials.";
    } else if (status === 400) {
      message = "Invalid Meeting ID format.";
    } else if (status === 500) {
      message = "Video server error. Please try again.";
    } else {
      message = "Unable to validate meeting. Please try again.";
    }

    return res.status(400).json({
      valid: false,
      error: message,
    });
  }
});

// Generate token for participant
router.post("/get-token", async (req, res) => {
  try {
    const { participantId, role } = req.body;

    if (!participantId)
      return res.status(400).json({ error: "participantId required" });

    const token = await generateVideoSDKToken(participantId, role);
    res.json({ token });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Failed to generate token" });
  }
});

router.get("/recordings/:meetingId", async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (!meetingId) {
      return res.status(400).json({ error: "meetingId is required" });
    }

    const recordings = await getMeetingRecordings(meetingId);

    return res.json({
      meetingId,
      recordings,
    });
  } catch (err) {
    console.error(
      "Recording fetch error:",
      err?.response?.data || err?.message
    );

    const status = err?.response?.status || 500;

    let message = "Failed to fetch meeting recordings";

    if (status === 404) {
      message = "No recordings found for this meeting";
    } else if (status === 401) {
      message = "Authentication failed. Invalid VideoSDK credentials.";
    }

    return res.status(status).json({ error: message });
  }
});

export default router;
