import { Context, Session, Schema, segment, h } from "koishi";
import { readdir } from "node:fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";
import * as fs from "fs";
import { join } from "node:path";
import { Random } from "koishi";

export const name = "open-pics";

export const usage = `

向世界分享你的xp

在imagePath处填入你的图片文件夹绝对路径即可


[意见反馈](https://forum.koishi.xyz/t/topic/1727)

`;

export interface Config {
  imagePath: string;
  output: string;
}

export const Config: Schema<Config> = Schema.object({
  imagePath: Schema.string().description("图片文件夹路径").default("D:/img/xp"),
  output: Schema.union([
    Schema.const("figure").description("以聊天记录形式发送"),
    Schema.const("image").description("以图片形式发送"),
  ])
    .description("输出方式。")
    .default("image"),
}).description("进阶设置");
export const using = [];

// 导出一个异步函数，接收两个参数：Context 和 Config
export async function apply(ctx: Context, config: Config) {
  // 获取 logger 对象
  const logger = ctx.logger("open-pics");

  // 定义一个返回指定范围内随机整数的函数

  async function getRandomFileIn(path) {
    const files = await readdir(path);
    return join(path, Random.pick(files));
  }

  // 定义一个命令处理函数
  async function handleCommand(session: Session) {
    try {
      if (config.output === "figure") {
        // 如果 `output_type` 的值为 "figure"，则将图片以聊天记录形式发送
        const result = segment("figure");
        result.children.push(
          segment("message", {
            userId: session.selfId,
            nickname: "system",
          })
        );
        result.children.push(
          segment("image", {
            src: pathToFileURL(
              resolve(__dirname, await getRandomFileIn(config.imagePath))
            ).href,
          })
        );
        return result;
      } else {
        // 如果 `output_type` 的值不是 "figure"，则以图片形式发送
        return h.image(
          pathToFileURL(
            resolve(__dirname, await getRandomFileIn(config.imagePath))
          ).href
        );
      }
    } catch (error) {
      logger.error(error.message);
      await session.send("获取图片失败，请稍后再试");
    }
  }
  // 定义一个命令
  ctx
    .command("xp", "获取一张随机的 xp 图片")
    .alias("美图")
    .action(({ session }, prompt) => handleCommand(session));
}
