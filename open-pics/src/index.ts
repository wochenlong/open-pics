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

使用：

xp n 随机发送n张图片; xp 3 就是随机发送三张图片


pivs：类似于p站图源，无需代理，api：https://api.lolicon.app/setu/v2

图片的规格默认为regular，在1.1.5版本中可以修改

[意见反馈](https://forum.koishi.xyz/t/topic/1727)

`;

export interface Config {
  imagePath: string;
  output: string;
  maxpic: number;
  sendImage?: boolean;
  sendTitle?: boolean;
  sendAuthor?: boolean;
  sendPid?: boolean;
  sendTags?: boolean;
  size: string; // 新增配置项，用于设置发送图片的规格
}

export const Config: any = Schema.intersect([
  Schema.object({
    imagePath: Schema.string()
      .description("图片文件夹路径")
      .default("D:/img/xp"),
    maxpic: Schema.number().description("单次发送的最大图片数量").default(5),
    output: Schema.union([
      Schema.const("figure").description("以聊天记录形式发送（开发中）"),
      Schema.const("image").description("以图片形式发送"),
    ])
      .description("输出方式。")
      .default("image"),
  }).description("本地图源设置"),
  Schema.object({
    sendImage: Schema.boolean().description("是否发送图片").default(false),
    sendTitle: Schema.boolean().description("是否发送标题").default(true),
    sendAuthor: Schema.boolean().description("是否发送作者").default(true),
    sendPid: Schema.boolean().description("是否发送PID").default(true),
    sendTags: Schema.boolean().description("是否发送标签").default(true),
  }).description("pivs设置"),
  Schema.object({
    size: Schema.union(["original", "regular", "small"])
      .role("radio")
      .description("发送图片的规格")
      .default("regular"),
  }).description("高级设置"),
]);
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
      `xp n 随机发送n张图片
   例 ：xp 3 就是随机发送3张图片；

如果 count 不存在、小于 1或大于maxpic，就将其设为 1
      `
    )
    .action(({ session }, count) => sendImages(session, count));

  ctx.command("pivs", "获取随机p站图片").action(async ({ session }) => {
    const response = await ctx.http.get(
      `https://api.lolicon.app/setu/v2??size=original&size=regular&size=small`
    );
    const data = response.data;
    if (data.length === 0) {
      await session.send("没有找到图片");
      return;
    }
    const title = data[0].title;
    const author = data[0].author;
    const tags = data[0].tags.join(", ");
    const r18 = data[0].r18;
    const width = data[0].width;
    const height = data[0].height;
    const pid = data[0].pid;
    const urls = data[0].urls;
    const smallrUrl = urls.small;
    const regularUrl = urls.regular;
    const originalUrl = urls.original;
    const size = config.size || "regular"; // 默认为 regular
    let message = `图片链接：${urls[size]}  \nR18：${r18} \n分辨率： ${width}*${height} \n`;
    if (config.sendTitle) message += `标题: ${title} \n`;
    if (config.sendAuthor) message += `作者：${author}\n`;
    if (config.sendPid) message += `pid：${pid}\n`;
    if (config.sendTags) message += `tags: ${tags}\n`;
    console.log(urls);
    await session.send(message);

    if (r18) {
      await session.send("监测到r18标签，已停止发送原图");
    } else {
      if (config.sendImage) {
        const size = config.size || "regular";
        await session.send(`您选择的图片规格为 ${size}，美少女正在努力发送中 `);
        session.send(h("image", { url: urls[size] }));
      }
    }
  });
}
