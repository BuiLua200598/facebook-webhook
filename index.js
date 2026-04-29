const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

const PAGE_ACCESS_TOKEN = "EAAcJ60iUEfYBRaKPgMttm3mtSD128qEH6L2loWu2EGAhCvS04CyUtL21p3JeCoJ2thAFNHLHA6C8KsBcLqGAP1uuRNZBcUEyzqGYqZCYglik1poh4DYRa6gZCvD9NQc247VsuCq7AqiAHgH4XRDTN6UVN80pol1ru2YiKCmbKS05rMSoGkFGIvKNxvZBV3oyZAUdBLVeDcQZDZD";
const VERIFY_TOKEN = "Doankt@100299";

let conversations = [];

app.use(express.json());

function sendMessage(sender_psid, text) {
  return axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender_psid },
      message: { text: text },
    }
  );
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "vpage.html"));
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("Facebook data:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.sender && event.sender.id) {
          const senderId = event.sender.id;
          const text = event.message.text || "";

          conversations.push({
            senderId,
            text,
            time: new Date().toISOString(),
            direction: "in",
          });

          sendMessage(
            senderId,
            "Chào bạn 👋 Áo ba lỗ đang sale 220K/2 áo 🔥 Bạn cần size gì?"
          ).catch((err) => {
            console.error("Send message error:", err.response?.data || err.message);
          });
        }
      });
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/api/conversations", (req, res) => {
  res.json(conversations);
});

app.post("/api/send-message", async (req, res) => {
  const { senderId, text } = req.body;

  if (!senderId || !text) {
    return res.status(400).json({ success: false, error: "Missing senderId or text" });
  }

  try {
    await sendMessage(senderId, text);

    conversations.push({
      senderId,
      text,
      time: new Date().toISOString(),
      direction: "out",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("API send error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Send failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});