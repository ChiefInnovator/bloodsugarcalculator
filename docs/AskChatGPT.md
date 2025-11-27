# Ask ChatGPT Feature

## Overview

The "Ask ChatGPT" feature allows users to get personalized health optimization advice based on their A1C and eAG calculation results. After performing a conversion, users can click the ChatGPT button to open a new browser tab with a pre-constructed prompt that includes their specific values.

## User Experience

1. User enters their A1C or eAG value and performs a calculation
2. Results are displayed showing both values (A1C percentage and eAG in mg/dL)
3. User clicks the green ChatGPT icon in the share buttons section
4. A new browser tab opens with ChatGPT pre-loaded with a personalized health optimization prompt
5. ChatGPT provides tailored advice for nutrition, exercise, and lifestyle improvements

## Button Design

| Property | Value |
|----------|-------|
| Icon | OpenAI/ChatGPT logo |
| Color | `#10a37f` (OpenAI brand green) |
| Hover State | `bg-green-100` |
| Focus Ring | `ring-green-500` |
| Size | 32x32 pixels (w-8 h-8) |
| Position | After email share button in the share icons row |

## Prompt Template

The prompt is designed to provide comprehensive, actionable health advice:

```
Evaluate an A1C of {A1C_VALUE} percent and an average glucose of {EAG_VALUE} mg/dL. Assess where this falls on the spectrum of optimal metabolic control for fat-loss, longevity, and diabetes prevention. Provide a strategic plan with specific daily actions for nutrition, strength training, cardio, fasting, supplementation, stress reduction, and sleep to drive A1C toward the 4.8 to 5.2 percent range without sacrificing energy or muscle retention.
```

### Dynamic Values

| Placeholder | Source | Description |
|-------------|--------|-------------|
| `{A1C_VALUE}` | Calculation result | A1C percentage (e.g., 5.5) |
| `{EAG_VALUE}` | Calculation result | Estimated average glucose in mg/dL (e.g., 111) |

## Technical Implementation

### URL Construction

```
https://chat.openai.com/?q={URL_ENCODED_PROMPT}
```

### Value Extraction Logic

The feature handles both conversion directions:

**A1C to eAG Conversion:**
- `a1cValue` = user input (the A1C percentage entered)
- `eagValue` = calculated result in mg/dL

**eAG to A1C Conversion:**
- `a1cValue` = calculated result (the A1C percentage)
- `eagValue` = user input (converted to mg/dL if originally in mmol/L)

### Unit Conversion

If the user entered eAG in mmol/L, the value is converted to mg/dL for the prompt:
```javascript
eagValue = Math.round(currentCalculation.input * 18);
```

### URL Encoding

The prompt is encoded using JavaScript's `encodeURIComponent()` function to ensure all special characters are properly escaped for URL transmission.

### Browser Behavior

```javascript
window.open(chatGptUrl, '_blank');
```
- Opens in a new browser tab
- Does not affect the current calculator page
- User can return to their results after reviewing ChatGPT's response

## Example

### Input
- A1C: 5.5%
- eAG: 111 mg/dL (calculated)

### Generated Prompt
```
Evaluate an A1C of 5.5 percent and an average glucose of 111 mg/dL. Assess where this falls on the spectrum of optimal metabolic control for fat-loss, longevity, and diabetes prevention. Provide a strategic plan with specific daily actions for nutrition, strength training, cardio, fasting, supplementation, stress reduction, and sleep to drive A1C toward the 4.8 to 5.2 percent range without sacrificing energy or muscle retention.
```

### Generated URL
```
https://chat.openai.com/?q=Evaluate%20an%20A1C%20of%205.5%20percent%20and%20an%20average%20glucose%20of%20111%20mg%2FdL.%20Assess%20where%20this%20falls%20on%20the%20spectrum%20of%20optimal%20metabolic%20control%20for%20fat-loss%2C%20longevity%2C%20and%20diabetes%20prevention.%20Provide%20a%20strategic%20plan%20with%20specific%20daily%20actions%20for%20nutrition%2C%20strength%20training%2C%20cardio%2C%20fasting%2C%20supplementation%2C%20stress%20reduction%2C%20and%20sleep%20to%20drive%20A1C%20toward%20the%204.8%20to%205.2%20percent%20range%20without%20sacrificing%20energy%20or%20muscle%20retention.
```

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Added ChatGPT button with OpenAI logo SVG icon |
| `js/script.js` | Added `askChatGpt` element reference and click event handler |

## Dependencies

- Requires an active internet connection
- User must have access to ChatGPT (free or paid account)
- No API keys or authentication required from this application

## Future Enhancements

Potential improvements for future versions:

1. **Model Selection** - Allow users to choose between GPT-3.5 and GPT-4
2. **Custom Prompts** - Let users modify the prompt template
3. **History Tracking** - Store previously generated prompts
4. **Alternative AI Services** - Support for Claude, Gemini, or other AI assistants
5. **Inline Responses** - Display AI responses within the calculator page (would require API integration)

## Related Features

- [Share Link](../index.html) - Copy a shareable URL with calculation results
- [Share to Facebook](../index.html) - Post results to Facebook
- [Share to X](../index.html) - Post results to X (Twitter)
- [Share via Email](../index.html) - Send results via email
