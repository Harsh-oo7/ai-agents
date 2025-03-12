const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { 
    SystemMessagePromptTemplate, 
    HumanMessagePromptTemplate 
  } = require("@langchain/core/prompts");

const prompt = ChatPromptTemplate.fromTemplate(
    `What are three good names for a company that makes {product}?`
)

// returns only string
await prompt.format({
    product: 'ice cream'
});

// OR

// returns an array of type HumanMessage
await prompt.formatMessages({
    product: 'ice cream'
})


const promptFromMessages = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
        "You are an expert at picking company names."
    ),
    HumanMessagePromptTemplate.fromTemplate(
        "What are three good names for a company that makes {product}?"
    )
]);

await promptFromMessages.formatMessages({
    product: "shiny objects"
});

// OR

ChatPromptTemplate.fromMessages([
    ["system", "You are an expert at picking company names."],
    ["human", "What are three good names for a company that makes {product}?"]
]);

await promptFromMessages.formatMessages({
    product: "shiny objects"
});