import { Context, h, Logger, Schema } from "koishi";

export const name = "teanch";
export const usage = `发送图片`;
export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context, _config: Config) {
  ctx.command("piv", "获取图片信息").action(async ({ session }) => {
    const response = await ctx.http.get(`https://api.lolicon.app/setu/v2`);
    const data = response.data;
    const tags = data[0].tags;
    await session.send(`tags: ${tags.join(", ")}`);
  });
}
