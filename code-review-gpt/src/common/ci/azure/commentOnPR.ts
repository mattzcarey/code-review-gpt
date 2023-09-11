import axios from 'axios';

const azureDevOpsBaseUrl = 'https://dev.azure.com/YourOrganizationName';
const personalAccessToken = 'YourPersonalAccessToken';
const project = 'YourProjectName';
const repositoryId = 'YourRepositoryId';
const pullRequestId = 'YourPullRequestId';

const commentOnPR = async (comment: string): Promise<void> => {
  try {
    const url = `${azureDevOpsBaseUrl}/${project}/_apis/pullrequest/${pullRequestId}/threads?api-version=6.0`;

    const threadData = {
      comments: [
        {
          parentCommentId: 0,
          content: comment,
        },
      ],
    };

    const response = await axios.post(url, threadData, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${personalAccessToken}`).toString('base64')}`,
      },
    });

    if (response.status === 200) {
      console.log('Comment posted successfully.');
    } else {
      console.error('Failed to post comment:', response.statusText);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
};

// Usage
commentOnPR('This is a test comment.');
