const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

// Simple ROT13 encryption function
function encryptMessage(text) {
    return text.replace(/[a-zA-Z]/g, function(char) {
        return String.fromCharCode((char <= 'Z' ? 90 : 122) >= (char = char.charCodeAt(0) + 13) 
            ? char 
            : char - 26);
    });
}

// Function to check if string is numeric
function isNumeric(str) {
    return /^-?\d+$/.test(str.trim());
}

// Get source channels from environment variable, handling both single and multiple channels
const sourceChannels = process.env.SOURCE_CHANNEL_ID
    ? process.env.SOURCE_CHANNEL_ID.split(',').map(id => id.trim()).filter(id => id)
    : [];

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready to forward messages!');
    if (sourceChannels.length > 0) {
        console.log('Monitoring channels:', sourceChannels);
    } else {
        console.log('Warning: No source channels configured!');
    }
});

// Listen for messages
client.on('messageCreate', async message => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Check if the message is in any of the source channels
    if (sourceChannels.includes(message.channel.id)) {
        try {
            console.log('Message received in source channel:', message.content);
            
            // Check if the message is numeric
            if (!isNumeric(message.content)) {
                // Delete the non-numeric message
                await message.delete();
                // Send error message
                const errorMsg = await message.channel.send(`❌ ${message.member?.displayName || message.author.username}: commander, Only numbers are allowed as answers!`);
                // Delete error message after 5 seconds
                setTimeout(() => errorMsg.delete().catch(console.error), 5000);
                return;
            }
            
            // Get the target channel
            const targetChannel = await client.channels.fetch(process.env.TARGET_CHANNEL_ID);
            
            if (targetChannel) {
                // Get the member's display name (nickname) or fallback to username
                const displayName = message.member?.displayName || message.author.username;
                
                // Create the forwarded message with the author's display name
                const forwardedMessage = `${displayName}: ${message.content}`;
                
                // Send the message to the target channel
                await targetChannel.send(forwardedMessage);
                console.log('Message forwarded to target channel');
                
                // Encrypt the original message
                const encryptedMessage = encryptMessage(message.content);
                
                try {
                    // Delete the original message first
                    await message.delete();
                    console.log('Original message deleted');
                    
                    // Send the encrypted message as a new message
                    const encryptedMsg = await message.channel.send(`🔒 ${displayName}:  commander, answer submitted successfully 🫡`);
                    console.log('Encrypted message sent');
                    
                    // Add a reaction to indicate the message was processed
                    await encryptedMsg.react('✅');
                    console.log('Reaction added');
                } catch (deleteError) {
                    console.error('Error in message processing:', deleteError);
                    // If we can't delete the message, at least send the encrypted version
                    const encryptedMsg = await message.channel.send(`🔒 ${displayName}:  commander, answer submitted successfully 🫡`);
                    await encryptedMsg.react('✅');
                }
            } else {
                console.error('Target channel not found!');
                await message.reply('Error: Target channel not found. Please contact an administrator.');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            // Don't send error message to avoid confusion
        }
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 
