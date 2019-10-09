module.exports = {
    enabled: true,
    symbol: 'BTC',
    pair: 'BTC_CQ',
    contractType: 'quarter',
    periodToUse: '30min',
    lever_rate: 20,
    loopDelay: 1, //每次检测间隔时间
    actionTime: 30, // 定义操作时间，即在什么时间段内进行【开仓】和【平仓】操作
    openPositions: [
        {
            percent: -0.0067,
            volume: 100 //
        },
        {
            percent: -0.012,
            volume: 100 //
        },
        {
            percent: 0.0066,
            volume: 100 //
        },
        {
            percent: 0.0122,
            volume: 100 //
        },
        {
            percent: 0.0177,
            volume: 100 //
        },
    ]
}
