import { useState } from "react";
import { Mic, MicOff, Upload, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const Practice = () => {
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai', content: string, timestamp: Date }>>([]);
  const [textInput, setTextInput] = useState("");

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      setMessages(prev => [...prev, { type: 'user', content: textInput, timestamp: new Date() }]);
      setTextInput("");
      // TODO: Send to AI and get response
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Practice English Communication
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Improve your English speaking skills with AI-powered conversations. Get real-time feedback and corrections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages Area */}
            <Card className="h-96 p-6 bg-card border-border shadow-card overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
                    <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Start speaking or type a message to begin your practice session</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Input Controls */}
            <Card className="p-6 bg-card border-border shadow-card">
              <div className="space-y-4">
                {/* Voice Control */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    onClick={toggleListening}
                    className={`w-16 h-16 rounded-full transition-all duration-300 ${
                      isListening ? 'shadow-glow animate-pulse' : 'hover:scale-105'
                    }`}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isListening ? 'Listening...' : aiSpeaking ? 'AI Speaking...' : 'Click to speak'}
                    </p>
                    {isListening && (
                      <p className="text-xs text-muted-foreground">Say something in English</p>
                    )}
                  </div>
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Or type your message:</label>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="flex-1 bg-input border-border"
                      rows={3}
                    />
                    <Button onClick={handleSendText} className="self-end">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <Card className="p-6 bg-card border-border shadow-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Upload Context</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Image className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  Upload documents or images to provide context for your conversation
                </p>
              </div>
            </Card>

            {/* Practice Stats */}
            <Card className="p-6 bg-card border-border shadow-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Session Time</span>
                  <span className="text-sm font-medium">0:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="text-sm font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Corrections</span>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-card border-border shadow-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Clear Chat
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Export Session
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Get Summary
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;