import { useState } from 'react'
import axios from 'axios'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const AIAssistant = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const askAssistant = async () => {
    const message = input.trim()

    if (!message || loading) {
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Please login again to use AI Assistant.',
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: message,
      },
    ])

    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/ask',
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            response.data.message || 'No response received.',
        },
      ])
    } catch (error: any) {
      console.error('AI Assistant error:', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.response?.data?.message ||
            'AI Assistant is currently unavailable.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      askAssistant()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              LogiMind AI
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Intelligent Logistics Assistant
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          {messages.length === 0 ? (
            <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-5xl">
                🤖
              </div>

              <h2 className="text-2xl font-semibold">
                How can I help?
              </h2>

              <p className="mt-2 max-w-md text-slate-400">
                Ask questions about orders, vehicles, trips,
                quantities and logistics operations.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'How many orders do we have?',
                  'Which vehicles are available?',
                  'Tell me about current trips.',
                  'What is our total order quantity?',
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => setInput(question)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[600px] space-y-5 overflow-y-auto pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="mb-1 text-xs font-semibold opacity-60">
                      {message.role === 'user'
                        ? 'You'
                        : 'LogiMind AI'}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-800 px-5 py-3 text-sm text-slate-400">
                    LogiMind AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-5 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your logistics data..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <button
            onClick={askAssistant}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Asking...' : 'Ask AI'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AIAssistant