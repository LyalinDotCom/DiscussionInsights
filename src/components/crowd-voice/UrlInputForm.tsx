
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Zap, AlertTriangle, FileText as FileTextIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface UrlInputFormProps {
  onSubmit: (value: string, inputMode: 'url' | 'text') => void;
  isLoading: boolean;
  initialUrl?: string; 
}

export function UrlInputForm({ onSubmit, isLoading, initialUrl = '' }: UrlInputFormProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');

  useEffect(() => {
    setCurrentUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputMode === 'url' && currentUrl.trim()) {
      let processedUrl = currentUrl.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      onSubmit(processedUrl, 'url');
    } else if (inputMode === 'text' && pastedText.trim()) {
      onSubmit(pastedText.trim(), 'text');
    }
  };

  const isSubmitDisabled = isLoading || 
                           (inputMode === 'url' && !currentUrl.trim()) ||
                           (inputMode === 'text' && !pastedText.trim());

  return (
    <Card className="mb-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Verbal Insights</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Analyze discussion content by providing a URL or pasting text directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" value={inputMode} onValueChange={(value) => setInputMode(value as 'url' | 'text')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="url" disabled={isLoading}>
              <Globe className="mr-2 h-4 w-4" /> Analyze URL
            </TabsTrigger>
            <TabsTrigger value="text" disabled={isLoading}>
              <FileTextIcon className="mr-2 h-4 w-4" /> Paste Text
            </TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <TabsContent value="url">
              <div className="relative flex-grow w-full">
                <Globe className="absolute left-3 top-[calc(50%-3px)] -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="e.g., https://example.com/forum-post"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="pl-10 text-base h-12 rounded-md focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                  aria-label="Website URL for analysis"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Please note: Video link analysis (e.g., YouTube) is not currently supported. This tool analyzes text-based web content and pasted text.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="text">
              <Textarea
                placeholder="Paste your discussion content here (min. 50 characters, max. 100,000 characters)..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="text-base min-h-[150px] rounded-md focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                aria-label="Pasted text for analysis"
                rows={8}
                minLength={50}
                maxLength={100000} 
              />
               <p className="mt-2 text-xs text-muted-foreground">
                For best results, paste content between 50 and 100,000 characters.
              </p>
            </TabsContent>
            
            <Button 
              type="submit" 
              disabled={isSubmitDisabled} 
              className={cn(
                "w-full mt-4 px-6 h-12 text-base rounded-md transition-all duration-150 ease-in-out",
                "hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isLoading ? "bg-muted text-muted-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              <Zap className="mr-2 h-5 w-5" />
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </form>
        </Tabs>
        <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          <span>AI-generated content may contain inaccuracies. Always verify critical information.</span>
        </div>
      </CardContent>
    </Card>
  );
}
