const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Allowed role IDs
const ALLOWED_ROLES = [
  '1269410534558666752' // Mod role ID
];

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() && !interaction.isButton() && interaction.type !== InteractionType.ModalSubmit) return;

    const hasAllowedRole = ALLOWED_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));

    try {
        if (interaction.commandName === "rules-embed") {
            if (!hasAllowedRole) {
                return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Chat Rules')
                .setThumbnail('https://i.scdn.co/image/ab67616d0000b273e93714df13018cd0481579c2')
                .addFields(
                    { name: 'Rule #1', value: 'No NSFW' },
                    { name: 'Rule #2', value: 'No Advertising in chat' },
                    { name: 'Rule #3', value: 'No memes in chat' },
                    { name: 'Rule #4', value: 'English only' },
                    { name: 'Rule #5', value: 'No spamming' },
                    { name: 'Rule #6', value: 'No Doxxing' },
                    { name: 'Rule #7', value: 'No Swearing (Unless for a joke)' },
                    { name: 'Rule #8', value: 'No Racism' },
                    { name: 'Rule #9', value: 'Have fun' },
                    { name: 'Rule #10', value: "Don't be purposely mad" },
                    { name: 'Rule #11', value: 'No bullying' },
                    { name: 'Rule #12', value: 'No Staff Disrespect' }
                );

            await interaction.reply({ embeds: [embed] });
        }

        if (interaction.commandName === 'tickets-embed') {
            if (!hasAllowedRole) {
                return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Donutcity Community | Tickets')
                .setFields([
                    { name: 'Claim Giveaways', value: 'Create this type of ticket when you want to claim a giveaway' },
                    { name: 'Market', value: 'Create this ticket to buy or sell something' },
                    { name: 'Support', value: 'General support and partnerships.' }
                ]);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('support-ticket')
                        .setLabel('Create Support Ticket')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('claim-giveaway')
                        .setLabel('Claim Giveaway')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('market')
                        .setLabel('Market')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({ embeds: [embed], components: [buttons] });
        }

        if (interaction.isButton() && interaction.customId !== 'close-ticket') {
            const modal = new ModalBuilder()
                .setCustomId(`ticket-modal-${interaction.customId}`)
                .setTitle('Ticket Information');

            const ignInput = new TextInputBuilder()
                .setCustomId('ign')
                .setLabel("What's your IGN?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(ignInput));

            if (interaction.customId === 'market') {
                const itemInput = new TextInputBuilder()
                    .setCustomId('item')
                    .setLabel("What do you want to buy/sell?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(itemInput));
            }

            if (interaction.customId === 'claim-giveaway') {
                const giverInput = new TextInputBuilder()
                    .setCustomId('giver')
                    .setLabel("Who made the giveaway?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const amountInput = new TextInputBuilder()
                    .setCustomId('amount')
                    .setLabel("For how much was it?")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(giverInput));
                modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
            }

            if (interaction.customId === 'support-ticket') {
                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel("Why do you want support?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
            }

            await interaction.showModal(modal);
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            const ign = interaction.fields.getTextInputValue('ign');
            let channelName;
            let embedFields = [{ name: 'IGN', value: ign }];

            if (interaction.customId === 'ticket-modal-market') {
                const item = interaction.fields.getTextInputValue('item');
                channelName = `market-${interaction.user.username}`;
                embedFields.push({ name: 'Item', value: item });
            }

            if (interaction.customId === 'ticket-modal-claim-giveaway') {
                const giver = interaction.fields.getTextInputValue('giver');
                const amount = interaction.fields.getTextInputValue('amount');
                channelName = `${interaction.user.username}-${amount}`;
                embedFields.push({ name: 'Giver', value: giver }, { name: 'Amount', value: amount });
            }

            if (interaction.customId === 'ticket-modal-support-ticket') {
                const reason = interaction.fields.getTextInputValue('reason');
                channelName = `support-${interaction.user.username}`;
                embedFields.push({ name: 'Reason', value: reason });
            }

            try {
                const channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0, // 0 represents a text channel
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                            ],
                        },
                        {
                            id: '1269410534558666752', // Mod role ID
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                            ],
                        },
                    ],
                });

                console.log(`Channel created: ${channel.name}`);

                const embed = new EmbedBuilder()
                    .setTitle('Ticket Information')
                    .addFields(embedFields)
                    .setColor('Blue')
                    .setTimestamp()
                    .setFooter({ text: 'Ticket System', iconURL: 'https://i.scdn.co/image/ab67616d0000b273e93714df13018cd0481579c2' });

                const closeButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('close-ticket')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                    );

                await channel.send({
                    content: `Ticket created by ${interaction.user}`,
                    embeds: [embed],
                    components: [closeButton]
                });

                await interaction.reply({ content: `Your ticket has been created: ${channel}`, ephemeral: true });

            } catch (error) {
                console.error('Error creating channel:', error);
                await interaction.reply({ content: `An error occurred while creating the ticket channel: ${error.message}`, ephemeral: true });
            }
        }

        if (interaction.customId === 'close-ticket') {
            const channel = interaction.channel;
            await channel.delete();
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `An error occurred while handling your request: ${error.message}`, ephemeral: true });
        } else {
            await interaction.reply({ content: `An error occurred while handling your request: ${error.message}`, ephemeral: true });
        }
    }
});

client.on("ready", (c) => {
  console.log(`Bot is logged in as ${c.user.tag}`);
  client.user.setActivity({
    name: "Made by @Developers-fun#0720"
  });
});

client.login(process.env.Token);
