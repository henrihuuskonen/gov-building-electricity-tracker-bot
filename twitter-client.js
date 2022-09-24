import {TwitterApi} from "twitter-api-v2";
import {sleep} from "./utils.js";


export const tweetAndReplyMessageObject = async (messageObj) => {
    const client = new TwitterApi({
        appKey: process.env.TWITTER_APP_KEY,
        appSecret: process.env.TWITTER_APP_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
    const rwClient = client.readWrite


    const res = await rwClient.v1.tweet(messageObj.title);
    const tweetId = res.id_str

    await Promise.all(messageObj.replies.map(async (reply, index) => {
        await sleep(100 * (index + 1)) // avoid spamming the endpoint
        await rwClient.v1.reply(reply, tweetId)
    }))
}

