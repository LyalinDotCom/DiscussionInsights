
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with local Image
import { UrlInputForm } from '@/components/verbal-insights/UrlInputForm';
import { AnalysisSection } from '@/components/verbal-insights/AnalysisSection';
import { ActionButtons } from '@/components/verbal-insights/ActionButtons';
import { FloatingActionButtons } from '@/components/verbal-insights/FloatingActionButtons';
import { LoadingIndicator } from '@/components/verbal-insights/LoadingIndicator';
import { fetchUrlContent } from '@/lib/actions';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, ListChecks, MessageSquareText, Link as LinkIcon, Smile, Frown, Meh, Image as ImageIcon, QuoteIcon, Tags } from 'lucide-react';
import { WordCloudDisplay } from '@/components/verbal-insights/WordCloudDisplay';
import { useToast } from '@/hooks/use-toast';


// AI Flow Imports
import { summarizeDiscussion, type SummarizeDiscussionOutput } from '@/ai/flows/summarize-discussion';
import { extractKeyPoints, type ExtractKeyPointsOutput } from '@/ai/flows/extract-key-points';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { contextualizeLinks, type ContextualizeLinksOutput } from '@/ai/flows/contextualize-links';
import { generateHeaderImage, type GenerateHeaderImageOutput } from '@/ai/flows/generate-header-image';
import { generateWordCloud, type GenerateWordCloudOutput } from '@/ai/flows/generate-word-cloud';


