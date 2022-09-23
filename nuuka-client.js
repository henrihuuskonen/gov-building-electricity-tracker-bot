import fetch from "node-fetch";

/*
    {
        "locationName": "1714 Linja-autoasema, Narikka (disabled)",
        "propertyName": "1714 Linja-autoasema, Narikka",
        "propertyCode": "091-004-0194-0001"
     },
 */
export const getPropertyList = async () => {
    const res = await fetch("https://helsinki-openapi.nuuka.cloud/api/v1.0/Property/List")
    return await res.json()
}

export const buildParams = (propertyName, type, startTime, endTime) => ({
    Record: "LocationName",
    SearchString: propertyName,
    ReportingGroup: type,
    StartTime: startTime,
    EndTime: endTime
})

export const makePropertyRequest = async (params) => {
    const searchParams = new URLSearchParams(params)
    const res = await fetch("https://helsinki-openapi.nuuka.cloud/api/v1.0/EnergyData/Daily/ListByProperty?" + searchParams.toString())
    return await res.json()
}