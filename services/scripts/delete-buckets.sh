#!/bin/bash

# List all bucket names
buckets=$(aws s3api list-buckets --query "Buckets[].Name" --output text)

# Loop through each bucket name
for bucket in $buckets; do
    # Check if bucket name does not start with 'sst', 'cdk', or 'baselime'
    if [[ ! "$bucket" == sst* && ! "$bucket" == cdk* && ! "$bucket" == baselime* ]]; then
        echo "Processing bucket: $bucket"

        # Empty the bucket
        aws s3 rm s3://$bucket --recursive

        # Delete the bucket
        aws s3api delete-bucket --bucket $bucket
    fi
done
