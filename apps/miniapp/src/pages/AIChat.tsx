/**
 * AI Chat Screen - Conversation with Claude for idea generation
 */

import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useNavigate } from "react-router-dom";
import { chatWithAI, telegramAuth, ChatRequest, TelegramAuthRequest } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useStore } from "@/store/useStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ChatState = "idle" | "loading" | "error" | "empty";

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Hi! I'm here to help you create an amazing startup. Let's start by understanding what problems you want to solve. What industries or areas interest you?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { hapticImpact, hapticNotification, showMainButton, hideMainButton, webApp } = useTelegram();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, setAuth } = useStore();

  useEffect(() => {
    // Authenticate user if not already authenticated
    const authenticateUser = async () => {
      if (user) return; // Already authenticated

      try {
        if (webApp?.initData) {
          // Authenticate with Telegram initData
          const authRequest: TelegramAuthRequest = {
            init_data: webApp.initData,
          };

          const authResponse = await telegramAuth(authRequest);

          // Store auth data
          localStorage.setItem("token", authResponse.access_token);
          // Also store in Zustand store
          setAuth(authResponse.user, authResponse.access_token, authResponse.refresh_token);

          showToast(`Hello ${authResponse.user.full_name}!`, "success", "Welcome!");
        } else {
          // Development mode - show error
          setError("Telegram authentication required. Please open this app through Telegram.");
          showToast("Please open this app through Telegram to chat with AI.", "error", "Authentication Required");
        }
      } catch (err: any) {
        console.error("Authentication failed:", err);
        
        let errorMessage = "Failed to authenticate. Please try again.";
        if (err instanceof Error) {
          if (err.message.includes("network_error") || err.message.includes("Cannot connect")) {
            errorMessage = "Cannot connect to API. Please check your connection or contact support.";
          } else if (err.message.includes("401") || err.message.includes("Unauthorized")) {
            errorMessage = "Authentication failed. Please try opening the app again through Telegram.";
          } else {
            errorMessage = err.message || errorMessage;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        showToast(errorMessage, "error", "Authentication Failed");
      }
    };

    authenticateUser();

    // Hide main button on component unmount
    return () => {
      hideMainButton();
    };
  }, [user, webApp, setAuth, showToast, hideMainButton]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || chatState === "loading") return;

    hapticImpact("light");
    setError(null);

    // Check if user is authenticated
    if (!user) {
      setChatState("error");
      setError("Please authenticate first to chat with AI.");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatState("loading");

    try {
      // Prepare API request
      const chatRequest: ChatRequest = {
        message: input.trim(),
        ...(conversationId && { conversation_id: conversationId }),
      };

      // Call AI API
      const response = await chatWithAI(chatRequest);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setChatState("idle");
      hapticNotification("success");

      // Check if AI suggests generating ideas
      if (response.should_generate_ideas) {
        // Show main button to generate ideas
        showMainButton("Generate Ideas", () => {
          hapticImpact("medium");
          navigate("/idea-results");
        });
      }

    } catch (err: any) {
      console.error("AI chat error:", err);
      setChatState("error");

      let errorMessage = "Failed to send message. Please try again.";
      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      hapticNotification("error");

      showToast(errorMessage, "error", "Chat Error");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    hapticImpact("medium");
    setError(null);
    setChatState("idle");
  };

  // Empty state (shouldn't happen, but good to have)
  if (messages.length === 0 && chatState === "empty") {
    return (
      <Layout title="AI Chat" showBack>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-3 px-4">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Start a Conversation</h3>
            <p className="text-sm text-muted-foreground">
              Chat with our AI to discover your perfect startup idea
            </p>
            <Button onClick={() => setChatState("idle")}>
              Start Chat
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="AI Chat" showBack>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 smooth-scroll">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.role === "assistant" && (
                  <Sparkles className="h-4 w-4 mb-1 text-primary inline-block" />
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 opacity-60`}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {chatState === "loading" && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                <div className="flex gap-1 items-center">
                  <Sparkles className="h-4 w-4 text-primary mr-1" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8"
                      onClick={handleRetry}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-border bg-background p-4 safe-bottom">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
              disabled={chatState === "loading"}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatState === "loading"}
              size="icon"
              className="min-w-[44px] h-11 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Helper Text */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {chatState === "loading" 
              ? "AI is thinking..." 
              : `${messages.length >= 6 ? "Ready to generate ideas!" : "Answer a few questions to get personalized ideas"}`
            }
          </p>
        </div>
      </div>
    </Layout>
  );
}

