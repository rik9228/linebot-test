import crypto from "crypto";
// import {
// 	LINE_SIGNATURE_HTTP_HEADER_NAME,
// 	type TemplateMessage,
// 	type TextMessage,
// 	WebhookEvent,
// 	messagingApi,
// 	middleware,
// 	validateSignature,
// } from "@line/bot-sdk";

// const { MessagingApiClient } = messagingApi;

import dotenv from "dotenv";
import express from "express";

// interface MicroCMSWebhookEvent {
// 	/** リクエストヘッダー */
// 	headers: {
// 		/** microCMSの署名 */
// 		"x-microcms-signature": string;
// 		[key: string]: string;
// 	};
// 	/** リクエストボディ（JSON文字列） */
// 	body: string;
// }

dotenv.config();

const config = {
	channelSecret: process.env.CHANNEL_SECRET ?? "",
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? "",
};

const PORT = process.env.PORT || 3000;
const app = express();

app.post("/", (req, res) => {
	Promise.all(req.body.events.map(handler)).then((result) => res.json(result));
});

app.listen(PORT, () => {
	console.log(`サーバーがポート${PORT}で起動しました`);
});

// biome-ignore lint: reason
const handler = async (event: any) => {
	// microCMSからのリクエストかを検証
	const signature = event.headers["x-microcms-signature"];
	const expectedSignature = crypto
		.createHmac("sha256", process.env.MICROCMS_SECRET ?? "")
		.update(event.body)
		.digest("hex");

	if (
		!crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		)
	) {
		throw new Error("署名認証エラー");
	}

	console.log("通りました");

	// // リクエストボディからコンテンツIDとコンテンツの内容を取得
	// const data = event.body;
	// const { id, contents } = JSON.parse(data);

	// // 更新の場合は処理を終了
	// const isUpdated = contents.old !== null;
	// if (isUpdated) return 200;

	// // 公開したコンテンツの情報を取得
	// const { title, eyecatch, description } = contents.new.publishValue;

	// // Messaging APIにリクエストする際のメッセージオブジェクトに整形
	// const obj = {
	// 	messages: [
	// 		{
	// 			type: "text",
	// 			text: "＼ ブログを更新しました ／",
	// 		},
	// 		{
	// 			type: "template",
	// 			altText: "ブログを更新しました",
	// 			template: {
	// 				type: "buttons",
	// 				thumbnailImageUrl: eyecatch.url,
	// 				imageSize: "contain",
	// 				title: title,
	// 				text: description,
	// 				actions: [
	// 					{
	// 						type: "uri",
	// 						label: "詳しく見る",
	// 						uri: `https://example.com/blogs/${id}`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	],
	// };

	// LINE Messaging APIにリクエスト
	// try {
	// 	const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			Authorization: `Bearer ${process.env.CHANEL_ACCESS_TOKEN ?? ""}`,
	// 		},
	// 		body: JSON.stringify({
	// 			type: "text",
	// 			text: "＼ ブログを更新しました ／",
	// 		}),
	// 	});
	// 	return res.json();
	// } catch (e) {
	// 	console.error(e);
	// 	return 500;
	// }
};
