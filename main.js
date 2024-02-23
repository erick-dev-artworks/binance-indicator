const request = require('request');



const apiCall = (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            url: url,
            json: true
            
        }
        
        request.get(options, function(error, res, body) {
            if(error) reject(error);
            resolve(body);
        }); 
        
    });
}

var predictionDATA = []
async function prepareObject(){
    var symbols = ['BTCUSDT']
    for(var i=0; i<symbols.length; i++){
        id = symbols[i]
        splited = id.split('-')
        sym1 = splited[0]
        sym2 = splited[1]

        predictionDATA.push({
            'exchange': 'binance',
            'symbol': id,
            'startDate': new Date(Date.now()).toLocaleString(),
            'currentDate': '',
            [id]: {
                'startingPrice': '',
                'currentPrice': 0,
                'priceChange': {
                    '1m': 0,
                    '5m': 0,
                    '10m': 0,
                    '30m':0,
                    '1h':0,
                    '3h':0,
                    '5h':0,
                    '8h':0,
                    '12h':0,
                    '1d': 0
                },
                'techincalIndicator': {
                    '1m': '',
                    '5m': '',
                    '10m': '',
                    '30m': '',
                    '1h': '',
                    '3h': '',
                    '5h': '',
                    '8h': '',
                    '12h': '',
                    '1d': '',
                },
                'technicalStatus': {
                    '15m': '',
                    '1h': '',
                    '3h': '',
                    '1d': ''
                }
            },
            'CycleNum': 0
        })

    }
}

var entry = 0;
var stop = false;
async function simulation(){
    var prepare = await prepareObject()

    for(var c=0; c<predictionDATA.length; c++){
        sym = predictionDATA[c].symbol 
        splited = sym.split('-')
        sym1 = splited[0]
        sym2 = splited[1]

        var response = await apiCall('https://api.binance.com/api/v3/depth?symbol=' + sym)
        
        var askPrice = response.asks[0][0]
  
        predictionDATA[c][sym].startingPrice = askPrice

    }
 
    
    var time = 0;
    setInterval(async function(){
        time++;
        if(stop == true){
            clearInterval()
        }
        for(var c=0; c<predictionDATA.length; c++){
//console.log(predictionDATA[c])
            sym = predictionDATA[c].symbol 
            splited = sym.split('-')
            sym1 = splited[0]
            sym2 = splited[1]

            //console.log(time, sym)
            var response = await apiCall('https://api.binance.com/api/v3/depth?symbol=' + sym)
            var bidPrice = response.bids[0][0]
            var bidQuantity = response.bids[0][1]
            var askPrice = response.asks[0][0]
            var askQuantity = response.asks[0][1]        

            var startingPrice = predictionDATA[c][sym].startingPrice           
            predictionDATA[c][sym].priceChange['1m'] = bidPrice - startingPrice
            predictionDATA[c][sym].currentPrice = bidPrice
            predictionDATA[c][sym].currentDate = new Date(Date.now()).toLocaleString()
            if(bidPrice > predictionDATA[c][sym].priceChange['1m'] & bidPrice > startingPrice){
                predictionDATA[c][sym].techincalIndicator['1m'] = 'SELL'
            } else {
                predictionDATA[c][sym].techincalIndicator['1m'] = 'BUY'
            }

            var frames = ['5', '10', '30', '1', '12', '1']
            var frames2 = ['5m', '10m', '30m', '1h', '12h', '1d']

            for(var i=0; i<frames.length; i++){
                id = frames[c]
                min = frames2[c]
                
                last = predictionDATA[c][sym].priceChange[id]
                if(time == '1440'){
                    time = 0;
                }
                if(time == min){
                    if(bidPrice > last & bidPrice > startingPrice){
                        predictionDATA[c][sym].techincalIndicator[min] = 'SELL'
                    } else {
                        predictionDATA[c][sym].techincalIndicator[min] = 'BUY'

                    }
                }
            }

            var min15status = predictionDATA[c][sym].priceChange['1m'] - predictionDATA[c][sym].priceChange['5m'] - predictionDATA[c][sym].priceChange['10m']
            var hourStatus = predictionDATA[c][sym].priceChange['1m'] - predictionDATA[c][sym].priceChange['5m'] - predictionDATA[c][sym].priceChange['10m'] - predictionDATA[c][sym].priceChange['30m']
            var hour3status = predictionDATA[c][sym].priceChange['1m'] - predictionDATA[c][sym].priceChange['5m'] - predictionDATA[c][sym].priceChange['10m'] - predictionDATA[c][sym].priceChange['30m'] -  predictionDATA[c][sym].priceChange['1h'] 
            var daystatus = predictionDATA[c][sym].priceChange['1m'] - predictionDATA[c][sym].priceChange['5m'] - predictionDATA[c][sym].priceChange['10m'] - predictionDATA[c][sym].priceChange['30m'] -  predictionDATA[c][sym].priceChange['1h'] -  predictionDATA[c][sym].priceChange['3h'] -  predictionDATA[c][sym].priceChange['5h'] -  predictionDATA[c][sym].priceChange['8h'] -  predictionDATA[c][sym].priceChange['12h']
            
            if(min15status > 0){
                if(min15status > predictionDATA[c][sym].priceChange['10m']){
                    predictionDATA[c][sym].technicalStatus['15m'] = 'Long-Increasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['15m'] = 'Increasing'
                }

            } else {
                if(min15status < -0.1){
                    predictionDATA[c][sym].technicalStatus['15m'] = 'Long-Decreasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['15m'] = 'Decreasing'
    
                }
            }

            if(hourStatus > 0){
                if(hourStatus > predictionDATA[c][sym].priceChange['30m']){
                    predictionDATA[c][sym].technicalStatus['1h'] = 'Long-Increasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['1h'] = 'Increasing'
                }
            } else {
                if(min15status < -0.1){
                    predictionDATA[c][sym].technicalStatus['1h'] = 'Long-Decreasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['1h'] = 'Decreasing'
    
                }
            }

            if(hour3status > 0){
                if(hour3status > predictionDATA[c][sym].priceChange['1h']){
                    predictionDATA[c][sym].technicalStatus['3h'] = 'Long-Increasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['3h'] = 'Increasing'
                }
            } else {
                if(min15status < -0.1){
                    predictionDATA[c][sym].technicalStatus['3h'] = 'Long-Decreasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['3h'] = 'Decreasing'
    
                }
            }

            if(daystatus > 0){
                if(daystatus > predictionDATA[c][sym].priceChange['12h']){
                    predictionDATA[c][sym].technicalStatus['1d'] = 'Long-Increasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['1d'] = 'Increasing'
                }
            } else {
                if(min15status < -0.1){
                    predictionDATA[c][sym].technicalStatus['1d'] = 'Long-Decreasing'
                } else {
                    predictionDATA[c][sym].technicalStatus['1d'] = 'Decreasing'
    
                }
            }

            predictionDATA[c][sym].CycleNum = time

            console.log(predictionDATA[c])

        }
        entry = 1


    }, 3000)


}

simulation()
