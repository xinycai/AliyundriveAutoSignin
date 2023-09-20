// 请在下面填入具体的 refresh_token和botToken,chatId
const refreshToken = 'fa96c2e83324415XXXXXXXXXXXXXXXXXXXX';
const botToken = 'XXXXXXX056:AAGx5nFaIoXXXXXXXXXXXXXX0fLU';
const chatId = '5XXXX63';

const axios = require('axios');

const updateAccesssTokenURL = 'https://auth.aliyundrive.com/v2/account/token';
const signinURL = 'https://member.aliyundrive.com/v1/activity/sign_in_list?_rx-s=mobile';
const rewardURL = 'https://member.aliyundrive.com/v1/activity/sign_in_reward?_rx-s=mobile';

// 使用 refresh_token 更新 access_token
function updateAccesssToken(queryBody, remarks) {
    const errorMessage = [remarks, '更新 access_token 失败'];
    return axios(updateAccesssTokenURL, {
        method: 'POST',
        data: queryBody,
        headers: {'Content-Type': 'application/json'},
    })
        .then((d) => d.data)
        .then((d) => {
            const {code, message, nick_name, refresh_token, access_token} = d;
            if (code) {
                if (
                    code === 'RefreshTokenExpired' ||
                    code === 'InvalidParameter.RefreshToken'
                )
                    errorMessage.push('refresh_token 已过期或无效');
                else errorMessage.push(message);
                return Promise.reject(errorMessage.join(', '));
            }
            return {nick_name, refresh_token, access_token};
        })
        .catch((e) => {
            return Promise.reject(errorMessage.join(', '));
        });
}

//签到列表
function sign_in(access_token, remarks) {
    const sendMessage = [remarks];
    return axios(signinURL, {
        method: 'POST',
        data: {
            isReward: false,
        },
        headers: {
            Authorization: access_token,
            'Content-Type': 'application/json',
        },
    })
        .then((d) => d.data)
        .then(async (json) => {
            if (!json.success) {
                sendMessage.push('签到失败', json.message);
                return Promise.reject(sendMessage.join(', '));
            }

            sendMessage.push('签到成功');

            const {signInLogs, signInCount} = json.result;
            const currentSignInfo = signInLogs[signInCount - 1]; // 当天签到信息

            sendMessage.push(`本月累计签到 ${signInCount} 天`);

            // 未领取奖励列表
            const rewards = signInLogs.filter(
                (v) => v.status === 'normal' && !v.isReward
            );

            if (rewards.length) {
                for await (reward of rewards) {
                    const signInDay = reward.day;
                    try {
                        const rewardInfo = await getReward(access_token, signInDay);
                        sendMessage.push(
                            `第${signInDay}天奖励领取成功: 获得${rewardInfo.name || ''}${
                                rewardInfo.description || ''
                            }`
                        );
                    } catch (e) {
                        sendMessage.push(`第${signInDay}天奖励领取失败:`, e);
                    }
                }
            } else if (currentSignInfo.isReward) {
                sendMessage.push(
                    `今日签到获得${currentSignInfo.reward.name || ''}${
                        currentSignInfo.reward.description || ''
                    }`
                );
            }

            return sendMessage.join(', ');
        })
        .catch((e) => {
            sendMessage.push('签到失败');
            sendMessage.push(e.message);
            return Promise.reject(sendMessage.join(', '));
        });
}

// 领取奖励
function getReward(access_token, signInDay) {
    return axios(rewardURL, {
        method: 'POST',
        data: {signInDay},
        headers: {
            authorization: access_token,
            'Content-Type': 'application/json',
        },
    })
        .then((d) => d.data)
        .then((json) => {
            if (!json.success) {
                return Promise.reject(json.message);
            }
            return json.result;
        });
}

function sendMessages(botToken, chatId, sendMessage){
    // 构建 Telegram 发送消息的 API URL
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 准备 POST 请求的数据
    const postData = {
        chat_id: chatId,
        text: sendMessage,
    };

    // 发送 POST 请求到 Telegram
    axios.post(telegramApiUrl, postData)
        .then((response) => {
            console.log('消息已发送到 Telegram:', response.data);
        })
        .catch((error) => {
            console.error('发送消息到 Telegram 时出错:', error);
        });
}

!(async () => {
    const remarks = '阿里云盘自动签到'

    const queryBody = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    };

    try {
        const {nick_name, refresh_token, access_token} = await updateAccesssToken(queryBody, remarks);
        const sendMessage = await sign_in(access_token, remarks);
        sendMessages(botToken, chatId, sendMessage);
    } catch (e) {
        sendMessages(botToken, chatId, e);
    }
})();
