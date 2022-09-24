import * as fs from 'fs'
import {sleep} from "./utils.js";
import {buildParams, getPropertyList, makePropertyRequest} from "./nuuka-client.js";


const getKwhByDayForProperty = async (propertyName, day, id) => {
    const electricityParams = buildParams(propertyName, "Electricity", day, day)
    const heatParams = buildParams(propertyName, "Heat", day, day)

    const data = await Promise.all([electricityParams, heatParams].map(params => {
        return makePropertyRequest(params).then(res => {
            return {
                type: params.ReportingGroup,
                value: parseFloat(res[0]?.value || 0).toFixed(2),
                unit: res[0]?.unit || 'kWh'
            }
        })
    }))

    const sum = data.reduce((prev, current) => {
        return prev + current.value
    }, 0)

    console.log(`[${id}] ${propertyName} - Sum: ${sum} -> Done!`)

    return {data, sum}
}

export const getTop10LargestConsumerProperties = async (writeToFile = false) => {
    const properties = await getPropertyList()

    const date = new Date()
    date.setDate(date.getDate() - 3)
    const date3daysAgo = date.toISOString().split("T")[0]

    const report = await Promise.all(properties.map(async (property, index) => {
        const id = `${index + 1}/${properties.length + 1}`
        await sleep(100 * (index + 1)) // avoid spamming the endpoint
        const data = await getKwhByDayForProperty(property.propertyName, date3daysAgo, id)
        return {
            name: property.propertyName,
            data: data.data,
            totalKwh: data.sum,
            date: date3daysAgo
        }
    }))


    const sortedReport = report.sort((a, b) => a.totalKwh - b.totalKwh)
    const tenLargest = sortedReport.slice(Math.max(sortedReport.length - 10, 0))

    if (writeToFile) fs.writeFileSync('report.json', JSON.stringify(report));
    if (writeToFile) fs.writeFileSync('sorted desc - report.json', JSON.stringify(sortedReport));
    if (writeToFile) fs.writeFileSync('top 10 - report.json', JSON.stringify(tenLargest));

    return tenLargest
}
