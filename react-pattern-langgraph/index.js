require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');
const { TavilySearchResults } = require("@langchain/community/tools/tavily_search");
const { HumanMessage } = require('@langchain/core/messages');
const { Agent } = require('./Agent.js');
const { SqliteSaver } =  require("@langchain/langgraph-checkpoint-sqlite");
const memory = SqliteSaver.fromConnString(":memory:");

// Create the search tool
const tool = new TavilySearchResults({ maxResults: 4, apiKey: process.env.TAVILY_API_KEY }); // increased number of results

const prompt = `You are a smart research assistant. Use the search engine to look up information. 
You are allowed to make multiple calls (either together or in sequence). 
Only look up information when you are sure of what you want. 
If you need to look up some information before asking a follow up question, you are allowed to do that!`;

const main = async () => {
  const model = new ChatOpenAI({ 
    modelName: "gpt-4-turbo-preview",
    temperature: 0
  });
  
  try {
    const messages = [new HumanMessage({ content: "What is the weather in sf?" })];
    
    const abot = new Agent(model, [tool], prompt);
    const result = await abot.graph.invoke({ messages });
    console.log(result);


    // ----------------------------------------------------------------
    // Stream the events
    // const abot = new Agent(model, [tool], prompt, memory);

    // Thread configuration for conversation state management
    // - thread_id uniquely identifies this conversation
    // - enables state persistence and checkpointing via SQLite
    // - allows resuming conversations and maintaining history
    // - useful when running multiple concurrent conversations
    // const thread = { "configurable": { "thread_id": "1" } }
    // for await (const event of await abot.graph.stream({ messages }, thread)) {
    //   console.log(event);
    // }



  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
};

main().catch(console.error);