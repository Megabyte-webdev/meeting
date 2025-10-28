// videosdk.js
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const { VIDEOSDK_API_KEY, VIDEOSDK_SECRET, VIDEOSDK_BASE_URL } = process.env;

// Generate a JWT token manually for VideoSDK REST API
export const generateVideoSDKToken = (participantId, role = "guest") => {
  const permissions =
    role === "host" ? ["allow_join", "allow_mod"] : ["ask_join"];

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  const payload = Buffer.from(
    JSON.stringify({
      apikey: VIDEOSDK_API_KEY,
      participantId,
      permissions,
      version: 2,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", VIDEOSDK_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
};

// Create a meeting
export const createMeeting = async () => {
  const token = generateVideoSDKToken("server", "host"); // server acts as host
  const response = await axios.post(
    `${VIDEOSDK_BASE_URL}/rooms`,
    {},
    { headers: { Authorization: token } }
  );

  return response.data; // { roomId, ... }
};

// Validate an existing meeting
export const validateMeeting = async (meetingId) => {
  const token = generateVideoSDKToken("server", "host");
  const response = await axios.get(`${VIDEOSDK_BASE_URL}/rooms/${meetingId}`, {
    headers: { Authorization: token },
  });

  return response.data;
};
