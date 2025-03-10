# LangChain Agent with GPT-4 and Tavily Search

This project implements a flexible agent system using LangChain's StateGraph architecture, integrating OpenAI's GPT-4 model with Tavily search capabilities. The agent can process queries, perform web searches, and maintain conversational context.

## Features

- Integration with GPT-4 Turbo
- Tavily search tool integration
- State management using LangChain's StateGraph
- Flexible tool architecture for easy extension
- Error handling and logging

## System Architecture

Below is the flow diagram showing how the agent processes requests:

```
                                   [User Input]
                                        │
                                        ▼
                             ┌──────────────────┐
                             │    Start Node    │
                             └────────┬─────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │    LLM Node      │◄─────────┐
                             │  (callOpenAI)    │          │
                             └────────┬─────────┘          │
                                      │                     │
                                      ▼                     │
                             ┌──────────────────┐          │
                             │   existsAction   │          │
                             │    Check if      │          │
                             │ Tool Call Needed │          │
                             └────────┬─────────┘          │
                                      │                     │
                           ┌─────────┴──────────┐         │
                           │                    │         │
                           ▼                    ▼         │
                    [No Tool Needed]    [Tool Needed]     │
                           │                    │         │
                           │            ┌───────┘         │
                           │            ▼                 │
                           │    ┌──────────────────┐     │
                           │    │   Action Node    │     │
                           │    │   (takeAction)   │     │
                           │    └────────┬─────────┘     │
                           │             │               │
                           │             └───────────────┘
                           │
                           ▼
                         [END]
```

### Flow Description

1. User input enters the system
2. Start node initiates the flow
3. LLM Node (callOpenAI):
   - Processes current messages
   - Generates response using GPT-4
4. existsAction Check:
   - If LLM requests tool use -> go to Action Node
   - If no tool needed -> END
5. Action Node (takeAction):
   - Executes requested tools
   - Returns results back to LLM
6. Cycle continues until no more tool calls needed

## Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- OpenAI API key
- Tavily API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

## Project Structure

- `index.js`: Main entry point that sets up the agent and handles the interaction
- `Agent.js`: Core agent implementation with StateGraph logic and tool handling

## Dependencies

- `@langchain/openai`: LangChain's OpenAI integration
- `@langchain/core`: Core LangChain functionality
- `@langchain/community`: Community tools including Tavily search
- `dotenv`: Environment variable management

## Usage

1. Make sure you have set up your environment variables in `.env`

2. Run the example:
```bash
node index.js
```

The example code demonstrates a weather query for San Francisco, but you can modify the query in `index.js` to ask different questions.

## How It Works

1. The agent is initialized with:
   - An OpenAI model (GPT-4 Turbo)
   - A set of tools (Tavily search in the example)
   - A system prompt

2. The StateGraph manages the conversation flow:
   - Processes user input
   - Makes API calls to OpenAI
   - Executes tools when needed
   - Returns responses

3. The agent can:
   - Make multiple search queries
   - Process search results
   - Maintain conversation context
   - Handle errors gracefully

## Extending the Agent

You can extend the agent's capabilities by:
1. Adding new tools to the tools array in `index.js`
2. Modifying the system prompt
3. Adjusting the model parameters
4. Adding new nodes to the StateGraph in `Agent.js`

## Error Handling

The system includes comprehensive error handling for:
- API calls
- Tool execution
- Invalid responses
- Missing tools

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here] 