import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc'
import * as ExhangeApi from './src/ExchangeApi';
import klinePeriods from './src/periods';
dayjs.extend(dayjsPluginUTC);

// 'this_week', // next_week, quarter
const strategyConfig = {
    symbol: 'BTC',
    pair: 'BTC_CW',
    contractType: 'this_week',
    periodToUse: '60min',
    lever_rate: 20,
    actionTime: 2, // 定义操作时间，即在什么时间段内进行【开仓】和【平仓】操作
    openPositions: [
        {
            percent: -0.0135,
            volume: 50 //
        },
        {
            percent: -0.0237,
            volume: 50 //
        },
        {
            percent: -0.0339,
            volume: 150 //
        },
        {
            percent: -0.0577,
            volume: 300 //
        },
        {
            percent: 0.0134,
            volume: 50 //
        },
        {
            percent: 0.0235,
            volume: 50 //
        },
        {
            percent: 0.0346,
            volume: 150 //
        },
        {
            percent: 0.0535,
            volume: 300 //
        },
    ]
}

const context = {};

// ExhangeApi.getAccountInfo().then(console.log.bind(console, '账户资产信息：'))

main();
function main() {
    loop().then(() => {
        setTimeout(() => {
            main();
        }, 1e3);
    }).catch(err => {
        console.log('发生错误：', err.message);
        if(err.response && err.response.data) {
            console.log('错误的请求配置信息：', JSON.stringify(err.response.config));
            console.log('错误请求返回的结果：', JSON.stringify(err.response.data));
        }
        console.log('继续执行策略\n\n\n');
        setTimeout(() => {
            main();
        }, 1e3);
    });
}

async function loop() {
    await updateContract();
    await updateKline();
    if(isJustBegin(context.kline, strategyConfig.actionTime) && context.lastOrderRequest !== context.kline.id) {
        await makeRequests();
        context.lastOrderRequest = context.kline.id;
    } else if(isApproachEnd(context.kline, strategyConfig.actionTime) && context.lastCloseRequests !== context.kline.id) {
        await cancelAllOrders();
        await closeAllPositions();
        context.lastCloseRequests = context.kline.id;
    } else {
        await checkHolding();
    }
}

async function updateContract() {
    if(!context.contract) {
        // TODO 合约交割过期后更新
        const rs = await ExhangeApi.getConstracts({
            symbol: strategyConfig.symbol,
            contract_type: strategyConfig.contractType
        });
        context.contract = rs[0];
        console.log('更新合约信息：', JSON.stringify(context.contract));
    }
}

async function updateKline() {
    const rs = await ExhangeApi.getKlines({
        symbol: strategyConfig.pair,
        period: strategyConfig.periodToUse,
        size: 1,
    });
    context.kline = rs[0];
    console.log(`已更新最新${strategyConfig.periodToUse} K线信息:\n`, JSON.stringify(context.kline));
}

function isJustBegin(kline, min = 1) {
    const time = min * 60 * 1e3;
    const now = Date.now();
    const beginTime = kline.id * 1e3;
    return now <= (beginTime + time);
}

function isApproachEnd(kline, min = 1) {
    const time = min * 60 * 1e3;
    const now = Date.now();
    const endTime = kline.id * 1e3 + klinePeriods[strategyConfig.periodToUse].timeInterval;
    return (endTime - time) <= now;
}

/**
 *取消所有订单
 *
 */
async function cancelAllOrders() {
    await ExhangeApi.cancelAllOrders({
        symbol: strategyConfig.symbol,
        contract_code: context.contract.contract_code,
    });
}

// 平掉所有仓位
async function closeAllPositions() {
    const poistions = await ExhangeApi.getPosition('BTC');
    const thisContractPoistions = poistions.filter(p => p.contract_code === context.contract.contract_code);
    console.log('当前持仓信息：', JSON.stringify(thisContractPoistions));
    const orders = thisContractPoistions.map(p => {
        return {
            contract_code: p.contract_code,
            volume: p.available,
            direction: p.direction === 'buy' ? 'sell' : 'buy',
            lever_rate: p.lever_rate,
            order_price_type: 'opponent',
            offset: 'close',
        }
    });
    if(orders.length) {
        console.log('【平仓】信息：', JSON.stringify(orders));
        const rs = await makeOrders(orders);
        console.log('【平仓】下单结果：', JSON.stringify(rs));
    } else {
        console.log('无持仓信息，不用【平仓】');
    }
}

// 发起订单委托
async function makeRequests() {
    const kline = context.kline;
    const orders = strategyConfig.openPositions.map((cfg) => {
        return {
            contract_code: context.contract.contract_code,
            volume: cfg.volume,
            direction: cfg.percent > 0 ? 'sell' : 'buy',
            offset: 'open',
            price: +((kline.open * (1 + cfg.percent)).toFixed(Math.log10(1 / context.contract.price_tick))),
            lever_rate: strategyConfig.lever_rate,
            order_price_type: 'limit',
        }
    })
    console.log('【开仓】订单：', JSON.stringify(orders));
    const rs = await ExhangeApi.makeOrders(orders);
    console.log('【开仓】订单结果：', JSON.stringify(rs));
}

async function checkHolding() {

}