const { SystemMessage, ToolMessage } = require('@langchain/core/messages');
const { StateGraph, END } = require('@langchain/langgraph');

class Agent {
    constructor(model, tools, system = "") {
      this.system = system;
      
      console.log("Creating agent...");
      // Create state graph
      const graph = new StateGraph({ channels: { messages: (prev = [], next = []) => [...prev, ...next] } });
      
      console.log("Adding nodes...");
      graph.addNode("llm", this.callOpenAI.bind(this));
      graph.addNode("action", this.takeAction.bind(this));

        // Set the entry point without using deprecated method
        graph.addEdge("__start__", "llm");
      
      graph.addConditionalEdges(
        "llm",
        this.existsAction.bind(this),
        { true: "action", false: END }
      );
      
      graph.addEdge("action", "llm");
    //   graph.set("llm");
      
    console.log("Compiling graph...");
      this.graph = graph.compile();
      console.log("Graph compiled!");
      this.tools = tools.reduce((acc, t) => {
        acc[t.name] = t;
        return acc;
      }, {});
      
      this.model = model.bindTools(tools);
    //   console.log("Model bound to tools!", tools);
      console.log("Agent created!");
    }
  
    existsAction(state) {
        console.log("Checking if action exists...");
      const result = state.messages[state.messages.length - 1];
      console.log("result.tool_calls", result.tool_calls)
      return result && result.tool_calls && result.tool_calls.length > 0;
    }
  
    async callOpenAI(state) {
        console.log("Calling OpenAI...");
        console.log(state);
      let messages = state.messages;
      
      if (this.system) {
        messages = [new SystemMessage({ content: this.system }), ...messages];
      }

    //   console.log("messages", messages)
      
      const message = await this.model.invoke(messages);
      console.log("Message from OpenAI:");
    //   console.log(message);
      return { messages: [message] };
    }
  
    async takeAction(state) {
        console.log("Taking action...");
        console.log(state)
      const toolCalls = state.messages[state.messages.length - 1].tool_calls;
      const results = [];

      console.log("toolCalls", toolCalls)
      
      for (const t of toolCalls) {
        console.log(`Calling: ${JSON.stringify(t)}`);
        
        if (!(t.name in this.tools)) {
          console.log("\n ....bad tool name....");
          results.push(new ToolMessage({
            tool_call_id: t.id,
            name: t.name,
            content: "bad tool name, retry"
          }));
        } else {
          const result = await this.tools[t.name].invoke(t.args);
          results.push(new ToolMessage({
            tool_call_id: t.id,
            name: t.name,
            content: String(result)
          }));
        }
      }
      
      console.log("Back to the model!");
      return { messages: results };
    }
}

module.exports = {
    Agent
}

