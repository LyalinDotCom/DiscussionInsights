
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingIndicator } from './LoadingIndicator';
import { cn } from '@/lib/utils';
import { AlertCircle, Copy as CopyIconLucide, RefreshCcw } from 'lucide-react';
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
  onCopy?: () => void;
  onRefresh?: () => void;
}

export function AnalysisSection({ title, icon: Icon, isLoading, error, children, className, description, onCopy, onRefresh }: AnalysisSectionProps) {
  return (
    <Card className={cn("shadow-lg w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-7 w-7 text-primary" />}
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {onRefresh && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRefresh}
                      disabled={isLoading}
                      className="text-muted-foreground hover:text-primary"
                      aria-label={`Refresh ${title}`}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh {title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {/* Always render the copy button structure */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopy} // onClick will be a no-op if onCopy is undefined, as button is disabled
                    disabled={isLoading || !onCopy} // Disabled if loading OR if onCopy is not provided (meaning no content/data)
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
          </div>
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
