import crypto from "crypto";

import dotenv from "dotenv";
import express from "express";
import type { MicroCMSWebhookBody } from "./type.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

function App() {
	// デバッグ用ミドルウェア
	app.use((req, res, next) => {
		console.log("リクエストヘッダー:", req.headers);
		next();
	});

	// JSONボディの解析を有効化
	app.use(express.json());

	/**
	 * microCMSからのWebhookを処理するエンドポイント
	 */

	app.post("/webhook", async (req, res) => {
		/**
		 * 署名を検証しないといけないらしい（？）
		 */
		const signature = req.headers["x-microcms-signature"] as string;
		const body = JSON.stringify(req.body);

		// 署名の検証
		const isValid = verifySignature(signature, body);

		if (isValid) {
			// 署名が有効な場合、Webhookの内容をログに出力
			console.log("有効なWebhookを受信しました:");
			console.log(JSON.stringify(req.body, null, 2));

			// リクエストボディからコンテンツIDとコンテンツの内容を取得
			const data = body;
			const { id, contents } = JSON.parse(data) as MicroCMSWebhookBody;

			try {
				const res = await fetch("https://api.line.me/v2/bot/message/push", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN ?? ""}`,
					},
					body: JSON.stringify({
						to: "C64906dbc94e6eee18e9341ad28491b89",
						messages: [
							{
								type: "text",
								text: "＼ ブログを更新しました ／",
							},
							{
								type: "template",
								altText: "ブログを更新しました",
								template: {
									type: "buttons",
									thumbnailImageUrl:
										contents?.new?.publishValue?.eyecatch?.url ??
										"https://motivation-blog.pages.dev/img_thumbnail.webp",
									imageAspectRatio: "rectangle",
									imageSize: "cover",
									imageBackgroundColor: "#FFFFFF",
									title: contents?.new?.publishValue?.title,
									text: contents?.new?.publishValue?.content,
									defaultAction: {
										type: "uri",
										label: "詳しくみる",
										uri: `https://motivation-blog.pages.dev/posts/${id}`,
									},
									actions: [
										{
											type: "uri",
											label: "詳しくみる",
											uri: `https://motivation-blog.pages.dev/posts/${id}`,
										},
									],
								},
							},
						],
					}),
				});

				console.log("res", res);
				return res.json();
			} catch (e) {
				console.error(e);
				return 500;
			}
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
}

App();
