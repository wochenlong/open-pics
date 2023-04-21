import { Context, Schema, Session, h } from "koishi";
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

`;

export interface Config {
  imagePath: string;
}

export const Config: Schema<Config> = Schema.object({
  imagePath: Schema.string().description("图片文件夹路径").default("D:/img/xp"),
});

export const using = [];

// 导出一个异步函数，接收两个参数：Context 和 Config
export async function apply(ctx: Context, config: Config) {
  // 获取 logger 对象
  const logger = ctx.logger("open-pics");

  // 定义一个返回指定范围内随机整数的函数
  function mathRandomInt(a: number, b: number): number {
    // 如果 a 大于 b，则交换 a 和 b 的值
    if (a > b) {
      [a, b] = [b, a]; // 使用解构赋值交换 a 和 b 的值
    }
    // 返回 a 到 b 之间的随机整数
    return Math.floor(Math.random() * (b - a + 1) + a);
  }
  async function getRandomFileIn(path) {
    const files = await readdir(path);
    return join(path, Random.pick(files));
  }

  // 定义一个命令处理函数
  async function handleCommand(session: Session) {
    try {
      // 获取图片文件夹中的所有文件名
      const files = fs.readdirSync(config.imagePath);
      // 随机选择一个文件名
      const fileName = files[mathRandomInt(0, files.length - 1)];

      // 发送本地图片消息

      await session.send(
        h.image(
          pathToFileURL(
            resolve(__dirname, await getRandomFileIn(config.imagePath))
          ).href
        )
      );
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
