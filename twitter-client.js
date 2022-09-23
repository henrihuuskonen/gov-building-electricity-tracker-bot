import {TwitterApi} from "twitter-api-v2";
import {sleep} from "./utils.js";


export const tweetAndReplyMessageObject = async (messageObj) => {
    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

    const res = await twitterClient.v1.tweet(messageObj.title);

    await Promise.all(messageObj.replies.map(async (reply, index) => {
        await sleep(100 * (index + 1)) // avoid spamming the endpoint
        await twitterClient.v1.reply(reply, res.in_reply_to_status_id_str)
    }))
}

