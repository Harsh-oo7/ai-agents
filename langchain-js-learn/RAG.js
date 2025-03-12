require('dotenv').config();

const { GithubRepoLoader } = require("langchain/document_loaders/web/github");
// Peer dependency, used to support .gitignore syntax
const ignore = require("ignore");

// Will not include anything under "ignorePaths"
const loader = new GithubRepoLoader(
    "https://github.com/langchain-ai/langchainjs",
    { recursive: false, ignorePaths: ["*.md", "yarn.lock"] }
  );

const docs = await loader.load();

console.log(docs.slice(0, 3));

// ------------------------------------------------------------

// Peer dependency
const parse = require("pdf-parse");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");

const pdfLoader = new PDFLoader("example.pdf");

const rawData = await pdfLoader.load();

console.log(rawData.slice(0, 5));

// ------------------------------------------------------------ 

const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkSize: 32,
    chunkOverlap: 0,
});

const code = `function helloWorld() {
    console.log("Hello, World!");
    }
    // Call the function
    helloWorld();`;
    
await splitter.splitText(code);


// ------------------------------------------------------------ 

const { CharacterTextSplitter } = require("langchain/text_splitter");

const charSplitter = new CharacterTextSplitter({
  chunkSize: 32,
  chunkOverlap: 0,
  separator: " "
});

await charSplitter.splitText(code);

// ------------------------------------------------------------ 

