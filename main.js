

import {getTop10LargestConsumerProperties} from "./generator.js";
import {getTwitterMessageObject} from "./twitter-message.js";
import {tweetAndReplyMessageObject} from "./twitter-client.js";
import {config} from 'dotenv'

// Load .env file
config()

const runProd = async () => {
    /* Fetch and generate data */
    const data = await getTop10LargestConsumerProperties()

    /* Parse and form string we want to post to twitter */
    const messageObj = getTwitterMessageObject(data)

    /* Post to twitter */
    await tweetAndReplyMessageObject(messageObj)
}

const runDev = async () => {
    /* Parse and form string we want to post to twitter */
    const messageObj = getTwitterMessageObject()

    console.log(messageObj)
}

if (process.env.NODE_ENV === "dev") {
    console.log("Running as development!")
    console.log("Will reuse existing data from local.")

    await runDev()
} else {
    console.log("Running as production!")
    console.log("Will fetch data from avoidata.fi and post to twitter.")

    await runProd()
}