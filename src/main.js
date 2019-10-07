import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc'
import * as ExhangeApi from './ExchangeApi';
import klinePeriods from './periods';
import consola from 'consola';
dayjs.extend(dayjsPluginUTC);
consola.wrapConsole();

main();
function main() {
    loop().catch(err => {
        console.error('发生错误：', err.message);
        if(err.config) {
            console.error(`请求错误地址：${err.config.url}`);
        }
        if(err.response && err.response.data) {
            console.error('发生错误请求的配置信息：', JSON.stringify(err.response.config));
            console.error('错误请求返回的结果：', JSON.stringify(err.response.data));
        }
        console.warn('继续执行策略');
    }).then(() => {
        setTimeout(() => {
            main();
        }, (strategyConfig.loopDelay || 1) * 1e3);
    });
}

async function loop() {
    await updateContract();
    await updateKline();
    if(isJustBegin(context.kline, strategyConfig.actionTime) && context.lastOrderRequest !== context.kline.id) {
        await makeRequests();
        context.lastOrderRequest = context.kline.id;
    } else if(isApproachEnd(context.kline, strategyConfig.actionTime)) {
        await cancelAllOrders();
        await closeAllPositions();
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
    const old = context.kline;
    context.kline = rs[0];
    if(!old || old.id !== context.kline.id) {
        console.log(`已更新最新${strategyConfig.periodToUse} K线信息:\n`, JSON.stringify(context.kline));
    }
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
    const poistions = await ExhangeApi.getPosition(strategyConfig.symbol);
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
        const rs = await ExhangeApi.makeOrders(orders);
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