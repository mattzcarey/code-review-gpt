import os
import argparse
import hashlib
from huggingface_hub import snapshot_download
from mlx_lm import load, stream_generate

MODEL_CACHE_DIR = ".crgpt/model_cache"
MODEL_VERSION_FILE = "model_version.txt"

def get_model_hash(model_name: str) -> str:
    return hashlib.md5(model_name.encode()).hexdigest()

def load_model(model_name: str) -> tuple:
    model_hash = get_model_hash(model_name)
    model_path = os.path.join(os.getcwd(), MODEL_CACHE_DIR, model_hash)
    version_file = os.path.join(model_path, MODEL_VERSION_FILE)

    if os.path.exists(version_file):
        with open(version_file, 'r') as f:
            cached_model_name = f.read().strip()
        if cached_model_name == model_name:
            print(f"Using cached model: {model_name}")
        else:
            print(f"Cached model mismatch. Downloading: {model_name}")
            snapshot_download(repo_id=model_name, local_dir=model_path)
    else:
        print(f"Downloading model: {model_name}")
        snapshot_download(repo_id=model_name, local_dir=model_path)
        os.makedirs(os.path.dirname(version_file), exist_ok=True)
        with open(version_file, 'w') as f:
            f.write(model_name)

    print(f"Loading model from: {model_path}")
    model, tokenizer = load(model_path)
    return model, tokenizer

def main(model_name: str):
    model, tokenizer = load_model(model_name)

    prompt = "How can humans fly?"

    print("\nGenerating response (streaming):")
    for token in stream_generate(model, tokenizer, prompt, max_tokens=200):
        print(token, end="", flush=True)
    print("\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate text using a specified model.")
    parser.add_argument("--model", type=str, default="mlx-community/Llama-3-Groq-8B-Tool-Use-8bit",
                        help="HuggingFace model name or path")
    args = parser.parse_args()
    
    main(args.model)