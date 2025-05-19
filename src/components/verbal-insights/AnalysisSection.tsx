import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Removed AlertTitle, not used
import { LoadingIndicator } from './LoadingIndicator';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface AnalysisSectionProps {
  title: string;
  icon?: LucideIcon;
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function AnalysisSection({ title, icon: Icon, isLoading, error, children, className, description }: AnalysisSectionProps) {
  return (
    <Card className={cn("shadow-lg w-full", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-7 w-7 text-primary" />}
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
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
