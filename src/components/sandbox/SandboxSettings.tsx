"use client";
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SandboxConfig } from './SandboxInterface';

interface SandboxSettingsProps {
  config: SandboxConfig;
  onChange: (newConfig: Partial<SandboxConfig>) => void;
  disabled?: boolean;
}

export const SandboxSettings: React.FC<SandboxSettingsProps> = ({
  config,
  onChange,
  disabled = false
}) => {
  const handleChange = <K extends keyof SandboxConfig>(key: K, value: SandboxConfig[K]) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Model Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Model Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={config.model}
              onValueChange={(value) => handleChange('model', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-realtime">GPT Realtime</SelectItem>
                <SelectItem value="gpt-4o-realtime-preview">GPT-4o-realtime-preview</SelectItem>
                <SelectItem value="gpt-4o-mini-realtime-preview">GPT-4o-mini-realtime-preview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              value={config.prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('prompt', e.target.value)}
              disabled={disabled}
              rows={4}
              placeholder="Enter the system prompt for the AI..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_output_tokens">Max Output Tokens</Label>
            <Input
              id="max_output_tokens"
              type="number"
              value={config.max_output_tokens}
              onChange={(e) => handleChange('max_output_tokens', parseInt(e.target.value))}
              disabled={disabled}
              min={1}
              max={4096}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio & Response Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Audio & Response Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature: {config.temperature}
            </Label>
            <Slider
              id="temperature"
              value={[config.temperature]}
              onValueChange={(value: number[]) => handleChange('temperature', value[0])}
              disabled={disabled}
              min={0.6}
              max={1.2}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">
              Voice Threshold: {config.threshold}
            </Label>
            <Slider
              id="threshold"
              value={[config.threshold]}
              onValueChange={(value: number[]) => handleChange('threshold', value[0])}
              disabled={disabled}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix_padding_ms">Prefix Padding (ms)</Label>
            <Input
              id="prefix_padding_ms"
              type="number"
              value={config.prefix_padding_ms}
              onChange={(e) => handleChange('prefix_padding_ms', parseInt(e.target.value))}
              disabled={disabled}
              min={0}
              max={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="silence_duration_ms">Silence Duration (ms)</Label>
            <Input
              id="silence_duration_ms"
              type="number"
              value={config.silence_duration_ms}
              onChange={(e) => handleChange('silence_duration_ms', parseInt(e.target.value))}
              disabled={disabled}
              min={100}
              max={5000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Behavior Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Behavior Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create_response"
              checked={config.create_response}
              onCheckedChange={(checked) => handleChange('create_response', checked === true)}
              disabled={disabled}
            />
            <Label htmlFor="create_response" className="text-sm">
              Create Response
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="interrupt_response"
              checked={config.interrupt_response}
              onCheckedChange={(checked) => handleChange('interrupt_response', checked === true)}
              disabled={disabled}
            />
            <Label htmlFor="interrupt_response" className="text-sm">
              Allow Interrupt Response
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto_start"
              checked={config.auto_start}
              onCheckedChange={(checked) => handleChange('auto_start', checked === true)}
              disabled={disabled}
            />
            <Label htmlFor="auto_start" className="text-sm">
              Auto Start Conversation
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
