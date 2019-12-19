"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = require("./run");
const path_1 = require("path");
run_1.run({
    src: path_1.join(__dirname, '../'),
    output: 'dist',
    types: 'dist',
    tsconfig: path_1.join(__dirname, '../tsconfig.json'),
    watch: false
});
