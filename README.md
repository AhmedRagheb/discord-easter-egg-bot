# Discord Answer Forwarder Bot

A Discord bot that forwards messages from source channels to a target channel while encrypting the original messages.

## Setup

1. Create a Discord application and bot at https://discord.com/developers/applications
2. Get your bot token and channel IDs
3. Set up environment variables:
   ```
   DISCORD_TOKEN=your_bot_token_here
   SOURCE_CHANNEL_ID=channel_id1,channel_id2
   TARGET_CHANNEL_ID=target_channel_id
   ```

## Running Locally

```bash
npm install
npm start
```

## Deploying to Railway

1. Fork this repository
2. Create a Railway account
3. Create a new project
4. Add your environment variables
5. Deploy! 