import json

try:
    with open('lint_results.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
        for file in data:
            for msg in file.get('messages', []):
                if msg.get('severity') == 2:
                    print(f"{file['filePath']}:{msg['line']}:{msg['column']} {msg['ruleId']}: {msg['message']}")
except Exception as e:
    print(f"Error: {e}")
