import type {
	MicroCMSContentId,
	MicroCMSDate,
	MicroCMSImage,
} from "microcms-js-sdk";

type Content<T> = T & MicroCMSDate & MicroCMSContentId;

type TagCotent = {
	name: string;
};

type Tag = Content<TagCotent>;

type BlogContent = {
	title: string;
	content: string;
	eyecatch?: MicroCMSImage;
	tags: Tag[];
	author: string[];
};

type Blog = Content<BlogContent>;

type BlogStatus = {
	id: string;
	status: string[];
	draftKey: string | null;
	publishValue: Blog | null;
	draftValue: Blog | null;
};

type Contents = Record<"old" | "new", BlogStatus | null>;

/**
 * microCMS Webhookによって返されるデータ構造
 * @description https://github.com/y-hiraoka/zenn.dev/blob/master/articles/web-push-with-microcms-and-fcm.md
 */

export type MicroCMSWebhookBody = {
	service: string;
	api: string;
	id: string | null;
	type: "new" | "edit" | "delete";
	contents: Contents | null;
};
