
const strategyConfigName = process.argv[2];
if(!strategyConfigName) {
    throw new Error('请指定使用的策略配置');
}
try {
    global.strategyConfig = require(`./strategies/${strategyConfigName}`);
} catch(err) {
    console.error(`加载策略${strategyConfigName}配置失败`);
    throw err;
}

global.context = {};
let totalVolume = 0;
console.log(`吃针策略交易对：${strategyConfig.pair}，针对K线：${strategyConfig.periodToUse}
开仓位置分布：${strategyConfig.openPositions.map(d => `${(d.percent * 100).toFixed(2)}%：${totalVolume+=d.volume,d.volume}张`).join('，')}
共${totalVolume}张.
`);

require('./main');