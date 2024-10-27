import { Client, middleware } from "@line/bot-sdk";
import express from "express";

import dotenv from "dotenv";
dotenv.config();

/**
 * グループIDを確認するためのロジック
 */
function EchoGroupInfomation() {
	const config = {
		channelSecret: process.env.CHANNEL_SECRET ?? "",
		channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? "",
	};

	const client = new Client(config);

	const PORT = process.env.PORT || 3000;
	const app = express();

	/**
	 * ルートパスへのGETリクエストを処理します
	 * サーバーの状態を確認するためのエンドポイントです
	 */
	app.get("/", (req, res) => {
		res.send("サーバーは正常に動作しています。ポート3000で待ち受け中です。");
	});

	app.post("/", middleware(config), (req, res) => {
		Promise.all(req.body.events.map(handleEvent)).then((result) =>
			res.json(result),
		);
	});

	/**
	 * サーバーを起動し、ローカルホストでリッスンします
	 */
	app.listen(PORT, () => {
		console.log(`サーバーがポート${PORT}で起動しました`);
	});

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
}

EchoGroupInfomation();
