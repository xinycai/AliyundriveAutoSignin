# AliyundriveAutoSignin

## 阿里云盘自动签到并将签到信息推送到Telegram机器人

### 环境要求

- Node.js
- Axios

### 使用方法

#### 安装 Node.js（以 Debian 11 为例）

```shell
apt install nodejs
```

#### 安装 Axios

```shell
npm install axios
```

#### 下载 autoSignin.js

#### 获取 Telegram 机器人 Token 和 Chat ID 并填入文件

#### 获取 refresh_token 并添加到文件中

- 自动获取: 登录 [阿里云盘](https://www.aliyundrive.com/drive/) 后，控制台粘贴以下代码：

```javascript
copy(JSON.parse(localStorage.token).refresh_token); 
console.log(JSON.parse(localStorage.token).refresh_token);
```

#### 执行测试命令

```shell
node autoSignin.js
```

#### 测试成功后可以使用 crontab 添加定时任务执行

```shell
crontab -e
```

输入定时任务命令，每天九点执行：

```shell
0 9 * * * node /path/autoSignin.js
```

### 鸣谢

- [@mrabit](https://github.com/mrabit): [mrabit/aliyundriveDailyCheck](https://github.com/mrabit/aliyundriveDailyCheck)
