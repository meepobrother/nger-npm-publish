"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 打包发布
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
function pack(path) {
    const res = child_process_1.execSync(`npm pack`, {
        cwd: path
    });
    const name = res.toString('utf8').replace('\n', '');
    const sub = new rxjs_1.Subject();
    const filename = path_1.join(path, name);
    const stream = fs_1.createReadStream(filename, {
        highWaterMark: 1024 * 1024 * 20
    });
    stream.on('data', (buffer) => {
        const hash = crypto_1.createHash('sha256');
        hash.update(buffer);
        const data = { buffer, name, hash: hash.digest('hex') };
        sub.next(data);
    });
    stream.on(`close`, () => {
        sub.complete();
    });
    return sub;
}
exports.pack = pack;
