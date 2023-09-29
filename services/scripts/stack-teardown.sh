#!/bin/bash

# List all stack names
stacks=$(aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE ROLLBACK_COMPLETE --query "StackSummaries[].StackName" --output text)

# Check if there are any stacks to delete
if [ "$stacks" == "None" ]; then
  echo "No stacks found."
  exit 0
fi

# Loop through each stack name
for stack in $stacks; do
    # Check if stack name does not start with 'Baselime', 'SST', or 'CDK'
    if [[ ! "$stack" == Baselime* && ! "$stack" == SST* && ! "$stack" == CDK* ]]; then
        echo "Deleting stack: $stack"
        
        # Delete the stack in the background
        { aws cloudformation delete-stack --stack-name $stack && aws cloudformation wait stack-delete-complete --stack-name $stack; } &
    else
        echo "Skipping stack: $stack"
    fi
done

# Wait for all background processes to complete
wait

echo "Stack deletion completed."
