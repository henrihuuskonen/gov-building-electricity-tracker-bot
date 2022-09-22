import fetch from 'node-fetch'
import * as fs from 'fs'

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
    {
        "locationName": "1714 Linja-autoasema, Narikka (disabled)",
        "propertyName": "1714 Linja-autoasema, Narikka",
        "propertyCode": "091-004-0194-0001"
     },
 */
const getPropertyList = async () => {
    const res = await fetch("https://helsinki-openapi.nuuka.cloud/api/v1.0/Property/List")
    return await res.json()
}

const buildParams = (propertyName, type, startTime, endTime) => ({
    Record: "LocationName",
    SearchString: propertyName,
    ReportingGroup: type,
    StartTime: startTime,
    EndTime: endTime
})

const makePropertyRequest = async (params) => {
    const searchParams = new URLSearchParams(params)
    const res = await fetch("https://helsinki-openapi.nuuka.cloud/api/v1.0/EnergyData/Daily/ListByProperty?" + searchParams.toString())
    return await res.json()
}

const getTotalKwhByDayForProperty = async (propertyName, day, id) => {
    const electricityParams = buildParams(propertyName, "Electricity", day, day)
    const heatParams = buildParams(propertyName, "Heat", day, day)

    const data = await Promise.all([electricityParams, heatParams].map(params => {
        return makePropertyRequest(params).then(res => {
            return {
                value: res[0]?.value || 0,
                unit: res[0]?.unit || 'kWh'
            }
        })
    }))

    const sum = data.reduce((prev, current) => {
        return prev + current.value
    }, 0)

    console.log(`[${id}] - Sum: ${sum} -> Done!`)

    return sum
}

const properties = await getPropertyList()

const date = new Date()
date.setDate(date.getDate() - 3)
const date3daysAgo = date.toISOString().split("T")[0]

const report = await Promise.all(properties.map(async (property, index) => {
    const id = `${index + 1}/${properties.length + 1}`
    console.log(`[${id}] - Getting total kWh for ${property.propertyName}`)
    await sleep(100 * (index + 1))
    const totalKwh = await getTotalKwhByDayForProperty(property.propertyName, date3daysAgo, id)
    return {
        name: property.propertyName,
        totalKwh: totalKwh,
        date: date3daysAgo
    }
}))

fs.writeFileSync('report.json', JSON.stringify(report));

const sortedReport = report.sort((a, b) => a.totalKwh - b.totalKwh)
console.log(sortedReport)
const tenLargest = sortedReport.slice(Math.max(sortedReport.length - 10, 0))
console.log(tenLargest)

fs.writeFileSync('top 10 - report.json', JSON.stringify(tenLargest));
