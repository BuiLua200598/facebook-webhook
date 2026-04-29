const express = require("express");
const app = express();
const axios = require("axios");

const PAGE_ACCESS_TOKEN = "DÁN_TOKEN_FACEBOOK_VÀO_ĐÂY";
const VERIFY_TOKEN = "Doankt@100299";

app.use(express.json());

function sendMessage(sender_psid, text) {
  axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: sender_psid },
      message: { text: text },
    }
  );
}

app.get("/", (req, res) => {
  res.send("Backend Facebook Webhook is running!");
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

  if (body.object === "page") {
    body.entry.forEach(function (entry) {
      entry.messaging.forEach(function (webhook_event) {

        if (webhook_event.message) {
          const sender_psid = webhook_event.sender.id;

          sendMessage(
            sender_psid,
            "Chào bạn 👋 Áo ba lỗ đang sale 220K/2 áo 🔥 Bạn cần size gì?"
          );
        }

      });
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});