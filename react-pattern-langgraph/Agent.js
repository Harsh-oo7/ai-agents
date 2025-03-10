const { SystemMessage, ToolMessage, AIMessage } = require('@langchain/core/messages');
const { StateGraph, END } = require('@langchain/langgraph');

/**
 * Agent class that implements a conversational AI agent using LangChain's StateGraph
 * This agent can process messages, use tools, and maintain conversation state
 */
class Agent {
    /**
     * Initialize a new Agent instance
     * @param {Object} model - The LangChain model instance (e.g., ChatOpenAI)
     * @param {Array} tools - Array of tools the agent can use
     * @param {string} system - System prompt to guide the agent's behavior
     */
    constructor(model, tools, system = "", checkpointer = null) {
      this.system = system;
      
      // Initialize StateGraph with a messages channel that concatenates previous and next messages
      const graph = new StateGraph({ channels: { messages: (prev = [], next = []) => [...prev, ...next] } });
      
      // Add main processing nodes to the graph
      graph.addNode("llm", this.callOpenAI.bind(this));     // Node for making OpenAI API calls
      graph.addNode("action", this.takeAction.bind(this));   // Node for executing tools
      graph.addEdge("__start__", "llm");                    // Start the flow with the LLM
      
      // Add conditional routing based on whether the LLM wants to use a tool
      graph.addConditionalEdges(
        "llm",
        this.existsAction.bind(this),
        { true: "action", false: END }  // If tool needed -> action node, else end
      );
      
      // After tool execution, always go back to LLM for next step
      graph.addEdge("action", "llm");
      
      const graphCompilerOptions = {};
      if(checkpointer) {
        graphCompilerOptions.checkpointer = checkpointer;
      }
      this.graph = graph.compile(graphCompilerOptions);

      // Convert tools array to a map for easy lookup
      this.tools = tools.reduce((acc, t) => {
        acc[t.name] = t;
        return acc;
      }, {});
      
      // Bind tools to the model for function calling
      this.model = model.bindTools(tools);
      console.log("Agent created!");
    }
  
    /**
     * Checks if the last message contains any tool calls
     * @param {Object} state - Current state containing message history
     * @returns {boolean} - True if the last message requests a tool action
     */
    existsAction(state) {
        const lastMessage = state.messages[state.messages.length - 1];
        // Only check AIMessages for tool calls
        if (!lastMessage || !(lastMessage instanceof AIMessage)) {
            return false;
        }
        const hasToolCalls = lastMessage.additional_kwargs?.tool_calls?.length > 0;
        return hasToolCalls;
    }
  
    /**
     * Makes an API call to OpenAI with the current conversation state
     * @param {Object} state - Current state containing message history
     * @returns {Object} - New state with the model's response added
     */
    async callOpenAI(state) {
        let messages = [...state.messages];
        
        // Add system prompt if it doesn't exist at the start
        if (this.system && (!messages.length || !(messages[0] instanceof SystemMessage))) {
            messages = [new SystemMessage({ content: this.system }), ...messages];
        }

        try {
            const response = await this.model.invoke(messages);
            return { messages: [response] };
        } catch (error) {
            console.error("Error calling OpenAI:", error);
            throw error;
        }
    }
  
    /**
     * Executes tool calls requested by the LLM
     * @param {Object} state - Current state containing message history
     * @returns {Object} - New state with tool execution results added
     */
    async takeAction(state) {
        const lastMessage = state.messages[state.messages.length - 1];
        const toolCalls = lastMessage.additional_kwargs?.tool_calls || [];
        
        const results = [];
        // Process each tool call sequentially
        for (const toolCall of toolCalls) {
            try {
                // Get tool name from either function call format or direct format
                const toolName = toolCall.function?.name || toolCall.name;
                const tool = this.tools[toolName];
                
                if (!tool) {
                    console.warn(`Tool ${toolName} not found`);
                    continue;
                }

                // Parse tool arguments based on the format they're provided in
                const args = toolCall.function?.arguments ? 
                    JSON.parse(toolCall.function.arguments) : 
                    toolCall.args;

                // Execute the tool and store its result
                const result = await tool.invoke(args);
                
                // Format the tool result as a message
                results.push(new ToolMessage({
                    tool_call_id: toolCall.id,
                    name: toolName,
                    content: typeof result === 'string' ? result : JSON.stringify(result)
                }));
            } catch (error) {
                console.error(`Error executing tool ${toolCall.name}:`, error);
                // Include error messages in the conversation for proper error handling
                results.push(new ToolMessage({
                    tool_call_id: toolCall.id,
                    name: toolCall.name || toolCall.function?.name,
                    content: `Error: ${error.message}`
                }));
            }
        }
        
        // Return both the original message and tool results to maintain conversation context
        return { messages: [lastMessage, ...results] };
    }
}

module.exports = {
    Agent
} 