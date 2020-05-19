
import * as ExchangeApi from './ExchangeApi';
const ct1 = process.argv[2];
const ct2 = process.argv[3];
const action = process.argv[4];
const amount = parseInt(process.argv[5], 10) || 0;
const baseSymbol = ct1.split('_').shift();
const typeMap = {
    'CQ': 'quarter',
    'CW': 'this_week',
    'NW': 'next_week',
}
main();
async function main() {
    const [{tick: ct1Ticker}, {tick: ct2Ticker}] = await Promise.all([ct1, ct2].map(symbol => ExchangeApi.getTicker({
        symbol,
    })));
    const diff = ct2Ticker.close - ct1Ticker.close;
    const diffRate = diff / ct1Ticker.close;
    let historyDiff;
    let minDiffRate;
    let maxDiffRate;
    let minDiffPrice;
    let maxDiffPrice;

    // console.log(ct1Ticker, ct2Ticker);
    const period = process.argv[5] || '4hour';
    if(action === 'dh') {
        const [kline1, kline2] = await Promise.all([ct1, ct2].map(ct => ExchangeApi.getKlines({
            symbol: ct,
            period: period,
            size: 2000,
        })));
        if(kline1.length === kline2.length) {
            historyDiff = [];
            kline1.forEach((k1, idx) => {
                const k2 = kline2[idx];
                historyDiff[idx] = [k2.close - k1.close, (k2.close - k1.close)/k1.close];
            });
            minDiffPrice = Math.min.apply(Math, historyDiff.map(d => d[0]));
            maxDiffPrice = Math.max.apply(Math, historyDiff.map(d => d[0]));
            minDiffRate = Math.min.apply(Math, historyDiff.map(d => d[1]));
            maxDiffRate = Math.max.apply(Math, historyDiff.map(d => d[1]));
        } else {
            console.warn('k线数量不一致，不能比较');
        }
    }
    if(action === 'dh' && historyDiff) {
        console.log(`${ct1}：${ct1Ticker.close}，${ct2}：${ct2Ticker.close}，差价：${diff.toFixed(5)}（最大：${maxDiffPrice.toFixed(5)}，最低：${minDiffPrice.toFixed(5)}），差价比：${rate(diffRate)}%（最大：${rate(maxDiffRate)}%，最低：${rate(minDiffRate)}%） 历史数据参考k线：${period}`);
    } else {
        console.log(`${ct1}：${ct1Ticker.close}，${ct2}：${ct2Ticker.close}，差价：${diff.toFixed(5)}，差价比：${rate(diffRate)}%`);
    }

    if(action === 'account') {
        const [account] = await ExchangeApi.getAccountInfo(baseSymbol);
        console.log(`账户余额: ${account.margin_balance.toFixed(4)}${baseSymbol}，可用余额：${account.margin_available.toFixed(4)}${baseSymbol}，可开张数：${Math.floor(ct1Ticker.close * account.margin_available * account.lever_rate / (baseSymbol === 'BTC' ? 100 : 10))}张（${account.lever_rate}倍）\n`);
    }

    const positions = await ExchangeApi.getPosition(baseSymbol);
    if (positions.length) {
        console.log('当前持仓：');
        let allPositionMargin = 0;
        let allProfit = 0;
        positions.forEach(p => {
            const directionMap = {
                'sell': '开空',
                'buy': '开多'
            };
            allPositionMargin += p.position_margin;
            allProfit += p.profit;
            console.log(`${p.contract_code}(${directionMap[p.direction]}${p.lever_rate}倍)：${p.volume}张，收益率:${(p.profit_rate * 100).toFixed(2)}%`)
        });
        console.log(`总保证金：${allPositionMargin.toFixed(4)}，总收益：${allProfit.toFixed(4)}，收益率：${(allProfit * 100 / allPositionMargin).toFixed(2)}%\n`);
    }
    if(action === 'close') {
        const orders = positions.map(p => {
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
            const rs = await ExchangeApi.makeOrders(orders);
            console.log('【平仓】下单结果：', JSON.stringify(rs));
        } else {
            console.log('无持仓信息，不用【平仓】');
        }
    }

    // 看多1
    if(action === 'open') {
        const [account] = await ExchangeApi.getAccountInfo(baseSymbol);
        if(!account) {
            console.log('没有查询到账户信息');
            return;
        }
        if(!amount) {
            console.log(`未输入开仓合约张数，或不为数字。${process.argv[5]}`);
            return;
        }
        // 开仓使用市价，即对方的价格，买入开多
        const marginNeed1 = amount * 100 / ct1Ticker.ask[0];
        // 卖出开空
        const marginNeed2 = amount * 100 / ct1Ticker.bid[0];
        const totalNeed = marginNeed1 + marginNeed2;
        if (account.margin_available < totalNeed) {
            console.log(`保证金不够，账户余额${account.margin_available}${baseSymbol}，合约张数${amount * 2}保证金${totalNeed}`);
            return;
        }
        const orderData = [
            {   
                symbol: baseSymbol,
                contract_type: typeMap[ct1.split('_').pop()],
                volume: amount,
                direction: 'buy',
                lever_rate: account.lever_rate,
                order_price_type: 'opponent',
                offset: 'open',
            },
            {
                symbol: baseSymbol,
                contract_type: typeMap[ct2.split('_').pop()],
                volume: amount,
                direction: 'sell',
                lever_rate: account.lever_rate,
                order_price_type: 'opponent',
                offset: 'open',
            }
        ];
        const rs = await ExchangeApi.makeOrders(orderData);
        rs.errors.forEach(e => {
            console.log(e);
            console.log(orderData[e.index-1]);
        });
        console.log(rs.success);
    }
}

function rate(v) {
    return (v * 100).toFixed(2);
}