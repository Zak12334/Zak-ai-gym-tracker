
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemInstruction } = req.body;

  // Security Check: Ensure the API key exists in the environment
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Backend Configuration Error: ANTHROPIC_API_KEY is missing.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Using the current high-performance Sonnet model
        max_tokens: 2048,
        system: systemInstruction,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${errorText}` });
    }

    const data = await response.json();
    
    // Return the response text in a format compatible with the existing frontend logic
    return res.status(200).json({ text: data.content[0].text });
  } catch (error: any) {
    console.error('IronMind Serverless Function Error:', error);
    return res.status(500).json({ error: 'Internal Logic Engine Error' });
  }
}
