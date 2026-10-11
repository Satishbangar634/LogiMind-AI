import { useState } from 'react'
import type { KeyboardEvent } from 'react'
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

    if (!message || loading) return

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

    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/ask',
        { message },
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
          content: response.data.message || 'No response received.',
        },
      ])
    } catch (error: unknown) {
      console.error('AI Assistant error:', error)

      let errorMessage = 'AI Assistant is currently unavailable.'

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || errorMessage
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void askAssistant()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  const suggestedQuestions = [
    'How many orders do we have?',
    'Which vehicles are available?',
    'Tell me about current trips.',
    'What is our total order quantity?',
  ]

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              LogiMind AI
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Intelligent Logistics Assistant
            </p>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Chat
            </button>
          )}
        </header>

        {/* Chat Area */}
        <section
          aria-label="AI conversation"
          aria-live="polite"
          className="flex min-h-[400px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[480px] sm:p-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                🤖
              </div>

              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                How can I help?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Ask questions about orders, vehicles, trips, quantities
                and logistics operations.
              </p>

              <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setInput(question)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex max-h-[600px] flex-1 flex-col gap-5 overflow-y-auto p-1">
              {messages.map((message, index) => (
                <div
                  key={`${index}-${message.role}`}
                  className={`flex ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] sm:px-5 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div
                      className={`mb-1 text-xs font-semibold ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-slate-600'
                      }`}
                    >
                      {message.role === 'user' ? 'You' : 'LogiMind AI'}
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                    LogiMind AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Input */}
        <form
          className="mt-4 flex items-stretch gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void askAssistant()
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your logistics data..."
            aria-label="Ask LogiMind AI"
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 sm:px-5"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 sm:px-6"
          >
            {loading ? 'Asking...' : 'Ask AI'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIAssistant