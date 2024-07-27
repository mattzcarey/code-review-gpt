import os
import argparse
from github import Github
from datasets import Dataset
from huggingface_hub import HfApi
from mlx_lm import load, lora

def fetch_review_comments(repo_name: str, token: str) -> list:
    g = Github(token)
    repo = g.get_repo(repo_name)
    comments = []
    
    for pr in repo.get_pulls(state='all'):
        for comment in pr.get_review_comments():
            comments.append(comment.body)
    
    return comments

def create_dataset(comments: list) -> Dataset:
    return Dataset.from_dict({"text": comments})

def push_to_hf(dataset: Dataset, dataset_name: str, token: str):
    api = HfApi(token=token)
    api.create_repo(repo_id=dataset_name, repo_type="dataset", private=True)
    dataset.push_to_hub(dataset_name, token=token)

def train_lora(base_model: str, dataset: Dataset, output_dir: str):
    model, tokenizer = load(base_model)
    
    # Prepare the dataset
    train_dataset = dataset.map(lambda examples: tokenizer(examples['text']), batched=True)
    
    # Configure LoRA
    lora_config = lora.LoRAConfig(
        r=8,
        alpha=16,
        dropout=0.05,
        layers_to_transform=["q_proj", "v_proj"],
    )
    
    # Apply LoRA to the model
    model = lora.apply_lora(model, lora_config)
    
    # Train the model
    lora.lora_train(
        model,
        train_dataset,
        eval_dataset=None,  # You can add an evaluation dataset if needed
        output_dir=output_dir,
        batch_size=4,
        max_steps=1000,
        save_steps=200,
        eval_steps=200,
        learning_rate=1e-4,
        warmup_steps=100,
    )

def main(repo_name: str, github_token: str, hf_token: str, base_model: str, dataset_name: str, output_dir: str):
    comments = fetch_review_comments(repo_name, github_token)
    dataset = create_dataset(comments)
    push_to_hf(dataset, dataset_name, hf_token)
    train_lora(base_model, dataset, output_dir)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a LoRA model on GitHub review comments.")
    parser.add_argument("--repo", type=str, required=True, help="GitHub repository name (owner/repo)")
    parser.add_argument("--github-token", type=str, required=True, help="GitHub personal access token")
    parser.add_argument("--hf-token", type=str, required=True, help="HuggingFace API token")
    parser.add_argument("--base-model", type=str, default="mlx-community/Llama-3-Groq-8B-Tool-Use-8bit", help="Base model to fine-tune")
    parser.add_argument("--dataset-name", type=str, required=True, help="Name for the dataset on HuggingFace")
    parser.add_argument("--output-dir", type=str, default=".crgpt/trained_model", help="Output directory for the trained model")
    
    args = parser.parse_args()
    
    main(args.repo, args.github_token, args.hf_token, args.base_model, args.dataset_name, args.output_dir)