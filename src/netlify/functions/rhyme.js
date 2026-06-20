export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }),
    };
  }

  let word;
  try {
    const body = JSON.parse(event.body);
    word = (body.word || "").trim();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!word) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing word" }) };
  }

  const prompt = `Give me perfect rhymes for the word "${word}".

Respond with ONLY raw JSON, no markdown fences, no preamble, in exactly this shape:
{
  "rhymes": [{"word": "string", "syllables": number}, ...],
  "sentence": "string"
}

Rules:
- "rhymes": 8 to 12 real English words that are PERFECT rhymes (same ending sound) with "${word}". Do not include "${word}" itself. If true perfect rhymes are scarce, include strong near-perfect rhymes but prioritize perfect ones first in the list.
- Each rhyme needs an accurate syllable count.
- "sentence": one short, funny or creative single sentence that uses "${word}" and at least two of the rhyming words from your list, written so it actually sounds like a fun rhyme. Keep it under 25 words. Keep it clean, no offensive content.
- Order "rhymes" from most common/usable to most obscure.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: errText }) };
    }

    const data = await response.json();
    const textBlock = data.content?.find((b) => b.type === "text")?.text || "";
    const cleaned = textBlock.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate rhymes", detail: String(err) }),
    };
  }
}
