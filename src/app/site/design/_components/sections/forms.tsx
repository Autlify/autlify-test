'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function FormsSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-fg-primary">Form Components</h2>
        <p className="text-fg-secondary">
          Form controls using <code className="px-1 py-0.5 bg-muted rounded text-sm">bg-input</code> and <code className="px-1 py-0.5 bg-muted rounded text-sm">border-border</code> tokens.
        </p>
      </div>

      <div className="space-y-8 p-6 rounded-lg border border-border bg-card">
        {/* Text Inputs */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Text Inputs</p>
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="input-1">Default Input</Label>
              <Input id="input-1" placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-2">Disabled Input</Label>
              <Input id="input-2" placeholder="Disabled" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-3">Input with Value</Label>
              <Input id="input-3" value="Prefilled value" readOnly />
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Textarea</p>
          <div className="max-w-md space-y-2">
            <Label htmlFor="textarea-1">Description</Label>
            <Textarea id="textarea-1" placeholder="Enter description..." rows={4} />
          </div>
        </div>

        {/* Select */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Select</p>
          <div className="max-w-md space-y-2">
            <Label>Choose an option</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Checkboxes</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="check-1" />
              <Label htmlFor="check-1" className="font-normal cursor-pointer">
                Accept terms and conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check-2" defaultChecked />
              <Label htmlFor="check-2" className="font-normal cursor-pointer">
                Receive email notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check-3" disabled />
              <Label htmlFor="check-3" className="font-normal cursor-pointer opacity-50">
                Disabled checkbox
              </Label>
            </div>
          </div>
        </div>

        {/* Radio Buttons */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Radio Buttons</p>
          <RadioGroup defaultValue="option1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="radio-1" />
              <Label htmlFor="radio-1" className="font-normal cursor-pointer">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="radio-2" />
              <Label htmlFor="radio-2" className="font-normal cursor-pointer">Option 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option3" id="radio-3" />
              <Label htmlFor="radio-3" className="font-normal cursor-pointer">Option 3</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Switches */}
        <div className="space-y-4">
          <p className="text-xs text-fg-tertiary uppercase tracking-wide font-semibold">Switches</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="switch-1" />
              <Label htmlFor="switch-1" className="font-normal cursor-pointer">
                Enable feature
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch-2" defaultChecked />
              <Label htmlFor="switch-2" className="font-normal cursor-pointer">
                Auto-save enabled
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch-3" disabled />
              <Label htmlFor="switch-3" className="font-normal cursor-pointer opacity-50">
                Disabled switch
              </Label>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
