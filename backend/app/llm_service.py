import httpx
from app.config import get_settings

settings = get_settings()

async def call_llm(prompt: str, system_prompt: str = "") -> str:
    """Call LLM Proxy for AI responses"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.llm_proxy_url}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.llm_proxy_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "messages": [
                    {"role": "system", "content": system_prompt or "You are a supportive AI assistant helping someone with ADHD manage their tasks."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def breakdown_task(task: str) -> dict:
    """Break down a task into smaller steps"""
    system_prompt = """You are an ADHD-friendly task assistant. Your job is to break down overwhelming tasks into small, manageable micro-steps.

Rules:
- Create 3-5 very specific, actionable steps
- Each step should take 5-15 minutes max
- Use simple, encouraging language
- Start each step with an action verb
- Include a short encouraging message at the end

Respond in JSON format:
{
  "subtasks": ["Step 1...", "Step 2...", ...],
  "encouragement": "A short encouraging message"
}"""
    
    prompt = f"Break down this task into small steps: {task}"
    
    try:
        result = await call_llm(prompt, system_prompt)
        # Parse JSON from response
        import json
        # Handle markdown code blocks
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
        data = json.loads(result.strip())
        return data
    except Exception as e:
        # Fallback if LLM fails
        return {
            "subtasks": [
                f"Start working on: {task}",
                "Take a 2-minute break",
                "Continue with the next part",
                "Review what you've done"
            ],
            "encouragement": "You've got this! One step at a time. 💪"
        }

async def chat_with_buddy(message: str) -> dict:
    """Have a supportive chat with the AI buddy"""
    system_prompt = """You are a warm, supportive AI companion for someone with ADHD. Your personality:
- Encouraging but not overwhelming
- Understanding of ADHD struggles
- Celebrates small wins
- Offers practical, bite-sized advice
- Uses emojis occasionally 
- Keeps responses concise (2-3 sentences max)

If they're struggling, acknowledge their feelings and offer gentle support.
If they completed something, celebrate with them!"""
    
    try:
        response = await call_llm(message, system_prompt)
        is_encouragement = any(word in message.lower() for word in ["done", "finished", "completed", "did it"])
        return {
            "response": response,
            "encouragement": is_encouragement
        }
    except Exception:
        return {
            "response": "I'm here for you! Remember, every small step counts. What would you like to tackle next? 🌟",
            "encouragement": True
        }
