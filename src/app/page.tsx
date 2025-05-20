
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { UrlInputForm } from '@/components/verbal-insights/UrlInputForm';
import { AnalysisSection } from '@/components/verbal-insights/AnalysisSection';
import { ActionButtons } from '@/components/verbal-insights/ActionButtons';
import { FloatingActionButtons } from '@/components/verbal-insights/FloatingActionButtons';
import { LoadingIndicator } from '@/components/verbal-insights/LoadingIndicator';
import { fetchUrlContent } from '@/lib/actions';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, ListChecks, MessageSquareText, Link as LinkIcon, Smile, Frown, Meh, QuoteIcon, Tags, ListTodo } from 'lucide-react';
import { WordCloudDisplay } from '@/components/verbal-insights/WordCloudDisplay';
import { useToast } from '@/hooks/use-toast';
import React from 'react';


// AI Flow Imports
import { summarizeDiscussion, type SummarizeDiscussionOutput } from '@/ai/flows/summarize-discussion';
import { extractKeyPoints, type ExtractKeyPointsOutput } from '@/ai/flows/extract-key-points';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { contextualizeLinks, type ContextualizeLinksOutput } from '@/ai/flows/contextualize-links';
import { generateHeaderImage, type GenerateHeaderImageOutput } from '@/ai/flows/generate-header-image';
import { generateWordCloud, type GenerateWordCloudOutput } from '@/ai/flows/generate-word-cloud';
import { extractActionItems, type ExtractActionItemsOutput } from '@/ai/flows/extract-action-items';

