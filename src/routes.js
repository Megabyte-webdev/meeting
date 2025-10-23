// routes.js
import express from "express";
import {
  createMeeting,
  validateMeeting,
  generateVideoSDKToken,
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
    res.json({ valid: true, data: meeting });
  } catch (err) {
    res.status(404).json({ valid: false, error: "Invalid meeting ID" });
  }
});

// Generate token for participant
router.post("/get-token", async (req, res) => {
  try {
    const { participantId, role } = req.body;

    if (!participantId)
      return res.status(400).json({ error: "participantId required" });

    const token = generateVideoSDKToken(participantId, role);
    res.json({ token });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;