export default function VerbalInsightsPage() {
  const [url, setUrl] = useState(''); 
  const [fetchedPageContent, setFetchedPageContent] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [analysisInitiated, setAnalysisInitiated] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null); 

  const [headerImageData, setHeaderImageData] = useState<GenerateHeaderImageOutput | null>(null);
  const [isLoadingHeaderImage, setIsLoadingHeaderImage] = useState(false);
  const [errorHeaderImage, setErrorHeaderImage] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<SummarizeDiscussionOutput | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  const [keyPointsData, setKeyPointsData] = useState<ExtractKeyPointsOutput | null>(null);
  const [isLoadingKeyPoints, setIsLoadingKeyPoints] = useState(false);
  const [errorKeyPoints, setErrorKeyPoints] = useState<string | null>(null);

  const [sentimentData, setSentimentData] = useState<AnalyzeSentimentOutput | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [errorSentiment, setErrorSentiment] = useState<string | null>(null);

  const [linksData, setLinksData] = useState<ContextualizeLinksOutput | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  
  const [pageTitleFromContent, setPageTitleFromContent] = useState<string | null>(null);

  const [wordCloudData, setWordCloudData] = useState<GenerateWordCloudOutput | null>(null);
  const [isLoadingWordCloud, setIsLoadingWordCloud] = useState(false);
  const [errorWordCloud, setErrorWordCloud] = useState<string | null>(null);

  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const actionsCardWrapperRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const resetAllStates = useCallback(() => {
    setFetchedPageContent(null);
    setUrlError(null);
    setAnalysisInitiated(false);
    
    setHeaderImageData(null); setIsLoadingHeaderImage(false); setErrorHeaderImage(null);
    setSummaryData(null); setIsLoadingSummary(false); setErrorSummary(null);
    setKeyPointsData(null); setIsLoadingKeyPoints(false); setErrorKeyPoints(null);
    setSentimentData(null); setIsLoadingSentiment(false); setErrorSentiment(null);
    setLinksData(null); setIsLoadingLinks(false); setErrorLinks(null);
    setWordCloudData(null); setIsLoadingWordCloud(false); setErrorWordCloud(null);
    setPageTitleFromContent(null);
  }, []);

  const handleUrlSubmit = useCallback(async (submittedUrl: string) => {
    if (!submittedUrl) return;

    resetAllStates();
    setIsLoadingUrl(true);
    setUrlError(null);
    setAnalysisInitiated(true);
    setDisplayUrl(submittedUrl); 

    const result = await fetchUrlContent(submittedUrl);
    setIsLoadingUrl(false);

    if (result.error) {
      setUrlError(result.error);
      setFetchedPageContent(null);
      setDisplayUrl(submittedUrl); 
    } else if (result.content) {
      setFetchedPageContent(result.content);
      const finalUrl = result.finalUrl || submittedUrl;
      setDisplayUrl(finalUrl); 
      setUrl(finalUrl); 

      const titleMatch = result.content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        setPageTitleFromContent(titleMatch[1].trim());
      }
    } else {
      setUrlError("Failed to fetch content or content was empty.");
      setFetchedPageContent(null);
      setDisplayUrl(submittedUrl);
    }
  }, [resetAllStates]);
  

  useEffect(() => {
    if (fetchedPageContent && displayUrl) { 
      const contentToAnalyze = fetchedPageContent; 
      const currentDisplayUrl = displayUrl; 

      setIsLoadingHeaderImage(true);
      generateHeaderImage({ text: contentToAnalyze.substring(0, 1000) }) 
        .then(setHeaderImageData)
        .catch(err => setErrorHeaderImage(err.message || "Failed to generate header image."))
        .finally(() => setIsLoadingHeaderImage(false));

      setIsLoadingSummary(true);
      summarizeDiscussion({ url: currentDisplayUrl, content: contentToAnalyze })
        .then(setSummaryData)
        .catch(err => setErrorSummary(err.message || "Failed to summarize discussion."))
        .finally(() => setIsLoadingSummary(false));

      setIsLoadingKeyPoints(true);
      extractKeyPoints({ conversation: contentToAnalyze })
        .then(setKeyPointsData)
        .catch(err => setErrorKeyPoints(err.message || "Failed to extract key points."))
        .finally(() => setIsLoadingKeyPoints(false));

      setIsLoadingSentiment(true);
      analyzeSentiment({ text: contentToAnalyze })
        .then(setSentimentData)
        .catch(err => setErrorSentiment(err.message || "Failed to analyze sentiment."))
        .finally(() => setIsLoadingSentiment(false));

      setIsLoadingLinks(true);
      contextualizeLinks({ pageContent: contentToAnalyze, sourceUrl: currentDisplayUrl })
        .then(setLinksData)
        .catch(err => setErrorLinks(err.message || "Failed to contextualize links."))
        .finally(() => setIsLoadingLinks(false));
      
      setIsLoadingWordCloud(true);
      generateWordCloud({ textContent: contentToAnalyze })
        .then(setWordCloudData)
        .catch(err => setErrorWordCloud(err.message || "Failed to generate word cloud."))
        .finally(() => setIsLoadingWordCloud(false));
    }
  }, [fetchedPageContent, displayUrl]); 

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return MessageSquareText;
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("positive")) return Smile;
    if (lowerSentiment.includes("negative")) return Frown;
    return Meh;
  };
  
  const getAnalysisDataAsMarkdown = useCallback(() => {
    if (!analysisInitiated) return "";
    
    const analysisTimestamp = new Date().toISOString();
    let markdown = `# Verbal Insights Analysis\n\n`;
    markdown += `**Analyzed URL:** ${displayUrl || url}\n`; 
    markdown += `**Analysis Timestamp:** ${analysisTimestamp}\n\n`;

    if (summaryData?.summary) {
      markdown += `## Discussion Summary\n`;
      if (pageTitleFromContent) {
         markdown += `**Title:** ${pageTitleFromContent}\n\n`;
      }
      markdown += `${summaryData.summary}\n\n`;
    }

    if (wordCloudData && wordCloudData.length > 0) {
      markdown += `## Key Terms (Word Cloud)\n`;
      const topTerms = wordCloudData.slice(0, 15).map(item => `${item.text} (value: ${item.value})`);
      markdown += topTerms.join(', ') + '\n\n';
    }

    if (keyPointsData) {
      if (keyPointsData.keyPoints?.length > 0) {
        markdown += `## Key Discussion Points\n`;
        keyPointsData.keyPoints.forEach(point => markdown += `- ${point}\n`);
        markdown += `\n`;
      }
      if (keyPointsData.quotes?.length > 0) {
        markdown += `## Key Quotes\n`;
        keyPointsData.quotes.forEach(quote => markdown += `> ${quote}\n\n`);
      }
    }

    if (sentimentData) {
      markdown += `## Sentiment Analysis\n`;
      markdown += `- **Overall Sentiment:** ${sentimentData.sentiment}\n`;
      markdown += `- **Score:** ${sentimentData.score.toFixed(2)}\n`;
      markdown += `- **Explanation:** ${sentimentData.explanation}\n\n`;
    }

    if (linksData && linksData.length > 0) {
      markdown += `## Contextualized Links\n`;
      linksData.forEach((linkItem, index) => {
        markdown += `${index + 1}. **[${linkItem.url}](${linkItem.url})**\n`;
        markdown += `   - Context: ${linkItem.context}\n`;
      });
      markdown += `\n`;
    }
    return markdown;
  }, [analysisInitiated, displayUrl, url, summaryData, keyPointsData, sentimentData, linksData, pageTitleFromContent, wordCloudData]);

  const hasAnyData = !!(summaryData || keyPointsData || sentimentData || linksData || headerImageData || wordCloudData);
  const isAnyLoading = isLoadingUrl || isLoadingHeaderImage || isLoadingSummary || isLoadingKeyPoints || isLoadingSentiment || isLoadingLinks || isLoadingWordCloud;

  const handleRefreshAnalysis = () => {
    const urlToRefresh = displayUrl || url; 
    if (urlToRefresh) {
      handleUrlSubmit(urlToRefresh);
    }
  };

  const handleCopyToClipboard = useCallback(async () => {
    if (!hasAnyData) {
        toast({ title: "No Data", description: "Please analyze a URL first to generate data.", variant: "destructive" });
        return;
    }
    const markdownData = getAnalysisDataAsMarkdown();
    try {
      await navigator.clipboard.writeText(markdownData);
      toast({ title: "Copied to Clipboard!", description: "Analysis results (Markdown) copied successfully." });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy to clipboard. Your browser might not support this feature or permissions are denied.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  }, [getAnalysisDataAsMarkdown, hasAnyData, toast]);

  const handleDownloadMarkdown = useCallback(() => {
    if (!hasAnyData) {
        toast({ title: "No Data", description: "Please analyze a URL first to generate data.", variant: "destructive" });
        return;
    }
    const markdownData = getAnalysisDataAsMarkdown();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const safePageTitle = pageTitleFromContent ? pageTitleFromContent.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) : 'analysis';
    const filename = `verbal_insights_${safePageTitle}_${timestamp}.md`;
    
    const blob = new Blob([markdownData], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: `${filename} is downloading.` });
    } else {
      toast({ title: "Download Failed", description: "Your browser does not support automatic downloads.", variant: "destructive" });
    }
  }, [getAnalysisDataAsMarkdown, hasAnyData, pageTitleFromContent, toast]);

  const exportButtonsDisabled = isAnyLoading || !hasAnyData;
  const canRefresh = !!(displayUrl || url) && !isLoadingUrl && !isAnyLoading;

  useEffect(() => {
    const handleScroll = () => {
      if (actionsCardWrapperRef.current) {
        const rect = actionsCardWrapperRef.current.getBoundingClientRect();
        // Show floating buttons if the bottom of the original actions card is above 20% of the viewport height
        // or completely off-screen above.
        if (rect.bottom < window.innerHeight * 0.20) {
          setShowFloatingActions(true);
        } else {
          setShowFloatingActions(false);
        }
      } else {
        setShowFloatingActions(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [analysisInitiated, isAnyLoading, hasAnyData]); // Re-evaluate on these state changes


  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <UrlInputForm 
        onSubmit={(newUrl) => { setUrl(newUrl); handleUrlSubmit(newUrl); }} 
        isLoading={isLoadingUrl} 
        initialUrl={url} 
      />

      {urlError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{urlError}</AlertDescription>
        </Alert>
      )}

      {isLoadingUrl && <LoadingIndicator text="Fetching URL content..."/>}

      <FloatingActionButtons
        onRefresh={handleRefreshAnalysis}
        onCopyToClipboard={handleCopyToClipboard}
        onDownloadMarkdown={handleDownloadMarkdown}
        canRefresh={canRefresh}
        exportButtonsDisabled={exportButtonsDisabled}
        isLoading={isAnyLoading || isLoadingUrl}
        isVisible={showFloatingActions && hasAnyData}
      />

      {analysisInitiated && !urlError && !isLoadingUrl && (
        <>
          {headerImageData?.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-xl aspect-[3/1] relative bg-muted">
              <NextImage
                src={headerImageData.imageUrl}
                alt="AI Generated Header"
                layout="fill"
                objectFit="cover"
                data-ai-hint="abstract concept"
              />
            </div>
          )}
          {isLoadingHeaderImage && !headerImageData?.imageUrl &&(
            <AnalysisSection title="Header Image" icon={ImageIcon} isLoading={true} error={errorHeaderImage} className="mb-6">
                <div className="h-40 w-full bg-muted rounded-md animate-pulse" data-ai-hint="placeholder abstract"></div>
            </AnalysisSection>
          )}
          {errorHeaderImage && (
             <AnalysisSection title="Header Image" icon={ImageIcon} isLoading={false} error={errorHeaderImage} className="mb-6">
                <p>Could not load header image.</p>
            </AnalysisSection>
          )}

          <div ref={actionsCardWrapperRef}>
            <ActionButtons 
              onRefresh={handleRefreshAnalysis}
              onCopyToClipboard={handleCopyToClipboard}
              onDownloadMarkdown={handleDownloadMarkdown}
              canRefresh={canRefresh}
              exportButtonsDisabled={exportButtonsDisabled}
              isLoading={isAnyLoading || isLoadingUrl}
              hasData={hasAnyData} // Pass hasData to ActionButtons as well
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <AnalysisSection title="Discussion Summary" icon={FileText} isLoading={isLoadingSummary} error={errorSummary}>
              {summaryData?.summary ? (
                <>
                {pageTitleFromContent && <div className="text-sm text-muted-foreground mb-2"><strong>Original Page Title:</strong> {pageTitleFromContent}</div>}
                <div className="whitespace-pre-wrap">{summaryData.summary}</div>
                </>
              ) : (
                !isLoadingSummary && <p>No summary available.</p>
              )}
            </AnalysisSection>

            <AnalysisSection title="Sentiment Analysis" icon={getSentimentIcon(sentimentData?.sentiment)} isLoading={isLoadingSentiment} error={errorSentiment}>
              {sentimentData ? (
                <div className="space-y-2">
                  <div><strong>Overall Sentiment:</strong> <Badge variant={sentimentData.sentiment.toLowerCase().includes('positive') ? 'default' : sentimentData.sentiment.toLowerCase().includes('negative') ? 'destructive' : 'secondary'}>{sentimentData.sentiment}</Badge></div>
                  <div><strong>Score:</strong> {sentimentData.score.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground"><strong>Explanation:</strong> {sentimentData.explanation}</div>
                </div>
              ) : (
                !isLoadingSentiment && <p>No sentiment analysis available.</p>
              )}
            </AnalysisSection>
            
            <AnalysisSection title="Word Cloud" icon={Tags} isLoading={isLoadingWordCloud} error={errorWordCloud} className="md:col-span-2">
              <WordCloudDisplay data={wordCloudData} />
            </AnalysisSection>

            <AnalysisSection title="Key Discussion Points & Quotes" icon={ListChecks} isLoading={isLoadingKeyPoints} error={errorKeyPoints} className="md:col-span-2">
              {keyPointsData ? (
                <div className="space-y-4">
                  {keyPointsData.keyPoints && keyPointsData.keyPoints.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary"/>Key Points:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        {keyPointsData.keyPoints.map((point, index) => <li key={`point-${index}`}>{point}</li>)}
                      </ul>
                    </div>
                  )}
                  {keyPointsData.quotes && keyPointsData.quotes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mt-4 mb-2 flex items-center"><QuoteIcon className="mr-2 h-5 w-5 text-primary"/>Relevant Quotes:</h3>
                      <ul className="space-y-3">
                        {keyPointsData.quotes.map((quote, index) => (
                          <li key={`quote-${index}`} className="border-l-4 border-accent p-3 bg-accent/10 rounded-r-md italic">"{quote}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!keyPointsData.keyPoints || keyPointsData.keyPoints.length === 0) && (!keyPointsData.quotes || keyPointsData.quotes.length === 0) && (
                     <p>No key points or quotes extracted.</p>
                  )}
                </div>
              ) : (
                !isLoadingKeyPoints && <p>No key points or quotes available.</p>
              )}
            </AnalysisSection>

            <AnalysisSection title="Contextualized Links" icon={LinkIcon} isLoading={isLoadingLinks} error={errorLinks} className="md:col-span-2">
              {linksData && linksData.length > 0 ? (
                <ul className="space-y-4">
                  {linksData.map((linkItem, index) => (
                    <li key={`link-${index}`} className="border p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                      <a href={linkItem.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all block">
                        {linkItem.url}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">{linkItem.context}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                !isLoadingLinks && <p>No links found or contextualized.</p>
              )}
            </AnalysisSection>
          </div>
        </>
      )}
    </div>
  );
}
