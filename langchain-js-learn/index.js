require('dotenv').config();

const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');

const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    const result = await model.invoke([
        new HumanMessage('Tell me a joke')
    ]);
    
    console.log(result);
}

main();