"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.using = exports.Config = exports.usage = exports.name = void 0;
const koishi_1 = require("koishi");
exports.name = "open-pics";
exports.usage = `
### 向世界分享你的xp

目前支持的图源有:

t4wefan的随机ai美图

`;
exports.Config = koishi_1.Schema.object({
    apiAddress: koishi_1.Schema.string()
        .description("图源服务器地址")
        .default("https://drive.t4wefan.pub/d/pics/koishi/"),
});
exports.using = [];
async function apply(ctx, config) {
    const logger = ctx.logger("random_pic");
    function mathRandomInt(a, b) {
        if (a > b) {
            [a, b] = [b, a]; // 使用解构赋值交换 a 和 b 的值
        }
        return Math.floor(Math.random() * (b - a + 1) + a);
    }
    const admin_id = "2135864702";
    let max_pics = 55;
    let pic_id = 0;
    const pic_url = config.apiAddress;
    function createMessage(session, pic_id, pic_url) {
        return [
            (0, koishi_1.h)("at", { id: session.userId }),
            "你要的随机图片来辣，id是",
            pic_id,
            (0, koishi_1.h)("image", { url: `${pic_url}${pic_id}.jpg` }),
        ].join("");
    }
    ctx.command("pic", "随机ai美图").action(async ({ session }, ...args) => {
        switch (args[0]) {
            case "reset":
                if (session.userId === admin_id) {
                    await session.send(`已经重置图片总数到0，原先图片总数为${max_pics}`);
                    max_pics = 0;
                }
                break;
            case "add":
                if (session.userId === admin_id) {
                    max_pics += Number(args[1]);
                    await session.send(`已更新图片库，现在图片总数为${max_pics}`);
                }
                break;
            default:
                if (args[0] == null) {
                    pic_id = mathRandomInt(1, max_pics);
                    await session.send(createMessage(session, pic_id, pic_url));
                }
                else if (Number(args[0]) <= max_pics) {
                    pic_id = Number(args[0]);
                    await session.send(createMessage(session, pic_id, pic_url));
                }
                else {
                    await session.send(`${(0, koishi_1.h)("at", {
                        id: session.userId,
                    })}你指定的图片不存在，现在一共只有${max_pics}张图`);
                }
                break;
        }
    });
}
exports.apply = apply;
/*
 这里对原版的blockly插件进行了如下优化：

1.将 var 声明改为 const 或 let 声明，使代码更加规范。
2.把 if 语句改为 switch 语句，使代码更加简洁。
3.把生成消息的代码提取为一个函数，提高代码复用性。
4.在 switch 语句的 default 分支中，增加判断图片是否存在的逻辑。
 */
