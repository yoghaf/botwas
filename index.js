const express = require("express");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const { LocalAuth, Client } = require("whatsapp-web.js");
const app = express();

const port = process.env.PORT || 3000;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "TOMBOT" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
const getOllamaChatCompletion = async (message) => {
  try {
    const response = await axios.post(
      "http://localhost:11434/chat/completions",
      {
        model: "deepseeker-r1:32b",
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: "Hello, how can I help you?" },
        ],
        stream: false,
      }
    );
    const content = response.data.message.content;
    console.log(content);
    return content;
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    throw new Error("Failed to fetch chat completion");
  }
};
client.on("qr", (qr) => {
  // Generate and display the QR code in the terminal
  qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => {
  console.log("Authenticated successfully!");
});
client.on("ready", () => {
  console.log("Client is ready!");
});
client.on("message", async (message) => {
  const messageBody = message.body.trim().toLowerCase();
  if (messageBody.startsWith("!tombot")) {
    const userQuestion =
      message.body.substring(7) +
      "jawab dengan bahasa karakter dan sifat tsundere anime wanita";
    const answer = await getOllamaChatCompletion(userQuestion);
  }
});

client.initialize();
app.listen(port, () => console.log(`Server is running on port ${port}`));
