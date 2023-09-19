import { review } from "../../../../code-review-gpt/src/review/index";
import {
  GITHUB_APP_CLIENT_ID_PARAM_NAME,
  GITHUB_APP_CLIENT_SECRET_PARAM_NAME,
  GITHUB_APP_ID_PARAM_NAME,
  GITHUB_APP_PRIVATE_KEY_PARAM_NAME,
} from "../../constants";
import { getFilesWithChanges } from "../utils/getReviewFiles";
import { getVariableFromSSM } from "../utils/getVariable";
import { isValidEventDetail, ReviewEvent } from "../utils/types";

export const main = async (event: ReviewEvent): Promise<void> => {
  const eventDetail = event.detail;
  console.log(eventDetail);
  if (!isValidEventDetail(eventDetail)) {
    throw new Error(
      "Error fetching event in review-lambda event is of an unexpected shape"
    );
  }

  // Get/Set args
  const args = {
    model: "gpt-3.5",
    reviewType: "changed",
    setupTarget: "github",
    ci: undefined,
    org: undefined,
    commentPerFile: false,
    remote: undefined,
    _: [],
    $0: "",
  };

  // Get files from PR
  const pr = eventDetail.pull_request;
  console.log(
    `Get files with changes, base: ${pr.base.sha}, head ${pr.head.sha}`
  );

  // Extract file information
  // https://github.com/OrionTools/github-app-webhook-test/pull/2.diff?token=A6GLUYQKRKFHLAETM23YHCDFBBBJY
  // const response = await axios.get(`${pr.diff_url}?token=A6GLUYQKRKFHLAETM23YHCDFBBBJY`);
  // const diffContent = response.data as string;
  // const extractedInfo = extractFileInfo(diffContent);
  // Log the result
  // console.log(extractedInfo);

  const reviewFiles = await getFilesWithChanges({
    eventDetail,
    appId: await getVariableFromSSM(GITHUB_APP_ID_PARAM_NAME),
    privateKey: await getVariableFromSSM(GITHUB_APP_PRIVATE_KEY_PARAM_NAME),
    clientId: await getVariableFromSSM(GITHUB_APP_CLIENT_ID_PARAM_NAME),
    clientSecret: await getVariableFromSSM(GITHUB_APP_CLIENT_SECRET_PARAM_NAME),
    installationId: eventDetail.installation.id,
  });

  if (reviewFiles === undefined) {
    console.log("No files with changes found.");

    return;
  }

  try {
    // Use the same OpenAI key for everyone for now
    const openAIApiKey = await getVariableFromSSM(
      process.env.OPENAI_API_KEY_PARAM_NAME ?? ""
    );

    // The following can be used once the key is retrieved from user data in DynamoDB
    // Which will contain an encrypted key
    // const openAIKey = await decryptKey(userEncrypedKey);

    process.env.LANGCHAIN_API_KEY = await getVariableFromSSM(
      process.env.LANGCHAIN_API_KEY_PARAM_NAME ?? ""
    );

    const reviewResponse = await review(args, reviewFiles, openAIApiKey);
    // add review response to github.

    console.log("Code Successfully Reviewed", reviewResponse);

    return;
  } catch (err) {
    console.error(err);

    return;
  }
};

// eslint-disable-next-line complexity
// const extractFileInfo = (diff: string): ReviewFile[] => {
//   const reviewFiles: ReviewFile[] = [];
//   const lines = diff.split("\n");
//   let currentFile: ReviewFile | null = null;

//   for (const line of lines) {
//     if (line.startsWith("diff --git")) {
//       // Start of a new file
//       if (currentFile !== null) {
//         reviewFiles.push(currentFile);
//       }
//       currentFile = { fileName: "", fileContent: "", changedLines: "" };
//       const [, a, b] = line.match(/diff --git a\/(.+) b\/(.+)/) || [];
//       if (a && b) {
//         currentFile.fileName = b;
//       }
//     } else if (currentFile) {
//       // Process file content and changed lines
//       if (line.startsWith("+")) {
//         currentFile.changedLines += line + "\n";
//       } else if (!line.startsWith("-")) {
//         currentFile.fileContent += line + "\n";
//       }
//     }
//   }

//   // Push the last file
//   if (currentFile !== null) {
//     reviewFiles.push(currentFile);
//   }

//   return reviewFiles;
// };
