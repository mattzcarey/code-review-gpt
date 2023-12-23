import dotenv from "dotenv";
import { promises as fsPromises } from "fs";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { tmpdir } from "os";
import { join } from "path";
import { removeFilesCommand, removeFoldersCommand } from "./constants";
import { executeCommand, openFile, savePage } from "./utils";

dotenv.config();

export class CRGPTLoader {
  private link: string;
  private embeddings: OpenAIEmbeddings;

  constructor(link: string) {
    this.link = link;
    this.embeddings = new OpenAIEmbeddings();
  }

  private extractRepoName(): string {
    return this.link.split("/").slice(-1)[0];
  }

  private async splitDocuments(documents: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
    });

    return splitter.splitDocuments(documents);
  }

  private async buildDocument(
    filePath: string
  ): Promise<Document<{ source: string }>> {
    return new Document({
      pageContent: await openFile(filePath),
      metadata: {
        source: filePath,
      },
    });
  }

  private async getEmbeddings(documents: Document[]): Promise<Number[][]> {
    return this.embeddings.embedDocuments(
      documents.map((doc) => doc.pageContent)
    );
  }

  private async storeDocuments(
    documents: Document[],
    embeddings: Number[][],
    indexName = this.extractRepoName()
  ): Promise<void> {
    try {
      const ids = documents.map((_, index) => index);
      const attributes = {
        source: documents.map((doc) => doc.metadata.source),
        pageContent: documents.map((doc) => doc.pageContent),
      };

      const apiEndpoint = `https://api.turbopuffer.com/v1/vectors/${indexName}`;
      const headers = {
        Authorization: `Bearer ${process.env.TURBOPUFFER_API_KEY}`,
        "Content-Type": "application/json",
      };

      await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ids,
          vectors: embeddings,
          attributes,
        }),
      });
    } catch (error) {
      console.error("Error storing documents:", error);
      throw error;
    }
  }

  public async load(): Promise<void> {
    try {
      const tempDir = await this.cloneRepository();
      await this.removeUnwantedFilesAndFolders(tempDir);

      const documents = await this.createDocuments(tempDir);

      const chunks = await this.splitDocuments(documents);
      const embeddings = await this.getEmbeddings(chunks);

      await this.storeDocuments(chunks, embeddings);
      console.log("Documents stored");

      await this.cleanup(tempDir);
    } catch (error) {
      console.error("Error in CRGPTLoader:", error);
    }
  }

  private async cloneRepository(): Promise<string> {
    const tempDir = await fsPromises.mkdtemp(join(tmpdir(), "CRGPTLoader-"));
    const cloneCommand = `git clone --depth 1 ${this.link} ${tempDir}`;
    await executeCommand(cloneCommand);
    return tempDir;
  }

  private async removeUnwantedFilesAndFolders(tempDir: string): Promise<void> {
    try {
      await executeCommand(removeFoldersCommand(tempDir));
      await executeCommand(removeFilesCommand(tempDir));
    } catch (error) {
      console.error("Error removing files or folders:", error);
    }
  }

  private async cleanup(tempDir: string): Promise<void> {
    await executeCommand(`rm -rf ${tempDir}`);
  }

  private async createDocuments(
    directory: string
  ): Promise<Document<{ source: string }>[]> {
    const entries = await fsPromises.readdir(directory, {
      withFileTypes: true,
    });
    const documents: Document<{ source: string }>[] = [];

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        documents.push(...(await this.createDocuments(fullPath)));
      } else if (entry.isFile()) {
        try {
          const document = await this.buildDocument(fullPath);
          documents.push(document);
        } catch (error) {
          console.error(`Error reading file ${entry.name}:`, error);
        }
      }
    }

    return documents;
  }

  public async read(): Promise<void> {
    const namespace = this.extractRepoName();
    let nextCursor = null;
    const dataDir = "./data";
    let pageIndex = 0;

    do {
      try {
        const response = await this.fetchPage(namespace, nextCursor);

        if (response.status === 202) {
          // Data not ready, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 seconds
          continue;
        }

        // Parse the response body as JSON
        const data = await response.json();
        const { ids, vectors, attributes, next_cursor } = data;

        savePage(dataDir, pageIndex, ids, vectors, attributes);

        nextCursor = next_cursor;
        pageIndex++;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    } while (nextCursor);
  }

  private async fetchPage(
    namespace: string,
    cursor: string | null
  ): Promise<Response> {
    const apiEndpoint = new URL(
      `https://api.turbopuffer.com/v1/vectors/${namespace}`
    );

    if (cursor) {
      apiEndpoint.searchParams.append("cursor", cursor);
    }

    const response = await fetch(apiEndpoint.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TURBOPUFFER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  public async delete(indexName = this.extractRepoName()): Promise<void> {
    try {
      // Set up the API endpoint and headers
      const apiEndpoint = `https://api.turbopuffer.com/v1/vectors/${indexName}`;
      const headers = {
        Authorization: `Bearer ${process.env.TURBOPUFFER_API_KEY}`,
      };

      // Make the DELETE request
      const res = await fetch(apiEndpoint, {
        method: "DELETE",
        headers,
      });

      // Parse the response
      const response = await res.json();

      // Log the response status
      console.log("Delete response:", response.data);
    } catch (error) {
      console.error("Error deleting documents:", error);
      throw error;
    }
  }
}
