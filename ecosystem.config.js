const fs = require('fs');
const path = require('path');
const args = process.argv;
const onlyApp = args.findIndex(a => a === '--only');
if(!~onlyApp) {
    throw new Error('请指定需要启动的APP');
}
const strategyNames = process.argv[onlyApp + 1].split(',');

module.exports = {
    apps: strategyNames.map(s => createPm2Config(s)),
};
console.log(module.exports);

function createPm2Config(strategyName) {
    const configjs = `${strategyName}.js`;
    if(!strategyName || !fs.existsSync(`./src/strategies/${configjs}`)) {
        throw new Error(`${strategyName}策略配置不存在, 请在配置目录中确认，或看是否输错`);
    }
    return {
        name: `${strategyName}`,
        instance: 1,
        script: './index.js',
        args: strategyName,
        error_file: `./logs/${strategyName}/error.log`,
        out_file: `./logs/${strategyName}/out.log`,
        time: true,
    }
}