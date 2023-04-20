import { Context, Schema } from "koishi";
export declare const name = "open-pics";
export declare const usage = "\n### \u5411\u4E16\u754C\u5206\u4EAB\u4F60\u7684xp\n\n\u76EE\u524D\u652F\u6301\u7684\u56FE\u6E90\u6709:\n\nt4wefan\u7684\u968F\u673Aai\u7F8E\u56FE\n\n";
export interface Config {
    apiAddress: string;
}
export declare const Config: Schema<Config>;
export declare const using: any[];
export declare function apply(ctx: Context, config: Config): Promise<void>;
