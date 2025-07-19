import { useState } from "react";
import { Key, Volume2, Mic, Globe, Brain, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiProvider, setAiProvider] = useState("openai");
  const [voiceProvider, setVoiceProvider] = useState("elevenlabs");
  const [voiceId, setVoiceId] = useState("default");
  const [speechSpeed, setSpeechSpeed] = useState([1.0]);
  const [micSensitivity, setMicSensitivity] = useState([70]);
  const [autoRecord, setAutoRecord] = useState(true);
  const [voiceActivation, setVoiceActivation] = useState(true);
  const [language, setLanguage] = useState("en-US");
  const [accent, setAccent] = useState("neutral");

  const handleSave = () => {
    // Save settings to localStorage or backend
    console.log("Settings saved");
  };

  const aiProviders = [
    { value: "openai", label: "OpenAI GPT" },
    { value: "anthropic", label: "Anthropic Claude" },
    { value: "google", label: "Google Gemini" },
    { value: "perplexity", label: "Perplexity AI" },
  ];

  const voiceProviders = [
    { value: "elevenlabs", label: "ElevenLabs" },
    { value: "openai", label: "OpenAI TTS" },
    { value: "azure", label: "Azure Speech" },
    { value: "google", label: "Google TTS" },
  ];

  const voices = [
    { value: "default", label: "Default Voice" },
    { value: "aria", label: "Aria (Female)" },
    { value: "roger", label: "Roger (Male)" },
    { value: "sarah", label: "Sarah (Female)" },
    { value: "charlie", label: "Charlie (Male)" },
  ];

  const languages = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "en-AU", label: "English (Australia)" },
    { value: "en-CA", label: "English (Canada)" },
  ];

  const accents = [
    { value: "neutral", label: "Neutral" },
    { value: "american", label: "American" },
    { value: "british", label: "British" },
    { value: "australian", label: "Australian" },
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure your AI models, voice settings, and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* API Configuration */}
          <Card className="p-6 bg-card border-border shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">API Configuration</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">AI Provider</Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {aiProviders.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-provider">Voice Provider</Label>
                  <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {voiceProviders.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="bg-input border-border pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never shared
                </p>
              </div>
            </div>
          </Card>

          {/* Voice Settings */}
          <Card className="p-6 bg-card border-border shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Voice Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="voice-id">Voice</Label>
                  <Select value={voiceId} onValueChange={setVoiceId}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {voices.map(voice => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Speech Speed: {speechSpeed[0]}x</Label>
                  <Slider
                    value={speechSpeed}
                    onValueChange={setSpeechSpeed}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Microphone Sensitivity: {micSensitivity[0]}%</Label>
                  <Slider
                    value={micSensitivity}
                    onValueChange={setMicSensitivity}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Behavior Settings */}
          <Card className="p-6 bg-card border-border shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Behavior Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-record after AI speech</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start recording when AI finishes speaking
                  </p>
                </div>
                <Switch checked={autoRecord} onCheckedChange={setAutoRecord} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Voice activation</Label>
                  <p className="text-sm text-muted-foreground">
                    Start recording when you speak without clicking
                  </p>
                </div>
                <Switch checked={voiceActivation} onCheckedChange={setVoiceActivation} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="accent">Preferred Accent for Learning</Label>
                <Select value={accent} onValueChange={setAccent}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {accents.map(acc => (
                      <SelectItem key={acc.value} value={acc.value}>
                        {acc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSave}
              size="lg"
              className="px-8 py-3 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;