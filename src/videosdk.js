// videosdk.js
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { VIDEOSDK_API_KEY, VIDEOSDK_SECRET, VIDEOSDK_BASE_URL } = process.env;
// 🔐 Token for REST API calls (server → VideoSDK)
export const generateVideoSDKToken = (
  participantId = "server",
  role = "guest",
) => {
  const permissions =
    role === "host" ? ["allow_join", "allow_mod"] : ["ask_join"];

  const payload = {
    apikey: VIDEOSDK_API_KEY,
    permissions,
    version: 2,
  };

  // optional but fine to include
  if (participantId) payload.participantId = participantId;

  const token = jwt.sign(payload, VIDEOSDK_SECRET, {
    algorithm: "HS256",
    expiresIn: "120m",
  });

  return token;
};

// Create a meeting
export const createMeeting = async () => {
  const token = generateVideoSDKToken("server", "host"); // server acts as host
  const response = await axios.post(
    `${VIDEOSDK_BASE_URL}/rooms`,
    {},
    { headers: { Authorization: token } },
  );

  return response.data; // { roomId, ... }
};

// Validate an existing meeting
export const validateMeeting = async (meetingId) => {
  const token = generateVideoSDKToken("server", "host");

  const response = await axios.get(
    `${VIDEOSDK_BASE_URL}/rooms/validate/${meetingId}`,
    {
      headers: {
        // ❗ NO "Bearer " prefix
        Authorization: token,
      },
    },
  );

  return response.data;
};

export const getMeetingRecordings = async (meetingId) => {
  const token = generateVideoSDKToken("server", "host");
  const response = await axios.get(`${VIDEOSDK_BASE_URL}/recordings`, {
    params: { roomId: meetingId },
    headers: {
      // ❗ NO "Bearer " prefix
      Authorization: token,
    },
  });

  return response.data;
};

// Get all sessions for a meeting
export const getMeetingSessions = async (meetingId) => {
  const token = generateVideoSDKToken("server", "host");

  const response = await axios.get(
    `${VIDEOSDK_BASE_URL}/sessions/?roomId=${meetingId}`,
    {
      headers: {
        Authorization: token, // no "Bearer " prefix
      },
    },
  );

  return response.data; // array of session objects
};

// Get participants of a meeting
export const getMeetingParticipants = async (meetingId) => {
  const token = generateVideoSDKToken("server", "host");

  const response = await axios.get(
    `${VIDEOSDK_BASE_URL}/rooms/participants/${meetingId}`,
    {
      headers: {
        Authorization: token, // no "Bearer " prefix
      },
    },
  );

  return response.data; // array of participant objects
};
