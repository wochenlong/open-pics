import { Context, h, Logger, Schema } from "koishi";

export interface Config {
  sendImage?: boolean;
  sendTitle?: boolean;
  sendAuthor?: boolean;
  sendPid?: boolean;
  sendTags?: boolean;
}

export const Config: Schema<Config> = Schema.object({
  sendImage: Schema.boolean().description("是否发送图片").default(false),
  sendTitle: Schema.boolean().description("是否发送标题").default(true),
  sendAuthor: Schema.boolean().description("是否发送作者").default(true),
  sendPid: Schema.boolean().description("是否发送PID").default(true),
  sendTags: Schema.boolean().description("是否发送标签").default(true),
});

export const name = "teanch";
export const usage = `发送图片`;

export function apply(ctx: Context, config: Config) {
  ctx.command("piv", "获取图片信息").action(async ({ session }) => {
    const response = await ctx.http.get(`https://api.lolicon.app/setu/v2`);
    const data = response.data;
    if (data.length === 0) {
      await session.send("没有找到图片");
      return;
    }
    const title = data[0].title;
    const author = data[0].author;
    const tags = data[0].tags.join(", ");
    const r18 = data[0].r18;
    const pid = data[0].pid;
    const urls = data[0].urls;
    const originalUrl = urls.original;

    let message = `图片链接：${originalUrl}\n`;
    if (config.sendTitle) message += `标题: ${title}\n`;
    if (config.sendAuthor) message += `作者：${author}\n`;
    if (config.sendPid) message += `pid：${pid}\n`;
    if (config.sendTags) message += `tags: ${tags}\n`;
    await session.send(message);

    if (r18) {
      await session.send("监测到r18标签，已停止发送原图");
    } else {
      if (config.sendImage) {
        await session.send("原图比较大，美少女正在努力发送中");
        session.send(h("image", { url: originalUrl }));
      }
    }
  });
}
