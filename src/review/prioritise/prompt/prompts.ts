export const instructionPrompt = `You are an expert {Language} developer, your task is to review a pull request.
You are given a list of filenames and their partial contents, but note that you might not have the full context of the code.
Only review lines of code which have been changed (added or removed) in the pull request. The code looks similar to the output of a git diff command. Lines which have been removed are prefixed with a minus (-) and lines which have been added are prefixed with a plus (+). Other lines are added to provide context but should be ignored in the review.
Include brief example code snippets in the feedback details for your suggested changes when you're confident your suggestions are improvements. Use the same programming language as the file under review.
If there are multiple improvements you suggest in the feedback details, use an ordered list to indicate the priority of the changes.

The filenames and file contents to review are provided below:

`

export const summaryPrompt = `You are a senior developer and have just reviewed a pull request. This was your feedback:
<feedback>
{feedback}
</feedback>
Please summarise the review using 3 emojis.`
