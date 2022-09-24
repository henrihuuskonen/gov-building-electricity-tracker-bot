import * as fs from "fs";

const getTranslation = (type) => {
    switch (type) {
        case "Electricity":
            return "Sähkö"
        case "Heat":
            return "Lämmitys"
        default:
            return type
    }
}

export const getTwitterMessageObject = (data = undefined) => {
    let jsonData = data
    if (!jsonData) {
        const readFile = fs.readFileSync("top 10 - report.json", "utf-8")
        jsonData = JSON.parse(readFile)
    }

    const sortedOrder = jsonData.sort((a, b) => b.totalKwh - a.totalKwh)

    const date = sortedOrder[0].date

    const formatReply = (title, json) => `${title} (${json.date})\n${json.data.map(y => {
        return `${getTranslation(y.type)}: ${y.value}(${y.unit})`
    }).join("\n")}
Yhteensä: ${json.totalKwh}(kWh)`

    return {
        title: `Top 10 Helsingin kaupungin palvelukiinteistöjen sähkönkuluttajat (${date})`,
        replies: sortedOrder.map((x, index) => {
            const nameParts = x.name.split(" ")
            nameParts.shift()
            return `${formatReply(`${index + 1}. ${nameParts.join(" ")}`, x)}`
        })
    }
}