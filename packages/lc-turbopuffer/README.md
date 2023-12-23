# LangChainJS x TurboPuffer

This is a 3rd party integration of [TurboPuffer](https://turbopuffer.com/) as a Vector Store class into the [LangChain](https://langchain.org/) ecosystem.

Turbopuffer is a vector store built ontop of object storage so it is remarkably cheap and scalable.

Python is always going to come first as an official version so I thought I'd make a JS version for the community.

## Installation

```bash
npm install langchain-turbopuffer
```

or if you use pnpm

```bash
pnpm install langchain-turbopuffer
```

## Usage

```javascript
import { TurboPufferVectorStore } from "langchain-turbopuffer";

const embeddings = new OpenAIEmbeddings();

const vectorStore = new TurboPufferVectorStore(embeddings);

const doc = new Document({
  pageContent: "This is a test",
  metadata: {
    source: "https://example.com",
  },
});

await vectorStore.addDocuments([doc]);
```

## Contribute to the project

This is a community project, so feel free to contribute to it and bring up any issues. If you have any questions, please contact me on the Turbopuffer Slack.
