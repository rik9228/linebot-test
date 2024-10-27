import { Client } from "@line/bot-sdk";
import dotenv from "dotenv";
dotenv.config();
const clientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.CHANNEL_SECRET,
};

const GROUP_ID = "C64906dbc94e6eee18e9341ad28491b89";
async function sendMessage() {
  const client = new Client(clientConfig);
  const text = "hoge";
  const response = {
    type: "text",
    text,
  };
  await client.pushMessage(GROUP_ID, response);
}

sendMessage();