module.exports = {
    enabled: true,
    symbol: 'BTC',
    pair: 'BTC_CQ',
    contractType: 'quarter',
    periodToUse: '5min',
    lever_rate: 20,
    loopDelay: 1, //每次检测间隔时间
    actionTime: 0.5, // 定义操作时间，即在什么时间段内进行【开仓】和【平仓】操作
    openPositions: [
        // {
        //     percent: -0.0027,
        //     volume: 20 //
        // },
        // {
        //     percent: -0.0048,
        //     volume: 40 //
        // },
        // {
        //     percent: -0.0088,
        //     volume: 40 //
        // },
        {
            percent: -0.0168,
            volume: 80 //
        },
        {
            percent: -0.0240,
            volume: 160 //
        },
        {
            percent: -0.0380,
            volume: 180 //
        },
        // {
        //     percent: 0.0027,
        //     volume: 20 //
        // },
        // {
        //     percent: 0.0047,
        //     volume: 40 //
        // },
        // {
        //     percent: 0.0088,
        //     volume: 40 //
        // },
        {
            percent: 0.0131,
            volume: 80 //
        },
        {
            percent: 0.0222,
            volume: 160 //
        },
        {
            percent: 0.0360,
            volume: 180 //
        },
    ]
}
