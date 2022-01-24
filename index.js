const Discord = require('discord.js');
const Trivia = require('trivia-api');
const { decode } = require('html-entities');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('OK');
});

const client = new Discord.Client({ intents: [] });
const trivia = new Trivia({ encoding: 'url3986' });

let triviaCommand = {
    name: 'play-trivia',
    description: 'Play trivia',
    options: [
        {
            name: 'difficulty',
            type: 3,
            description: 'How hard of a question you want',
            choices: [
                { name: 'Easy', value: 'easy' },
                { name: 'Medium', value: 'medium' },
                { name: 'Hard', value: 'hard' },
            ]
        }
    ]
}

client.on('ready', () => {
    console.log('Logged in as', client.user.tag);
    client.api.applications(client.user.id)
        .guilds('933959461003989012')
        .commands.post({ data: triviaCommand })
    client.api.applications(client.user.id)
        .guilds('933959461003989012')
        .commands.post({ data: {
            name: 'dino',
            description: 'Get a dinosaur',
            options: []
        } })
        // https://geta.dino.icu/dino.png
});

client.on('interactionCreate', interaction => {
    if (interaction.commandName == 'play-trivia') {
        trivia.getQuestions({
            difficulty: interaction.options?._hoistedOptions[0]?.value
        }).then(question => {
            question = question.results[0];
            let id = Math.floor(Math.random() * 500) + '-' + Date.now()
            let answers = [
                question.correct_answer, ...question.incorrect_answers
            ].sort(() => Math.random() * 0.5)
            interaction.reply({
                embeds: [
                    new Discord.MessageEmbed().setTitle(question.category).setDescription(decode(question.question)).setFooter(question.difficulty).setColor('#ff33dd')
                ],
                components: [
                    {
                        type: 1,
                        components: answers.map((answer, index) => {
                            return {
                                type: 2,
                                label: decode(answer).substring(0, 80),
                                style: 1,
                                custom_id: id+ ':' + index + ',' + (question.correct_answer == answer)
                            }
                        })
                    }
                ]
            })
        })
        
    } else if (interaction.commandName == 'dino') {
        interaction.reply('https://geta.dino.icu/dino.png?time=' + Date.now());
    } else {
        let id = interaction.customId;
        let ending = id.split(',')[1];
        let correct = ending == 'true'
        let message = interaction.message;
        if (correct) {
            interaction.reply('Correct, <@' + interaction.user.id + '>.');
         //   interaction.message.edit({ components: [] });
        } else {
            interaction.reply('Incorrect :(');
         //   interaction.message.edit({ components: [] });
        }
    }
})


client.login(process.env.TOKEN);

app.listen(8080, () => {
    console.log('HTTP server ready!');
});