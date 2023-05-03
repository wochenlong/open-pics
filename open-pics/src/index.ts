import { Context, Session, Schema, segment, h, Dict } from "koishi";
import { readdir } from "node:fs/promises";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { join } from "node:path";
import { Random } from "koishi";

export const name = "open-pics";

export const usage = `

向世界分享你的xp

在imagePath处填入你的图片文件夹绝对路径即可

使用：xp 3 就是随机发送三张图片


[意见反馈](https://forum.koishi.xyz/t/topic/1727)

`;

export interface Config {
  imagePath: string;
  output: string;
  maxpic: number;
}

export const Config: Schema<Config> = Schema.object({
  imagePath: Schema.string().description("图片文件夹路径").default("D:/img/xp"),
  maxpic: Schema.number().description("单次发送的最大图片数量").default(5),
  output: Schema.union([
    Schema.const("figure").description("以聊天记录形式发送（开发中）"),
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

  async function getRandomFilesIn(path, count) {
    if (count <= 0) {
      return [];
    }

    const files = await readdir(path);
    const randomFiles = [];
    for (let i = 0; i < count; i++) {
      randomFiles.push(join(path, Random.pick(files)));
    }
    return randomFiles;
  }

  async function sendImages(session, count) {
    // 如果 count 不存在或小于 1，就将其设为 1
    if (!count || count < 1) {
      count = 1;
    }
    // 如果 count 大于 maxpic，就发送一条警告消息
    if (count > config.maxpic) {
      await session.send("超过单次图片数量限制，请修改");
      count = 1;
    }

    try {
      const images = await getRandomFilesIn(config.imagePath, count);

      for (let i = 0; i < images.length; i++) {
        await session.send(h.image(pathToFileURL(images[i]).href));
      }
    } catch (error) {
      logger.error(error.message);
      await session.send("获取图片失败，请稍后再试");
    }
  }

  // 定义一个命令
  ctx
    .command("xp [count:number]", "获取若干张随机的 xp 图片")
    .usage(
      `例如：
     xp 3 就是随机发送三张图片；
     
如果 count 不存在、小于 1或大于maxpic，就将其设为 1
      `
    )
    .action(({ session }, count) => sendImages(session, count));
}
