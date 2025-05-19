import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingIndicator } from './LoadingIndicator';
import { cn } from '@/lib/utils';
import { AlertCircle, Copy as CopyIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnalysisSectionProps {
  title: string;
  icon?: LucideIcon;
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  description?: string;
  onCopy?: () => void; // New prop for copy functionality
}

export function AnalysisSection({ title, icon: Icon, isLoading, error, children, className, description, onCopy }: AnalysisSectionProps) {
  return (
    <Card className={cn("shadow-lg w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-7 w-7 text-primary" />}
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          </div>
          {onCopy && !isLoading && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopy}
                    className="text-muted-foreground hover:text-primary"
                    aria-label={`Copy ${title} to clipboard`}
                  >
                    <CopyIconLucide className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy {title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingIndicator />}
        {error && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && children}
      </CardContent>
    </Card>
  );
}
