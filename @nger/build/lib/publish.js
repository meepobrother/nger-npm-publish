"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pack_1 = require("./pack");
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
async function publish(path, host) {
    const sub = pack_1.pack(path);
    return (url) => sub.subscribe(res => {
        axios_1.default.post(url, {
            data: res.buffer,
            name: res.name,
            hash: res.hash
        }).catch(e => {
            fs_extra_1.removeSync(path_1.join(path, res.name));
        }).then(e => {
            console.log(`nger-build success, ${host ? host : ""}/${res.name}`);
            fs_extra_1.removeSync(path_1.join(path, res.name));
        }).finally(() => {
            fs_extra_1.removeSync(path_1.join(path, res.name));
        });
    }, (err) => {
        console.log(`error`);
    }, () => {
        console.log(`complete`);
    });
}
exports.publish = publish;
