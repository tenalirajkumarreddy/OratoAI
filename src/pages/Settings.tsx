import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useApp } from "@/contexts/AppContext";
import { AI_PROVIDERS } from "@/lib/aiService";
import { Settings as SettingsIcon, Save, Key, Volume2, Zap, Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [localApiKey, setLocalApiKey] = useState(state.aiSettings.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setLocalApiKey(state.aiSettings.apiKey);
  }, [state.aiSettings.apiKey]);

  const getModelRecommendation = (model: string) => {
    const recommendations: Record<string, string> = {
      'openai/gpt-4o': '🚀 Best overall performance for conversations',
      'openai/gpt-4o-mini': '⚡ Fast and cost-effective for daily practice',
      'anthropic/claude-3.5-sonnet': '🧠 Excellent for detailed explanations and nuanced conversations',
      'anthropic/claude-3-haiku': '💨 Very fast responses, great for quick practice',
      'deepseek/deepseek-chat': '💡 Smart and affordable, good for learning',
      'google/gemini-pro-1.5': '🔍 Great for document analysis and context understanding',
      'meta-llama/llama-3.1-405b-instruct': '🏆 Most powerful open-source model',
      'meta-llama/llama-3.1-70b-instruct': '⚖️ Good balance of performance and speed',
      'llama-3.1-sonar-small-128k-online': '🔍 Fast web-connected model with real-time info',
      'llama-3.1-sonar-large-128k-online': '🌐 Powerful web-connected model with current knowledge',
      'llama-3.1-sonar-huge-128k-online': '🚀 Most powerful web-connected model for complex queries',
      'llama-3.1-8b-instruct': '⚡ Fast and efficient for quick conversations',
      'llama-3.1-70b-instruct': '🎯 Excellent reasoning and conversation quality',
      'mixtral-8x7b-instruct': '🔧 Great for technical discussions and problem-solving',
      'codellama-34b-instruct': '💻 Specialized for coding and programming conversations',
    };
    return recommendations[model] || '';
  };

  const getApiKeyInstructions = (provider: string) => {
    const instructions = {
      openai: "Get your API key from: https://platform.openai.com/api-keys",
      openrouter: "Get your API key from: https://openrouter.ai/keys (Supports 100+ AI models)",
      deepseek: "Get your API key from: https://platform.deepseek.com/api-keys",
      anthropic: "Get your API key from: https://console.anthropic.com/account/keys",
      perplexity: "Get your API key from: https://www.perplexity.ai/settings/api (Real-time web search enabled)"
    };
    return instructions[provider as keyof typeof instructions] || "Check your AI provider's dashboard for API keys.";
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_AI_SETTINGS',
      payload: { apiKey: localApiKey }
    });

    // Save to localStorage for persistence
    localStorage.setItem('speakAI_settings', JSON.stringify({
      aiSettings: { ...state.aiSettings, apiKey: localApiKey },
      voiceSettings: state.voiceSettings,
    }));

    toast({
      title: "Settings saved",
      description: "Your configuration has been saved successfully.",
    });
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('speakAI_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.aiSettings) {
          dispatch({ type: 'UPDATE_AI_SETTINGS', payload: parsed.aiSettings });
        }
        if (parsed.voiceSettings) {
          dispatch({ type: 'UPDATE_VOICE_SETTINGS', payload: parsed.voiceSettings });
        }
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, [dispatch]);

  const handleProviderChange = (provider: string) => {
    dispatch({
      type: 'UPDATE_AI_SETTINGS',
      payload: {
        provider,
        model: AI_PROVIDERS[provider]?.supportedModels[0] || 'gpt-3.5-turbo'
      }
    });
  };

  const handleModelChange = (model: string) => {
    dispatch({
      type: 'UPDATE_AI_SETTINGS',
      payload: { model }
    });
  };

  const handleVoiceSettingChange = (key: keyof typeof state.voiceSettings, value: any) => {
    dispatch({
      type: 'UPDATE_VOICE_SETTINGS',
      payload: { [key]: value }
    });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <SettingsIcon className="w-10 h-10 text-primary" />
            Settings & Configuration
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Configure your AI provider, voice settings, and conversation preferences for the best experience.
          </p>
        </div>

        <div className="space-y-8">
          {/* AI Configuration */}
          <Card className="p-6 bg-card border-border shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">AI Provider Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* AI Provider Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">AI Provider</Label>
                <Select value={state.aiSettings.provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred AI provider:
                  <br />• <strong>OpenAI</strong>: Direct access to GPT models with fastest response
                  <br />• <strong>OpenRouter</strong>: Access to multiple AI models (GPT, Claude, LLaMA, Gemini) with competitive pricing
                  <br />• <strong>DeepSeek</strong>: Cost-effective Chinese AI with strong coding capabilities
                  <br />• <strong>Anthropic</strong>: Direct access to Claude models with advanced reasoning
                  <br />• <strong>Perplexity</strong>: Real-time web search capabilities with latest information and citations
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Model</Label>
                <Select value={state.aiSettings.model} onValueChange={handleModelChange}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {AI_PROVIDERS[state.aiSettings.provider]?.supportedModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{model}</span>
                          {getModelRecommendation(model) && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {getModelRecommendation(model)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getModelRecommendation(state.aiSettings.model) && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {getModelRecommendation(state.aiSettings.model)}
                  </p>
                )}
              </div>

              {/* API Key */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="bg-input border-border font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                  <br />{getApiKeyInstructions(state.aiSettings.provider)}
                </p>
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Response Creativity: {state.aiSettings.temperature}
                </Label>
                <Slider
                  value={[state.aiSettings.temperature]}
                  onValueChange={([value]) => dispatch({
                    type: 'UPDATE_AI_SETTINGS',
                    payload: { temperature: value }
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower values make responses more focused, higher values more creative.
                </p>
              </div>
            </div>

            {/* OpenRouter Special Info */}
            {state.aiSettings.provider === 'openrouter' && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      OpenRouter Benefits
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Access 100+ AI models from different providers</li>
                      <li>• Competitive pricing and pay-per-use billing</li>
                      <li>• Automatic failover between models</li>
                      <li>• No need for multiple API keys</li>
                      <li>• Real-time model availability and pricing</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Perplexity Special Info */}
            {state.aiSettings.provider === 'perplexity' && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      Perplexity Benefits
                    </h4>
                    <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• Real-time web search with current information</li>
                      <li>• Sonar models provide up-to-date knowledge</li>
                      <li>• Citations and sources for factual claims</li>
                      <li>• Excellent for current events and recent topics</li>
                      <li>• Multiple LLaMA and Mixtral model options</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Voice Settings */}
          <Card className="p-6 bg-card border-border shadow-card">
            <div className="flex items-center space-x-2 mb-6">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Voice & Speech Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Auto Activation */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto Microphone Activation</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start listening after AI responds. You can always manually stop AI speech or listening using the control buttons.
                  </p>
                </div>
                <Switch
                  checked={state.voiceSettings.autoActivation}
                  onCheckedChange={(value) => handleVoiceSettingChange('autoActivation', value)}
                />
              </div>

              {/* Auto Activation Delay (only show if auto activation is enabled) */}
              {state.voiceSettings.autoActivation && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Auto-Activation Delay: {state.voiceSettings.autoActivationDelay}s
                  </Label>
                  <Slider
                    value={[state.voiceSettings.autoActivationDelay]}
                    onValueChange={([value]) => handleVoiceSettingChange('autoActivationDelay', value)}
                    min={1}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to wait after AI stops speaking before activating microphone.
                  </p>
                </div>
              )}

              {/* Silence Timeout */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Silence Timeout: {state.voiceSettings.silenceTimeout}s
                </Label>
                <Slider
                  value={[state.voiceSettings.silenceTimeout]}
                  onValueChange={([value]) => handleVoiceSettingChange('silenceTimeout', value)}
                  min={2}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How long to wait for speech before auto-submitting your message. Longer timeouts allow for more thoughtful responses and pauses.
                </p>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Speech Recognition Language</Label>
                <Select
                  value={state.voiceSettings.language}
                  onValueChange={(value) => handleVoiceSettingChange('language', value)}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="en-GB">🇬🇧 English (UK)</SelectItem>
                    <SelectItem value="en-AU">🇦🇺 English (Australia)</SelectItem>
                    <SelectItem value="en-CA">🇨🇦 English (Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speech Rate */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Speech Rate: {state.voiceSettings.rate}x
                </Label>
                <Slider
                  value={[state.voiceSettings.rate]}
                  onValueChange={([value]) => handleVoiceSettingChange('rate', value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Speech Pitch */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Speech Pitch: {state.voiceSettings.pitch}x
                </Label>
                <Slider
                  value={[state.voiceSettings.pitch]}
                  onValueChange={([value]) => handleVoiceSettingChange('pitch', value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Volume */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Volume: {Math.round(state.voiceSettings.volume * 100)}%
                </Label>
                <Slider
                  value={[state.voiceSettings.volume]}
                  onValueChange={([value]) => handleVoiceSettingChange('volume', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
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
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;