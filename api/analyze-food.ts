export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: `Analyze this food image and estimate the nutritional content.

Respond ONLY with a valid JSON array of food items. Each item should have:
- name: Food name (string)
- grams: Estimated weight in grams (number)
- calories: Estimated calories (number)
- protein: Estimated protein in grams (number)
- carbs: Estimated carbs in grams (number)
- fat: Estimated fat in grams (number)

Example response format:
[
  {"name": "Grilled Chicken Breast", "grams": 150, "calories": 247, "protein": 46, "carbs": 0, "fat": 5},
  {"name": "White Rice", "grams": 200, "calories": 260, "protein": 5, "carbs": 56, "fat": 0.5}
]

Be reasonable with estimates. If you can't identify food clearly, make your best guess based on what you see. Only return the JSON array, no other text.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API error: ${errorText}` });
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Try to parse the JSON response
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      const foods = JSON.parse(cleanedResponse);
      return res.status(200).json({ foods });
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return res.status(500).json({ error: 'Failed to parse food analysis', raw: responseText });
    }
  } catch (error: any) {
    console.error('Food Analysis Error:', error);
    return res.status(500).json({ error: 'Internal Error analyzing food' });
  }
}
