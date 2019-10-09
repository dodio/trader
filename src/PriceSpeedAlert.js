
// 记录10分钟的价格？ 1秒一个价格
const priceBufferLength = 10 * 60;


export default class PriceSpeedAlert {
    constructor(intervals = [5, 15, 30, 60, 60 * 5]) {
        this.priceBuffer = [];
        this.id = 1;
        this.intervals = intervals;
    }

    pushPrice(price) {
        const priceItem = {
            price,
            id: this.id++,
            time: Date.now(),
            priceIncreases: {}
        };
        const priceBuffer = this.priceBuffer;
        priceBuffer.push(priceItem);
        if(priceBuffer.length > priceBufferLength) {
            priceBuffer.shift();
        }
        const presentIndex = priceBuffer.length - 1;
        this.intervals.forEach(ivt => {
            const oldPrice = priceBuffer[presentIndex - ivt];
            priceItem.priceIncreases[ivt] = oldPrice ? (price - oldPrice) / oldPrice : undefined;
        });
        return priceItem;
    }
}