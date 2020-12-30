async function fetchData(symbol) {
    const response = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1h&limit=${24}`)
    const data = await response.json();

    return data
}

async function getExchangeInfo() {
    const response = await fetch(`https://fapi.binance.com/fapi/v1/exchangeInfo`)
    const data = await response.json();
    let symbols = {}
    data["symbols"].forEach(el => symbols[el.symbol] = el)
    return symbols

}

function plotLine(dataDict) {
    let y = []
    let x = []
    let z = []
    console.log(x);
    for (let symbol in dataDict) {
        console.log(symbol)
        let dataFloat = dataDict[symbol]["Close"].map(x => parseFloat(x))
        let timeInt = dataDict["BTCUSDT"]["Open_time"].map(el => (new Date(el).getHours()))
        z.push(dataFloat.map(el => (el - dataFloat[0]) / dataFloat[0]))
        y.push(symbol)
        x.push(timeInt)
    }

    let data = [
        {
            z: z,
            y: y,
            x: x,
            type: 'heatmap',

        }
    ];
    let startTime = new Date(dataDict["BTCUSDT"]["Open_time"][0])
    let endTime = new Date(dataDict["BTCUSDT"]["Open_time"][dataDict["BTCUSDT"]["Open_time"].length - 1])

    let layout = { "title": `24h Percent Moves <br> ${startTime} <br> ${endTime} <br>`, "height": 1500, }
    Plotly.newPlot('myDiv', data, layout);
}

async function main() {
    let data = {}
    let exchangeInfo = await getExchangeInfo()

    // exchangeInfo = { "BTCUSDT": [], "ETHUSDT": [], "XRPUSDT": [], "LINKUSDT": [], "UNIUSDT": [], "RENUSDT": [] }
    for (let symbol in exchangeInfo) {

        let rawData = await fetchData(symbol)
        let n = rawData.length
        let temp = {}
        colNames = ["Open_time",
            "Open",
            "High",
            "Low",
            "Close",
            "Volume",
            "Close_time",
            "Quote_asset_volume",
            "Number_of_trades",
            "Taker_buy_base_asset_volume",
            "Taker_buy_quote_asset_volume",
            "Ignore"]
        for (let j = 0; j < colNames.length; j++) {
            let tempCol = []
            for (let i = 0; i < n; i++) {
                tempCol.push(rawData[i][j])

            }
            temp[colNames[j]] = tempCol

        }
        data[symbol] = temp
    }
    plotLine(data)
}

main()
