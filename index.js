import { Client, middleware } from "@line/bot-sdk";
import express from "express";

const config = {
	channelSecret: process.env.CHANNEL_SECRET,
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new Client(config);

const PORT = process.env.PORT || 3000;
const app = express();

app.post("/", middleware(config), (req, res) => {
	Promise.all(req.body.events.map(handleEvent)).then((result) =>
		res.json(result),
	);
});

app.listen(PORT);

function handleEvent(event) {
	if (event.type !== "message" || event.message.type !== "text") {
		return Promise.resolve(null);
	}

	console.log(JSON.stringify(event));
	console.log("--------------------");

	return client.replyMessage(event.replyToken, {
		type: "text",
		text: event.message.text,
	});
}
