import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def _build_system_prompt(audience: str, tone: str, task: str = "") -> str:
    base = f"You are a helpful assistant. Audience level: {audience}. Tone: {tone}."
    if task:
        base += f" Task: {task}"
    return base

async def generate_answer(messages, context: str, audience_level: str, tone: str, creativity: float):
    system = _build_system_prompt(audience_level, tone)
    system += f"\n\nUse the following context to answer:\n{context}"
    
    openai_messages = [{"role": "system", "content": system}]
    openai_messages += [{"role": m.role, "content": m.content} for m in messages]
    
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_messages,
        temperature=creativity,
    )
    usage = {"prompt_tokens": resp.usage.prompt_tokens, "completion_tokens": resp.usage.completion_tokens}
    return resp.choices[0].message.content, usage

async def generate_flashcards(context: str, request):
    prompt = f"Generate flashcards (Q&A pairs) from the following content. Format as JSON array with 'question' and 'answer' fields.\n\n{context}"
    return await _generate(prompt, request)

async def generate_quiz(context: str, request):
    prompt = f"Generate a multiple-choice quiz from the following content. Format as JSON array with 'question', 'options' (array), and 'answer' fields.\n\n{context}"
    return await _generate(prompt, request)

async def generate_code_review(context: str, request):
    prompt = f"Perform a code review and architecture analysis on the following code. Include: code quality, potential bugs, architecture observations.\n\n{context}"
    return await _generate(prompt, request)

async def _generate(prompt: str, request):
    system = _build_system_prompt(
        request.audience_level,
        request.tone,
        request.task_instructions or "",
    )
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=request.creativity,
    )
    usage = {"prompt_tokens": resp.usage.prompt_tokens, "completion_tokens": resp.usage.completion_tokens}
    return resp.choices[0].message.content, usage
