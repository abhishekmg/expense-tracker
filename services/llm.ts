import { GoogleGenerativeAI } from '@google/generative-ai';
import { Expense } from '../types/database';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY as string); // User will add their API key

export async function getAIResponse(query: string, expenses: Expense[]): Promise<string> {
  try {
    // Format expenses data for context
    const expensesContext = expenses.map((expense) => ({
      amount: expense.amount,
      description: expense.description,
      category: expense.category?.name || 'Uncategorized',
      date: expense.created_at,
    }));

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    // Create the prompt
    const prompt = `You are a helpful expense analysis assistant. You have access to the user's expense data and can help them understand their spending patterns, provide insights, and answer questions about their expenses. Be concise, clear, and helpful.

Here is the user's expense data:
${JSON.stringify(expensesContext, null, 2)}

User's question: ${query}

Please provide a helpful response focusing on their expense data.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to get AI response');
  }
}
