#!/usr/bin/env node
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const platform_express_1 = require("@nestjs/platform-express");
const fs_extra_1 = require("fs-extra");
const express_1 = __importDefault(require("express"));
class Version {
    constructor(val) {
        const [main, second, third] = val.split('.');
        this.main = parseInt(main);
        this.second = parseInt(second);
        this.third = parseInt(third);
    }
    static comString(v1, v2) {
        return this.com(new Version(v1), new Version(v2));
    }
    static com(v1, v2) {
        if (v1.main > v2.main) {
            return 1;
        }
        if (v1.second > v2.second) {
            return 1;
        }
        if (v1.third > v2.third) {
            return 1;
        }
        return -1;
    }
}
exports.Version = Version;
let Upload = class Upload {
    parseFileName(file) {
        const ext = path.extname(file);
        file = file.replace(ext, '');
        const files = file.split('-');
        let version = files.pop();
        const fileName = files.join('-');
        return {
            name: fileName,
            version: version
        };
    }
    handler(file) {
        const { name, version } = this.parseFileName(file);
        if (version === 'latest') {
            const files = fs_extra_1.readdirSync(path.join(__dirname, 'uploads'))
                .filter(it => this.parseFileName(it).name === name)
                .sort((a, b) => {
                return Version.comString(this.parseFileName(b).version, this.parseFileName(a).version);
            });
            if (files.length > 0) {
                console.log(files[0]);
                return path.join(__dirname, 'uploads', files[0]);
            }
            throw new Error(`没找到文件`);
        }
        else {
            console.log(path.join(__dirname, file));
            return path.join(__dirname, 'uploads', file);
        }
    }
    //
    getFile(file, res) {
        res.sendFile(this.handler(file));
    }
    upload(data, name) {
        fs_extra_1.ensureDirSync(path.join(__dirname, 'uploads'));
        fs_extra_1.writeFileSync(path.join(__dirname, 'uploads', name), Buffer.from(data));
    }
};
__decorate([
    common_1.Get(`/:file`),
    __param(0, common_1.Param(`file`)), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], Upload.prototype, "getFile", null);
__decorate([
    common_1.Post('upload'),
    __param(0, common_1.Body('data')), __param(1, common_1.Body('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", void 0)
], Upload.prototype, "upload", null);
Upload = __decorate([
    common_1.Controller()
], Upload);
exports.Upload = Upload;
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        controllers: [Upload]
    })
], AppModule);
exports.AppModule = AppModule;
async function bootstrap() {
    const server = express_1.default();
    server.use(express_1.default.json({
        limit: `${1024 * 20}kb`
    }));
    const app = await core_1.NestFactory.create(AppModule, new platform_express_1.ExpressAdapter(server));
    // app.use(express.static(path.join(__dirname, 'uploads')));
    app.listen(9008, () => {
        console.log(`hello`);
    });
}
exports.bootstrap = bootstrap;
bootstrap();
