import urllib.request, json, sys

try:
    with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=5) as r:
        data = json.loads(r.read())
        models = [m["name"] for m in data.get("models", [])]
        print("OLLAMA_OK:" + json.dumps(models))
except Exception as e:
    print("OLLAMA_FAIL:" + str(e))
