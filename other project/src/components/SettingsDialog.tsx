'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSpeechSynthesis } from '@/hooks/useSpeech';

export function SettingsDialog() {
  const { state, dispatch } = useApp();
  const { voices } = useSpeechSynthesis();
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(state.config);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_CONFIG', payload: tempConfig });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempConfig(state.config);
    setIsOpen(false);
  };

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("This is a test of the voice settings.");
    utterance.rate = tempConfig.voiceSettings.rate;
    utterance.pitch = tempConfig.voiceSettings.pitch;
    utterance.volume = tempConfig.voiceSettings.volume;
    
    const selectedVoice = voices.find(voice => voice.name === tempConfig.voiceSettings.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Configuration</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    apiKey: e.target.value
                  })}
                  placeholder="Enter your OpenRouter API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your OpenRouter API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">openrouter.ai/keys</a>. Your key is stored locally and never sent to our servers.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API URL</label>
              <Input
                type="text"
                value={tempConfig.apiUrl}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  apiUrl: e.target.value
                })}
                placeholder="/api/chat"
              />
              <p className="text-xs text-muted-foreground">
                Endpoint for AI communication (use /api/chat for built-in OpenRouter proxy)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={tempConfig.model}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  model: e.target.value
                })}
              >
                <optgroup label="OpenAI Models">
                  <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Cost-effective)</option>
                  <option value="openai/gpt-4">GPT-4 (High Quality)</option>
                  <option value="openai/gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                  <option value="openai/gpt-4o">GPT-4o (Latest)</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Budget-friendly)</option>
                </optgroup>
                <optgroup label="Anthropic Models">
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Fast)</option>
                  <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Balanced)</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus (High Quality)</option>
                  <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet (Latest)</option>
                </optgroup>
                <optgroup label="Google Models">
                  <option value="google/gemini-pro">Gemini Pro</option>
                  <option value="google/gemini-pro-1.5">Gemini Pro 1.5 (Latest)</option>
                </optgroup>
                <optgroup label="Meta Models">
                  <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                  <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Fast)</option>
                </optgroup>
                <optgroup label="Mistral Models">
                  <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
                  <option value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</option>
                </optgroup>
              </select>
              <p className="text-xs text-muted-foreground">
                Choose from various AI models via OpenRouter. Different models offer different capabilities and pricing.
              </p>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Voice Settings</h3>
              <Button variant="outline" size="sm" onClick={testVoice}>
                Test Voice
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={tempConfig.voiceSettings.voice}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  voiceSettings: {
                    ...tempConfig.voiceSettings,
                    voice: e.target.value
                  }
                })}
              >
                <option value="default">Default</option>
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate</label>
                <Input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={tempConfig.voiceSettings.rate}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    voiceSettings: {
                      ...tempConfig.voiceSettings,
                      rate: parseFloat(e.target.value)
                    }
                  })}
                />
                <div className="text-xs text-center text-muted-foreground">
                  {tempConfig.voiceSettings.rate}x
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pitch</label>
                <Input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tempConfig.voiceSettings.pitch}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    voiceSettings: {
                      ...tempConfig.voiceSettings,
                      pitch: parseFloat(e.target.value)
                    }
                  })}
                />
                <div className="text-xs text-center text-muted-foreground">
                  {tempConfig.voiceSettings.pitch}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={tempConfig.voiceSettings.volume}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    voiceSettings: {
                      ...tempConfig.voiceSettings,
                      volume: parseFloat(e.target.value)
                    }
                  })}
                />
                <div className="text-xs text-center text-muted-foreground">
                  {Math.round(tempConfig.voiceSettings.volume * 100)}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Silence Timeout</label>
                <Input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={tempConfig.voiceSettings.silenceTimeout}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    voiceSettings: {
                      ...tempConfig.voiceSettings,
                      silenceTimeout: parseInt(e.target.value)
                    }
                  })}
                />
                <div className="text-xs text-center text-muted-foreground">
                  {tempConfig.voiceSettings.silenceTimeout} seconds
                </div>
                <p className="text-xs text-muted-foreground">
                  Recording stops automatically after this duration of silence
                </p>
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>English Speaking Platform v1.0</p>
              <p>Features:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Voice recognition and synthesis</li>
                <li>PDF and image processing</li>
                <li>Practice mode with corrections</li>
                <li>Interview mode with reports</li>
                <li>Multi-user support</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
