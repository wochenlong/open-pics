import { Context, Schema, Session, h } from "koishi";
export const name = "open-pics";

export const usage = `
### 向世界分享你的xp

目前支持的图源有:

t4wefan的随机ai美图

`;
export interface Config {
  apiAddress: string;
}

export const Config: Schema<Config> = Schema.object({
  apiAddress: Schema.string()
    .description("图源服务器地址")
    .default("https://drive.t4wefan.pub/d/pics/koishi/"),
});

export const using = [];
// 导出一个异步函数，接收两个参数：Context 和 Config
export async function apply(ctx: Context, config: Config) {
  // 获取 logger 对象
  const logger = ctx.logger("random_pic");

  // 定义一个返回指定范围内随机整数的函数
  function mathRandomInt(a: number, b: number): number {
    // 如果 a 大于 b，则交换 a 和 b 的值
    if (a > b) {
      [a, b] = [b, a]; // 使用解构赋值交换 a 和 b 的值
    }
    // 返回 a 到 b 之间的随机整数
    return Math.floor(Math.random() * (b - a + 1) + a);
  }

  // 定义管理员 id，最大图片数量，当前图片 id 和图片地址
  const admin_id = "2135864702";
  let max_pics = 55;
  let pic_id = 0;
  const pic_url = config.apiAddress;

  // 定义一个生成消息的函数
  function createMessage(
    session: Session,
    pic_id: number,
    pic_url: string
  ): string {
    // 返回消息内容，包括艾特用户、图片 id 和图片地址
    return [
      h("at", { id: session.userId }),
      "你要的随机图片来辣，id是",
      pic_id,
      h("image", { url: `${pic_url}${pic_id}.jpg` }),
    ].join("");
  }

  // 定义命令 pic，响应的动作是异步的
  ctx.command("pic", "随机ai美图").action(async ({ session }, ...args) => {
    // 根据参数执行不同的操作
    switch (args[0]) {
      // 如果参数是 reset，并且当前用户是管理员，则将 max_pics 设置为 0
      case "reset":
        if (session.userId === admin_id) {
          await session.send(`已经重置图片总数到0，原先图片总数为${max_pics}`);
          max_pics = 0;
        }
        break;

      // 如果参数是 add，并且当前用户是管理员，则将 max_pics 加上指定的数量
      case "add":
        if (session.userId === admin_id) {
          max_pics += Number(args[1]);
          await session.send(`已更新图片库，现在图片总数为${max_pics}`);
        }
        break;

      // 如果没有参数，则随机生成一个图片 id 并发送消息
      default:
        if (args[0] == null) {
          pic_id = mathRandomInt(1, max_pics);
          await session.send(createMessage(session, pic_id, pic_url));
        }
        // 如果参数是一个数字，并且小于等于 max_pics，则发送对应的图片消息
        else if (Number(args[0]) <= max_pics) {
          pic_id = Number(args[0]);
          await session.send(createMessage(session, pic_id, pic_url));
        }
        // 如果参数超过了 max_pics，则发送图片不存在的消息
        else {
          await session.send(
            `${h("at", {
              id: session.userId,
            })}你指定的图片不存在，现在一共只有${max_pics}张图`
          );
        }
        break;
    }
  });
}
