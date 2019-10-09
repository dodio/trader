// 'this_week', // next_week, quarter

module.exports = {
    enabled: true,
    symbol: 'BTC',
    pair: 'BTC_CQ',
    contractType: 'quarter',
    periodToUse: '60min',
    lever_rate: 20,
    actionTime: 30, // 定义操作时间，即在什么时间段内进行【开仓】和【平仓】操作
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
