require('dotenv').config();
const { ChatOpenAI } = require('@langchain/openai');
const { TavilySearchResults } = require("@langchain/community/tools/tavily_search");
const { HumanMessage } = require('@langchain/core/messages');
const { Agent } = require('./Agent.js');

// Create the search tool
const tool = new TavilySearchResults({ maxResults: 4, apiKey: process.env.TAVILY_API_KEY }); // increased number of results
console.log(typeof tool);
console.log(tool.name);


const prompt = `You are a smart research assistant. Use the search engine to look up information. 
You are allowed to make multiple calls (either together or in sequence). 
Only look up information when you are sure of what you want. 
If you need to look up some information before asking a follow up question, you are allowed to do that!`;

const main = async () => {
  const model = new ChatOpenAI({ modelName: "gpt-4o" }); // reduce inference cost
  const abot = new Agent(model, [tool], prompt);
  
  // In Node.js we can't easily generate and display graph visualizations like in IPython
  // But the graph functionality should still work
  
  const messages = [new HumanMessage({ content: "What is the weather in sf?" })];
    const result = await abot.graph.invoke({ messages });
  console.log(result);
};

main()