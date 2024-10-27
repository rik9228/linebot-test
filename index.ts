import crypto from "crypto";
import {
	Client,
	type TemplateMessage,
	type TextMessage,
	middleware,
} from "@line/bot-sdk";

import dotenv from "dotenv";
import express from "express";

interface MicroCMSWebhookEvent {
	/** リクエストヘッダー */
	headers: {
		/** microCMSの署名 */
		"x-microcms-signature": string;
		[key: string]: string;
	};
	/** リクエストボディ（JSON文字列） */
	body: string;
}

dotenv.config();

const config = {
	channelSecret: process.env.CHANNEL_SECRET ?? "",
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN ?? "",
};

const PORT = process.env.PORT || 3000;
const app = express();

app.post("/", middleware(config), (req, res) => {
	Promise.all(req.body.events.map(handleEvent)).then((result) =>
		res.json(result),
	);
});

app.listen(PORT);

async function handleEvent(event: MicroCMSWebhookEvent) {
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

	console.log('signature', signature);

	// リクエストボディからコンテンツIDとコンテンツの内容を取得
	const data = event.body;
	const { id, contents } = JSON.parse(data);

	// 更新の場合は処理を終了
	const isUpdated = contents.old !== null;
	if (isUpdated) return 200;

	// 公開したコンテンツの情報を取得
	const { title, eyecatch, description } = contents.new.publishValue;

	const SITE_URL = "https://motivation-blog.pages.dev/posts";

	// Messaging APIにリクエストする際のメッセージオブジェクトに整形
	const obj: (TextMessage | TemplateMessage)[] = [
		{
			type: "text",
			text: "＼ ブログを更新しました ／",
		},
		{
			type: "template",
			altText: "ブログを更新しました",
			template: {
				type: "buttons",
				thumbnailImageUrl: eyecatch.url,
				imageSize: "contain",
				title: title,
				text: description,
				actions: [
					{
						type: "uri",
						label: "詳しく見る",
						uri: `${SITE_URL}/${id}`,
					},
				],
			},
		},
	];

	const GROUP_ID = "C64906dbc94e6eee18e9341ad28491b89";

	// LINE Messaging APIにリクエスト
	try {
		const client = new Client(config);
		await client.pushMessage(GROUP_ID, obj);
	} catch (e) {
		console.error(e);
		return 500;
	}
}
