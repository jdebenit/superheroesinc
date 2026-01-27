import os
import json

TIMELINE_DIR = r"d:\dev\shi\src\content\timeline"

def read_files():
    data = {}
    for filename in os.listdir(TIMELINE_DIR):
        if filename.endswith(".md"):
            filepath = os.path.join(TIMELINE_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data[filename] = f.read()
            except Exception as e:
                data[filename] = f"ERROR: {str(e)}"
    
    print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    read_files()
