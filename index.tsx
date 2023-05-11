import { Context, h, Logger, Schema } from "koishi";

export const name = "teanch";
export const usage = `发送图片`;
export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context, _config: Config) {
  ctx.command("piv", "获取图片信息").action(async ({ session }) => {
    const response = await ctx.http.get(`https://api.lolicon.app/setu/v2`);
    const data = response.data;
    if (data.length === 0) {
      await session.send("没有找到图片");
      return;
    }
    const title = data[0].title;
    const pid = data[0].pid;
    const urls = data[0].urls;
    const originalUrl = urls.original;
    await session.send(
      ` 标题: ${title} ，pid： ${pid} 图片链接：${originalUrl}`
    );
    session.send(h("image", { url: originalUrl }));
  });
}