// Helper function to render simple inline Markdown (bold, italic)
const renderMarkdownLine = (line: string, lineKey: string | number): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // Regex for **bold** or *italic* or _italic_ (non-greedy)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    // Add the bold or italic part
    if (match[2]) { // **bold**
      parts.push(<strong key={`${lineKey}-bold-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) { // *italic*
      parts.push(<em key={`${lineKey}-italic1-${match.index}`}>{match[3]}</em>);
    } else if (match[4]) { // _italic_
      parts.push(<em key={`${lineKey}-italic2-${match.index}`}>{match[4]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return <>{parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
};

const aiDisclaimer = "Disclaimer: AI-generated content may contain inaccuracies. Always verify critical information.";

export default function VerbalInsightsPage() {
  const [urlOrPastedText, setUrlOrPastedText] = useState(''); 
  const [currentInputMode, setCurrentInputMode] = useState<'url' | 'text'>('url');
  const [fetchedPageContent, setFetchedPageContent] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false); // Used for URL fetching or indicating text processing start
  const [urlError, setUrlError] = useState<string | null>(null);
  const [analysisInitiated, setAnalysisInitiated] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null); // Shows "Pasted Content" or actual URL

  const [headerImageData, setHeaderImageData] = useState<GenerateHeaderImageOutput | null>(null);
  const [isLoadingHeaderImage, setIsLoadingHeaderImage] = useState(false);

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

  const [actionItemsData, setActionItemsData] = useState<ExtractActionItemsOutput | null>(null);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState(false);
  const [errorActionItems, setErrorActionItems] = useState<string | null>(null);

  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);

  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const actionsCardWrapperRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const resetAllStates = useCallback(() => {
    setFetchedPageContent(null);
    setUrlError(null);
    setAnalysisInitiated(false); 
    
    setHeaderImageData(null); setIsLoadingHeaderImage(false);
    setSummaryData(null); setIsLoadingSummary(false); setErrorSummary(null);
    setKeyPointsData(null); setIsLoadingKeyPoints(false); setErrorKeyPoints(null);
    setSentimentData(null); setIsLoadingSentiment(false); setErrorSentiment(null);
    setLinksData(null); setIsLoadingLinks(false); setErrorLinks(null);
    setWordCloudData(null); setIsLoadingWordCloud(false); setErrorWordCloud(null);
    setActionItemsData(null); setIsLoadingActionItems(false); setErrorActionItems(null);
    setPageTitleFromContent(null);
    setIsTakingScreenshot(false);
  }, []);

  const handleAnalysisSubmit = useCallback(async (submittedValue: string, inputMode: 'url' | 'text') => {
    if (!submittedValue) return;

    resetAllStates();
    setIsLoadingUrl(true); 
    setUrlError(null);
    setCurrentInputMode(inputMode);
    setUrlOrPastedText(submittedValue); 
    setAnalysisInitiated(true); 

    if (inputMode === 'url') {
      setDisplayUrl(submittedValue);
      const result = await fetchUrlContent(submittedValue);
      setIsLoadingUrl(false);

      if (result.error) {
        setUrlError(result.error);
        setFetchedPageContent(null);
        setAnalysisInitiated(false); 
      } else if (result.content) {
        setFetchedPageContent(result.content);
        const finalUrl = result.finalUrl || submittedValue;
        setDisplayUrl(finalUrl); 
        setUrlOrPastedText(finalUrl); 

        const titleMatch = result.content.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          setPageTitleFromContent(titleMatch[1].trim());
        }
      } else {
        setUrlError("Failed to fetch content or content was empty.");
        setFetchedPageContent(null);
        setAnalysisInitiated(false); 
      }
    } else { 
      setDisplayUrl("Pasted Content");
      setFetchedPageContent(submittedValue);
      setPageTitleFromContent("Pasted Analysis"); 
      setIsLoadingUrl(false); 
      
      setIsLoadingLinks(false);
      setLinksData(null);
      // setErrorLinks("Link contextualization is not applicable for pasted text."); // Error set in main useEffect now
    }
  }, [resetAllStates]);
  
  // Individual Refresh Handlers
  const handleRefreshSummary = useCallback(async () => {
    if (!fetchedPageContent) return;
    setIsLoadingSummary(true); setErrorSummary(null);
    try {
      const data = await summarizeDiscussion({ url: currentInputMode === 'url' ? (displayUrl || urlOrPastedText) : "Pasted Content", content: fetchedPageContent });
      setSummaryData(data);
    } catch (err: any) { setErrorSummary(err.message || "Failed to refresh summary."); }
    finally { setIsLoadingSummary(false); }
  }, [fetchedPageContent, displayUrl, urlOrPastedText, currentInputMode]);

  const handleRefreshKeyPoints = useCallback(async () => {
    if (!fetchedPageContent) return;
    setIsLoadingKeyPoints(true); setErrorKeyPoints(null);
    try {
      const data = await extractKeyPoints({ conversation: fetchedPageContent });
      setKeyPointsData(data);
    } catch (err: any) { setErrorKeyPoints(err.message || "Failed to refresh key points."); }
    finally { setIsLoadingKeyPoints(false); }
  }, [fetchedPageContent]);

  const handleRefreshSentiment = useCallback(async () => {
    if (!fetchedPageContent) return;
    setIsLoadingSentiment(true); setErrorSentiment(null);
    try {
      const data = await analyzeSentiment({ text: fetchedPageContent });
      setSentimentData(data);
    } catch (err: any) { setErrorSentiment(err.message || "Failed to refresh sentiment."); }
    finally { setIsLoadingSentiment(false); }
  }, [fetchedPageContent]);

  const handleRefreshLinks = useCallback(async () => {
    if (!fetchedPageContent || currentInputMode !== 'url' || !displayUrl || displayUrl === "Pasted Content") {
      setErrorLinks("Link contextualization is not applicable or no URL available for refresh.");
      return;
    }
    setIsLoadingLinks(true); setErrorLinks(null);
    try {
      const data = await contextualizeLinks({ pageContent: fetchedPageContent, sourceUrl: displayUrl });
      setLinksData(data);
    } catch (err: any) { setErrorLinks(err.message || "Failed to refresh links."); }
    finally { setIsLoadingLinks(false); }
  }, [fetchedPageContent, displayUrl, currentInputMode]);

  const handleRefreshWordCloud = useCallback(async () => {
    if (!fetchedPageContent) return;
    setIsLoadingWordCloud(true); setErrorWordCloud(null);
    try {
      const data = await generateWordCloud({ textContent: fetchedPageContent });
      setWordCloudData(data);
    } catch (err: any) { setErrorWordCloud(err.message || "Failed to refresh word cloud."); }
    finally { setIsLoadingWordCloud(false); }
  }, [fetchedPageContent]);

  const handleRefreshActionItems = useCallback(async () => {
    if (!fetchedPageContent) return;
    setIsLoadingActionItems(true); setErrorActionItems(null);
    try {
      const data = await extractActionItems({ conversation: fetchedPageContent });
      setActionItemsData(data);
    } catch (err: any) { setErrorActionItems(err.message || "Failed to refresh action items."); }
    finally { setIsLoadingActionItems(false); }
  }, [fetchedPageContent]);


  useEffect(() => {
    if (fetchedPageContent && displayUrl && analysisInitiated) { 
      const contentToAnalyze = fetchedPageContent; 
      const currentDisplayReference = displayUrl; 

      handleRefreshSummary();
      handleRefreshKeyPoints();
      handleRefreshSentiment();
      handleRefreshWordCloud();
      handleRefreshActionItems();

      if (currentInputMode === 'url' && currentDisplayReference !== "Pasted Content") {
        handleRefreshLinks();
      } else {
         setLinksData(null);
         setIsLoadingLinks(false);
         if (!errorLinks) setErrorLinks("Link contextualization is not applicable for pasted text.");
      }
    }
  }, [fetchedPageContent, displayUrl, currentInputMode, analysisInitiated, errorLinks, 
      handleRefreshSummary, handleRefreshKeyPoints, handleRefreshSentiment, 
      handleRefreshLinks, handleRefreshWordCloud, handleRefreshActionItems]); 


  useEffect(() => {
    if (!analysisInitiated) {
      setHeaderImageData(null); 
      return;
    }
    
    if (!fetchedPageContent) {
        return;
    }

    let imagePromptText = "";

    if (wordCloudData && wordCloudData.length > 0) {
      const topWords = wordCloudData
        .slice() 
        .sort((a, b) => b.value - a.value) 
        .slice(0, 7) 
        .map(item => item.text)
        .join(', ');
      if (topWords) {
        imagePromptText = `Create an artistic, abstract, and visually compelling wide header image inspired by these key concepts: ${topWords}. The image should evoke the general theme and sentiment without depicting any text or specific objects mentioned. Focus on atmosphere and conceptual representation.`;
      }
    }

    if (!imagePromptText && pageTitleFromContent) {
      imagePromptText = `Create an artistic, abstract, and visually compelling wide header image inspired by the title: "${pageTitleFromContent}". The image should evoke the general theme and sentiment without depicting any text or the title itself. Focus on atmosphere and conceptual representation.`;
    }
    
    if (!imagePromptText && fetchedPageContent) {
      const contentSnippet = fetchedPageContent.substring(0, 300);
      imagePromptText = `Create an artistic, abstract, and visually compelling wide header image representing the mood and key themes from the following text snippet: "${contentSnippet}". The image should be purely visual, without any text. Focus on atmosphere and conceptual representation.`;
    }
    
    if (!imagePromptText) { 
        imagePromptText = "Generate an abstract, artistic, wide header image with a theme of communication, technology, or insight. The image should be purely visual, without any text. Focus on atmosphere and conceptual representation.";
    }

    setIsLoadingHeaderImage(true);
    generateHeaderImage({ text: imagePromptText })
      .then(setHeaderImageData)
      .catch(err => {
        console.error("Failed to generate header image:", err.message);
        setHeaderImageData(null); 
      })
      .finally(() => setIsLoadingHeaderImage(false));

  }, [wordCloudData, pageTitleFromContent, fetchedPageContent, analysisInitiated]);


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
    markdown += `**Analyzed Source:** ${displayUrl || (currentInputMode === 'text' ? 'Pasted Content' : urlOrPastedText)}\n`; 
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

    if (actionItemsData && actionItemsData.actionItems?.length > 0) {
      markdown += `## Action Items\n`;
      actionItemsData.actionItems.forEach(item => markdown += `- ${item}\n`);
      markdown += `\n`;
    }

    if (linksData && linksData.length > 0 && currentInputMode === 'url') {
      markdown += `## Contextualized Links\n`;
      linksData.forEach((linkItem, index) => {
        markdown += `${index + 1}. **[${linkItem.url}](${linkItem.url})**\n`;
        markdown += `   - Context: ${linkItem.context}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n${aiDisclaimer}\n`;

    return markdown;
  }, [analysisInitiated, displayUrl, urlOrPastedText, currentInputMode, summaryData, keyPointsData, sentimentData, linksData, pageTitleFromContent, wordCloudData, actionItemsData]);

  const hasAnyData = !!(summaryData || keyPointsData || sentimentData || (linksData && currentInputMode === 'url') || headerImageData || wordCloudData || actionItemsData);
  const isAnyLoading = isLoadingUrl || isLoadingHeaderImage || isLoadingSummary || isLoadingKeyPoints || isLoadingSentiment || isLoadingLinks || isLoadingWordCloud || isLoadingActionItems;


  const handleGlobalRefreshAnalysis = () => {
    if (urlOrPastedText) { 
      handleAnalysisSubmit(urlOrPastedText, currentInputMode);
    }
  };

  const handleCopyToClipboard = useCallback(async () => {
    if (!hasAnyData) {
        toast({ title: "No Data", description: "Please analyze a URL or paste text first to generate data.", variant: "destructive" });
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
        toast({ title: "No Data", description: "Please analyze a URL or paste text first to generate data.", variant: "destructive" });
        return;
    }
    const markdownData = getAnalysisDataAsMarkdown();
    const timestamp = new Date().toISOString().split('T')[0]; 
    const safePageTitle = pageTitleFromContent ? pageTitleFromContent.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) : (currentInputMode === 'text' ? 'pasted_content' : 'analysis');
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
  }, [getAnalysisDataAsMarkdown, hasAnyData, pageTitleFromContent, currentInputMode, toast]);


  const handleDownloadScreenshot = useCallback(async () => {
    if (!hasAnyData) {
      toast({ title: "No Data", description: "Please analyze first to generate data for a screenshot.", variant: "destructive" });
      return;
    }
    setIsTakingScreenshot(true);
    toast({
      title: "Screen Capture",
      description: "Please select the current browser tab or screen. The visible area will be captured.",
      duration: 7000,
    });

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "never" } as MediaTrackConstraints, 
        audio: false,
      });
      
      const track = mediaStream.getVideoTracks()[0];
      
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          // Add a small delay to ensure the content is fully rendered in the video stream
          setTimeout(() => resolve(), 500); // Increased delay
        };
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        track.stop(); 
        video.srcObject = null;
        throw new Error('Failed to get canvas context');
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');

      track.stop();
      video.srcObject = null;


      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safePageTitle = pageTitleFromContent ? pageTitleFromContent.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) : (currentInputMode === 'text' ? 'pasted_content_screenshot' : 'analysis_screenshot');
      const filename = `verbal_insights_${safePageTitle}_${timestamp}.png`;

      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Screenshot Downloaded", description: `${filename} saved successfully.` });

    } catch (error: any) {
      console.error("Error taking screenshot:", error);
      if (error.name === 'NotAllowedError') {
        toast({ title: "Screenshot Cancelled", description: "Screen capture permission was denied or cancelled.", variant: "destructive" });
      } else {
        toast({ title: "Screenshot Failed", description: `Could not capture screenshot: ${error.message}`, variant: "destructive" });
      }
    } finally {
      setIsTakingScreenshot(false);
    }
  }, [hasAnyData, pageTitleFromContent, currentInputMode, toast]);


  const exportButtonsDisabled = isAnyLoading || !hasAnyData || isTakingScreenshot;
  const canRefreshGlobal = !!(urlOrPastedText) && !isLoadingUrl && !isAnyLoading && !isTakingScreenshot;


  useEffect(() => {
    const handleScroll = () => {
      if (actionsCardWrapperRef.current) {
        const rect = actionsCardWrapperRef.current.getBoundingClientRect();
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
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [analysisInitiated, isAnyLoading, hasAnyData]); 

  const handleCopySection = useCallback(async (content: string | null, sectionName: string) => {
    if (!content) {
      toast({ title: `No ${sectionName} Data`, description: `No ${sectionName.toLowerCase()} data to copy.`, variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: `${sectionName} Copied!`, description: `${sectionName} copied to clipboard.` });
    } catch (err) {
      toast({ title: "Copy Failed", description: `Could not copy ${sectionName.toLowerCase()}.`, variant: "destructive" });
      console.error(`Failed to copy ${sectionName}: `, err);
    }
  }, [toast]);

  const handleCopySummary = useCallback(() => {
    let textToCopy = "";
    if (pageTitleFromContent) textToCopy += `Title: ${pageTitleFromContent}\n\n`;
    if (summaryData?.summary) textToCopy += summaryData.summary;
    
    const trimmedContent = textToCopy.trim();
    if (trimmedContent) {
      handleCopySection(`${trimmedContent}\n\n---\n${aiDisclaimer}`, "Summary");
    } else {
      handleCopySection(null, "Summary");
    }
  }, [summaryData, pageTitleFromContent, handleCopySection]);

  const handleCopySentiment = useCallback(() => {
    if (!sentimentData) {
      handleCopySection(null, "Sentiment");
      return;
    }
    let textToCopy = `Overall Sentiment: ${sentimentData.sentiment}\nScore: ${sentimentData.score.toFixed(2)}\nExplanation: ${sentimentData.explanation}`;
    textToCopy += `\n\n---\n${aiDisclaimer}`;
    handleCopySection(textToCopy, "Sentiment Analysis");
  }, [sentimentData, handleCopySection]);
  
  const handleCopyWordCloud = useCallback(() => {
    if (!wordCloudData || wordCloudData.length === 0) {
        handleCopySection(null, "Word Cloud");
        return;
    }
    let textToCopy = wordCloudData.map(item => `${item.text} (value: ${item.value})`).join('\n');
    textToCopy += `\n\n---\n${aiDisclaimer}`;
    handleCopySection(textToCopy, "Word Cloud");
  }, [wordCloudData, handleCopySection]);

  const handleCopyKeyPoints = useCallback(() => {
    if (!keyPointsData || (!keyPointsData.keyPoints?.length && !keyPointsData.quotes?.length)) {
      handleCopySection(null, "Key Points");
      return;
    }
    let textToCopy = "";
    if (keyPointsData.keyPoints?.length > 0) {
      textToCopy += "Key Discussion Points:\n";
      keyPointsData.keyPoints.forEach(point => textToCopy += `- ${point}\n`);
      textToCopy += "\n";
    }
    if (keyPointsData.quotes?.length > 0) {
      textToCopy += "Key Quotes:\n";
      keyPointsData.quotes.forEach(quote => textToCopy += `> "${quote}"\n\n`);
    }
    
    const trimmedContent = textToCopy.trim();
    if (trimmedContent) {
      handleCopySection(`${trimmedContent}\n\n---\n${aiDisclaimer}`, "Key Points & Quotes");
    } else {
       handleCopySection(null, "Key Points & Quotes"); 
    }
  }, [keyPointsData, handleCopySection]);

  const handleCopyActionItems = useCallback(() => {
    if (!actionItemsData || !actionItemsData.actionItems || actionItemsData.actionItems.length === 0) {
      handleCopySection(null, "Action Items");
      return;
    }
    let textToCopy = "Action Items:\n" + actionItemsData.actionItems.map(item => `- ${item}`).join('\n');
    textToCopy += `\n\n---\n${aiDisclaimer}`;
    handleCopySection(textToCopy, "Action Items");
  }, [actionItemsData, handleCopySection]);

  const handleCopyLinks = useCallback(() => {
    if (!linksData || linksData.length === 0 || currentInputMode === 'text') {
      handleCopySection(null, "Links");
      return;
    }
    let textToCopy = linksData.map((linkItem, index) => `${index + 1}. ${linkItem.url}\n   Context: ${linkItem.context}`).join('\n\n');
    textToCopy += `\n\n---\n${aiDisclaimer}`;
    handleCopySection(textToCopy, "Contextualized Links");
  }, [linksData, currentInputMode, handleCopySection]);

  return (
    <>
      {headerImageData?.imageUrl && !isLoadingHeaderImage && analysisInitiated && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: `url(${headerImageData.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0, 
              transition: 'background-image 0.5s ease-in-out',
            }}
            data-ai-hint="abstract concept" 
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              zIndex: 1, 
            }}
          />
        </>
      )}

      <div className="min-h-screen container mx-auto px-4 py-8 relative z-10">
        <UrlInputForm 
          onSubmit={handleAnalysisSubmit} 
          isLoading={isLoadingUrl || isTakingScreenshot}
          initialUrl={currentInputMode === 'url' ? urlOrPastedText : ''} 
        />

        {urlError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{urlError}</AlertDescription>
          </Alert>
        )}

        {isLoadingUrl && <LoadingIndicator text={currentInputMode === 'url' ? "Fetching URL content..." : "Processing text..."}/>}

        <FloatingActionButtons
          onRefresh={handleGlobalRefreshAnalysis}
          onCopyToClipboard={handleCopyToClipboard}
          onDownloadMarkdown={handleDownloadMarkdown}
          onDownloadScreenshot={handleDownloadScreenshot}
          canRefresh={canRefreshGlobal}
          exportButtonsDisabled={exportButtonsDisabled}
          isLoading={isAnyLoading || isLoadingUrl || isTakingScreenshot}
          isTakingScreenshot={isTakingScreenshot}
          isVisible={showFloatingActions && hasAnyData}
        />

        {analysisInitiated && !urlError && !isLoadingUrl && (
          <>
            <div ref={actionsCardWrapperRef}>
              <ActionButtons 
                onRefresh={handleGlobalRefreshAnalysis}
                onCopyToClipboard={handleCopyToClipboard}
                onDownloadMarkdown={handleDownloadMarkdown}
                onDownloadScreenshot={handleDownloadScreenshot}
                canRefresh={canRefreshGlobal}
                exportButtonsDisabled={exportButtonsDisabled}
                isLoading={isAnyLoading || isLoadingUrl}
                isTakingScreenshot={isTakingScreenshot}
                hasData={hasAnyData} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <AnalysisSection 
                title="Discussion Summary" 
                icon={FileText} 
                isLoading={isLoadingSummary} 
                error={errorSummary}
                onCopy={summaryData?.summary ? handleCopySummary : undefined}
                onRefresh={fetchedPageContent ? handleRefreshSummary : undefined}
              >
                {summaryData?.summary ? (
                  <>
                  {pageTitleFromContent && <div className="text-sm text-muted-foreground mb-2"><strong>Original {currentInputMode === 'url' ? 'Page Title' : 'Source'}:</strong> {pageTitleFromContent}</div>}
                  <div className="whitespace-pre-wrap">
                    {summaryData.summary.split('\n').map((line, index) => (
                      <div key={index}>{renderMarkdownLine(line, index)}</div>
                    ))}
                  </div>
                  </>
                ) : (
                  !isLoadingSummary && <p>No summary available.</p>
                )}
              </AnalysisSection>

              <AnalysisSection 
                title="Sentiment Analysis" 
                icon={getSentimentIcon(sentimentData?.sentiment)} 
                isLoading={isLoadingSentiment} 
                error={errorSentiment}
                onCopy={sentimentData ? handleCopySentiment : undefined}
                onRefresh={fetchedPageContent ? handleRefreshSentiment : undefined}
              >
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
              
              <AnalysisSection 
                title="Word Cloud" 
                icon={Tags} 
                isLoading={isLoadingWordCloud} 
                error={errorWordCloud} 
                className="md:col-span-2"
                onCopy={(wordCloudData && wordCloudData.length > 0) ? handleCopyWordCloud : undefined}
                onRefresh={fetchedPageContent ? handleRefreshWordCloud : undefined}
              >
                <WordCloudDisplay data={wordCloudData} />
              </AnalysisSection>

              <AnalysisSection 
                title="Key Discussion Points & Quotes" 
                icon={ListChecks} 
                isLoading={isLoadingKeyPoints} 
                error={errorKeyPoints} 
                className="md:col-span-2"
                onCopy={(keyPointsData && (keyPointsData.keyPoints?.length > 0 || keyPointsData.quotes?.length > 0)) ? handleCopyKeyPoints : undefined}
                onRefresh={fetchedPageContent ? handleRefreshKeyPoints : undefined}
              >
                {keyPointsData ? (
                  <div className="space-y-4">
                    {keyPointsData.keyPoints && keyPointsData.keyPoints.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary"/>Key Points:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          {keyPointsData.keyPoints.map((point, index) => <li key={`point-${index}`}>{renderMarkdownLine(point,`kp-${index}`)}</li>)}
                        </ul>
                      </div>
                    )}
                    {keyPointsData.quotes && keyPointsData.quotes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mt-4 mb-2 flex items-center"><QuoteIcon className="mr-2 h-5 w-5 text-primary"/>Relevant Quotes:</h3>
                        <ul className="space-y-3">
                          {keyPointsData.quotes.map((quote, index) => (
                            <li key={`quote-${index}`} className="border-l-4 border-accent p-3 bg-accent/10 rounded-r-md italic">"{renderMarkdownLine(quote,`q-${index}`)}"</li>
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

              <AnalysisSection
                title="Action Items"
                icon={ListTodo}
                isLoading={isLoadingActionItems}
                error={errorActionItems}
                className="md:col-span-2"
                onCopy={(actionItemsData && actionItemsData.actionItems?.length > 0) ? handleCopyActionItems : undefined}
                onRefresh={fetchedPageContent ? handleRefreshActionItems : undefined}
              >
                {actionItemsData && actionItemsData.actionItems && actionItemsData.actionItems.length > 0 ? (
                  <ul className="list-disc pl-6 space-y-1">
                    {actionItemsData.actionItems.map((item, index) => <li key={`action-${index}`}>{renderMarkdownLine(item,`ai-${index}`)}</li>)}
                  </ul>
                ) : (
                  !isLoadingActionItems && <p>No action items identified.</p>
                )}
              </AnalysisSection>

              <AnalysisSection 
                title="Contextualized Links" 
                icon={LinkIcon} 
                isLoading={isLoadingLinks} 
                error={errorLinks} 
                className="md:col-span-2"
                onCopy={(linksData && linksData.length > 0 && currentInputMode === 'url') ? handleCopyLinks : undefined}
                onRefresh={fetchedPageContent && currentInputMode === 'url' && displayUrl !== "Pasted Content" ? handleRefreshLinks : undefined}
              >
                {linksData && linksData.length > 0 && currentInputMode === 'url' ? (
                  <ul className="space-y-4">
                    {linksData.map((linkItem, index) => (
                      <li key={`link-${index}`} className="border p-3 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <a href={linkItem.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all block">
                          {linkItem.url}
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">{renderMarkdownLine(linkItem.context, `link-ctx-${index}`)}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isLoadingLinks && (
                    <p>{errorLinks || (currentInputMode === 'text' ? "Link contextualization is not applicable for pasted text." : "No links found or contextualized.")}</p>
                  )
                )}
              </AnalysisSection>
            </div>
          </>
        )}
      </div>
    </>
  );
}

