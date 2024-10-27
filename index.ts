import crypto from "crypto";
import {
	LINE_SIGNATURE_HTTP_HEADER_NAME,
	type TemplateMessage,
	type TextMessage,
	WebhookEvent,
	messagingApi,
	middleware,
	validateSignature,
} from "@line/bot-sdk";

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
	channelSecret: process.env.CHANNEL_ACCESS_TOKEN ?? "",
};

const PORT = process.env.PORT || 3000;
const app = express();

// JSONボディの解析を有効化
app.use(express.json());

/**
 * microCMSからのWebhookを処理するエンドポイント
 */ app.post("/", middleware(config), async (req, res) => {
	const signature = req.headers["x-microcms-signature"] as string;
	const body = JSON.stringify(req.body);

	// 署名の検証
	const isValid = verifySignature(signature, body);

	if (isValid) {
		// 署名が有効な場合、Webhookの内容をログに出力
		console.log("有効なWebhookを受信しました:");
		console.log(JSON.stringify(req.body, null, 2));

		// LINE Messaging APIにリクエスト
		try {
			const res = await fetch("https://api.line.me/v2/bot/message/broadcast", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.CHANEL_ACCESS_TOKEN ?? ""}`,
				},
				body: JSON.stringify({
					to: "C64906dbc94e6eee18e9341ad28491b89",
					messages: [
						{
							type: "text",
							text: `こんにちは ${new Date()}`,
						},
					],
				}),
			});
			return res.json();
		} catch (e) {
			console.error(e);
			return 500;
		}

		// res.sendStatus(200);
	} else {
		// 署名が無効な場合、エラーメッセージをログに出力
		console.error("無効な署名です。不正なリクエストの可能性があります。");
		res.sendStatus(200); // 要件に従い、エラー時も200を返す
	}
});

/**
 * 署名を検証する関数
 * @param signature リクエストヘッダーの署名
 * @param body リクエストボディ
 * @returns 署名が有効な場合はtrue、そうでない場合はfalse
 */
function verifySignature(signature: string, body: string): boolean {
	const expectedSignature = crypto
		.createHmac("sha256", process.env.MICROCMS_SECRET ?? "")
		.update(body)
		.digest("hex");

	return crypto.timingSafeEqual(
		Buffer.from(signature),
		Buffer.from(expectedSignature),
	);
}

// サーバーの起動
app.listen(PORT, () => {
	console.log(`サーバーがポート${PORT}で起動しました`);
});
