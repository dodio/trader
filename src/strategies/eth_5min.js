module.exports = {
    enabled: true,
    symbol: 'ETH',
    pair: 'ETH_CQ',
    contractType: 'quarter',
    periodToUse: '5min',
    lever_rate: 20,
    loopDelay: 1, //每次检测间隔时间
    actionTime: 20, // 定义操作时间，即在什么时间段内进行【开仓】和【平仓】操作
    openPositions: [
        // {
        //     percent: -0.0027,
        //     volume: 50 //
        // },
        // {
        //     percent: -0.0048,
        //     volume: 100 //
        // },
        {
            percent: -0.0053,
            volume: 200 //
        },
        {
            percent: -0.0133,
            volume: 200 //
        },
        {
            percent: -0.0240,
            volume: 400 //
        },
        
        {
            percent: -0.0380,
            volume: 800 //
        },
        
        // {
        //     percent: 0.0027,
        //     volume: 50 //
        // },
        // {
        //     percent: 0.0047,
        //     volume: 100 //
        // },
        {
            percent: 0.0064,
            volume: 300 //
        },
        {
            percent: 0.0164,
            volume: 300 //
        },
        {
            percent: 0.0282,
            volume: 600 //
        },
        {
            percent: 0.0380,
            volume: 600 //
        },
    ]
}
