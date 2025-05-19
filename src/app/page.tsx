

"use client";

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with local Image
import { UrlInputForm } from '@/components/verbal-insights/UrlInputForm';
import { AnalysisSection } from '@/components/verbal-insights/AnalysisSection';
import { ActionButtons } from '@/components/verbal-insights/ActionButtons';
import { LoadingIndicator } from '@/components/verbal-insights/LoadingIndicator';
import { fetchUrlContent } from '@/lib/actions';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, ListChecks, MessageSquareText, Link as LinkIcon, Smile, Frown, Meh, Image as ImageIcon, QuoteIcon } from 'lucide-react';

// AI Flow Imports
import { summarizeDiscussion, type SummarizeDiscussionOutput } from '@/ai/flows/summarize-discussion';
import { extractKeyPoints, type ExtractKeyPointsOutput } from '@/ai/flows/extract-key-points';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { contextualizeLinks, type ContextualizeLinksOutput } from '@/ai/flows/contextualize-links';
import { generateHeaderImage, type GenerateHeaderImageOutput } from '@/ai/flows/generate-header-image';

type AllAnalysisData = {
  summary: SummarizeDiscussionOutput | null;
  keyPoints: ExtractKeyPointsOutput | null;
  sentiment: AnalyzeSentimentOutput | null;
  links: ContextualizeLinksOutput | null;
  headerImage: GenerateHeaderImageOutput | null;
  sourceUrl: string | null;
  pageTitle?: string | null; 
};

export default function VerbalInsightsPage() {
  const [url, setUrl] = useState('');
  const [fetchedPageContent, setFetchedPageContent] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [analysisInitiated, setAnalysisInitiated] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  // Analysis states
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


  const resetAllStates = () => {
    setFetchedPageContent(null);
    setUrlError(null);
    setAnalysisInitiated(false);
    setDisplayUrl(null);

    setHeaderImageData(null); setIsLoadingHeaderImage(false); setErrorHeaderImage(null);
    setSummaryData(null); setIsLoadingSummary(false); setErrorSummary(null);
    setKeyPointsData(null); setIsLoadingKeyPoints(false); setErrorKeyPoints(null);
    setSentimentData(null); setIsLoadingSentiment(false); setErrorSentiment(null);
    setLinksData(null); setIsLoadingLinks(false); setErrorLinks(null);
    setPageTitleFromContent(null);
  };

  const handleUrlSubmit = async (submittedUrl: string) => {
    resetAllStates();
    setUrl(submittedUrl);
    setIsLoadingUrl(true);
    setUrlError(null);
    setAnalysisInitiated(true);
    setDisplayUrl(submittedUrl);

    const result = await fetchUrlContent(submittedUrl);
    setIsLoadingUrl(false);

    if (result.error) {
      setUrlError(result.error);
      setFetchedPageContent(null);
    } else if (result.content) {
      setFetchedPageContent(result.content);
      if (result.finalUrl && result.finalUrl !== submittedUrl) {
        setDisplayUrl(result.finalUrl); // Update display URL if redirected
      }
      // Try to extract title from <title> tag
      const titleMatch = result.content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        setPageTitleFromContent(titleMatch[1].trim());
      }
    } else {
      setUrlError("Failed to fetch content or content was empty.");
      setFetchedPageContent(null);
    }
  };
  
  const extractPageTitleFromContent = (htmlContent: string): string | null => {
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch && titleMatch[1] ? titleMatch[1].trim() : null;
  };


  useEffect(() => {
    if (fetchedPageContent && url) {
      const contentToAnalyze = fetchedPageContent; 
      const currentDisplayUrl = displayUrl || url; 

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPageContent, url]); 

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
  }, [analysisInitiated, displayUrl, url, summaryData, keyPointsData, sentimentData, linksData, pageTitleFromContent]);

  const hasAnyData = !!(summaryData || keyPointsData || sentimentData || linksData || headerImageData);
  const isAnyLoading = isLoadingUrl || isLoadingHeaderImage || isLoadingSummary || isLoadingKeyPoints || isLoadingSentiment || isLoadingLinks;


  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoadingUrl} />

      {urlError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{urlError}</AlertDescription>
        </Alert>
      )}

      {isLoadingUrl && <LoadingIndicator text="Fetching URL content..."/>}

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


          <ActionButtons 
            getAnalysisDataAsMarkdown={getAnalysisDataAsMarkdown} 
            pageTitle={pageTitleFromContent || (displayUrl ? new URL(displayUrl).hostname : null)}
            hasData={hasAnyData}
            isLoading={isAnyLoading && !hasAnyData} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <AnalysisSection title="Discussion Summary" icon={FileText} isLoading={isLoadingSummary} error={errorSummary}>
              {summaryData?.summary ? (
                <>
                {pageTitleFromContent && <div className="text-sm text-muted-foreground mb-2"><strong>Original Page Title:</strong> {pageTitleFromContent}</div>}
                <p className="whitespace-pre-wrap">{summaryData.summary}</p>
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


    
