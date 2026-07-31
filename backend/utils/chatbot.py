import json
import urllib.request
from utils.parser import calculate_health_score

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3:latest"
OLLAMA_TIMEOUT = 560  # seconds — llama3 can be slow on first token

DISCLAIMER = (
    "\n\n---\n*Disclaimer: I am an AI Health Assistant, not a medical professional. "
    "This information is for educational purposes only and should not replace clinical "
    "diagnosis, advice, or treatment from a qualified doctor.*"
)

# Language names for the system prompt
LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "pa": "Punjabi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
}


def _build_system_prompt(lang: str) -> str:
    lang_name = LANG_NAMES.get(lang, "English")
    return (
        f"You are AURA MED, an advanced AI Medical Assistant embedded in a clinical health analytics platform. "
        f"Your role is to help patients understand their medical lab reports, biomarker values, disease risks, "
        f"and receive personalized dietary and lifestyle recommendations.\n\n"
        f"RULES:\n"
        f"- Always respond in {lang_name}.\n"
        f"- Use structured Markdown: headers (###), bold (**text**), and bullet points (- item).\n"
        f"- Be clinical, professional, empathetic, and easy to understand.\n"
        f"- When the patient's biomarker data is provided, reference it directly in your answer.\n"
        f"- Always end sensitive health advice with a brief reminder to consult a doctor.\n"
        f"- Never make definitive diagnoses — provide probabilities and possibilities.\n"
        f"- Keep answers focused and concise (under 300 words unless detail is needed).\n"
    )


def _build_context_block(biomarkers: list, user_profile: dict) -> str:
    context = ""

    if user_profile:
        context += "### Patient Profile\n"
        context += f"- Age: {user_profile.get('age', 'N/A')} years\n"
        context += f"- Gender: {user_profile.get('gender', 'N/A')}\n"
        context += f"- BMI: {user_profile.get('bmi', 'N/A')} (Healthy range: 18.5–24.9)\n"
        context += f"- Smoker: {'Yes' if user_profile.get('smoking') else 'No'}\n"
        context += f"- Regular Exercise: {'Yes' if user_profile.get('exercise') else 'No'}\n"
        context += f"- Family History — Diabetes: {'Yes' if user_profile.get('family_history_diabetes') else 'No'}\n"
        context += f"- Family History — Heart Disease: {'Yes' if user_profile.get('family_history_heart') else 'No'}\n\n"

    if biomarkers:
        normal = [b for b in biomarkers if b.get("status") == "Normal"]
        abnormal = [b for b in biomarkers if b.get("status") != "Normal"]

        if abnormal:
            context += "### Abnormal Biomarkers (Out of Range)\n"
            for b in abnormal:
                context += (
                    f"- **{b['name']}**: {b['value']} {b['unit']} "
                    f"(Status: {b['status']}, Reference: {b['reference_range']})\n"
                )
            context += "\n"

        if normal:
            context += "### Normal Biomarkers\n"
            for b in normal:
                context += f"- {b['name']}: {b['value']} {b['unit']}\n"
            context += "\n"

        score = calculate_health_score(biomarkers)
        rating = (
            "Excellent" if score >= 90 else
            "Good" if score >= 75 else
            "Moderate" if score >= 60 else
            "Attention Required"
        )
        context += f"### Overall Health Score: {score}/100 ({rating})\n\n"

    return context


def _call_ollama(prompt: str, system: str) -> str:
    """Call Ollama API and return the response text."""
    payload = {
        "model": OLLAMA_MODEL,
        "system": system,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 512,
        }
    }

    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("response", "").strip()


def process_chat_query(query: str, biomarkers: list = None, user_profile: dict = None, lang: str = "en") -> str:
    """
    Main entry point. Sends the query + patient context to Ollama (llama3).
    Falls back to a helpful static response if Ollama is unreachable.
    """
    system_prompt = _build_system_prompt(lang)
    context_block = _build_context_block(biomarkers or [], user_profile or {})

    full_prompt = ""
    if context_block:
        full_prompt += f"## Patient Context\n{context_block}\n"
    full_prompt += f"## Patient Question\n{query}"

    # --- Try Ollama ---
    try:
        response = _call_ollama(full_prompt, system_prompt)
        if response:
            return response + DISCLAIMER
    except Exception as e:
        print(f"[chatbot] Ollama unavailable ({e}). Using fallback.")

    # --- Fallback: static rule-based response ---
    return _fallback_response(query, biomarkers, user_profile, lang) + DISCLAIMER


def _fallback_response(query: str, biomarkers: list, user_profile: dict, lang: str) -> str:
    """Simple keyword-based fallback when Ollama is not running."""
    q = query.lower()

    # Results summary
    if biomarkers and any(w in q for w in ["my results", "my report", "abnormal", "check"]):
        abnormal = [b for b in biomarkers if b["status"] in ["High", "Low", "Borderline"]]
        if not abnormal:
            return "✅ All your biomarkers are within healthy reference ranges. Keep up the great work!"
        lines = ["⚠️ The following parameters are outside the reference range:\n"]
        for b in abnormal:
            icon = "🔴" if b["status"] == "High" else "🔵" if b["status"] == "Low" else "🟡"
            lines.append(f"- **{b['name']}**: {b['value']} {b['unit']} ({icon} {b['status']}, range: {b['reference_range']})")
        lines.append("\nPlease check the **Recommendations** tab for tailored advice.")
        return "\n".join(lines)

    # Health score
    if "score" in q and biomarkers:
        score = calculate_health_score(biomarkers)
        rating = "Excellent" if score >= 90 else "Good" if score >= 75 else "Moderate" if score >= 60 else "Attention Required"
        return f"Your current Health Score is **{score}/100** ({rating})."

    # Diet
    if any(w in q for w in ["diet", "food", "eat", "nutrition"]):
        return (
            "### General Nutrition Tips\n"
            "- Eat more vegetables, lean proteins, and whole grains.\n"
            "- Limit refined sugars, processed foods, and saturated fats.\n"
            "- Stay hydrated — aim for 2.5–3 litres of water daily.\n"
            "- Check your **Recommendations** tab for a personalised plan."
        )

    # Exercise
    if any(w in q for w in ["exercise", "workout", "activity", "gym"]):
        return (
            "### Exercise Guidelines\n"
            "- Aim for **150 minutes** of moderate cardio per week (walking, cycling, swimming).\n"
            "- Add **2–3 strength training** sessions per week.\n"
            "- Stretch daily for joint health and flexibility."
        )

    # Default
    return (
        "I'm your AURA MED AI Assistant. You can ask me:\n"
        "- *'What is HbA1c?'* — to understand a medical term\n"
        "- *'Check my results'* — to review your report anomalies\n"
        "- *'How can I lower my cholesterol?'* — for lifestyle advice\n\n"
        "**Note:** The AI model (Ollama) is currently offline. Restart it with `ollama serve` to enable full AI responses."
    )
