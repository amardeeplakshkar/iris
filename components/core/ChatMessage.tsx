'use client'

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import { TextShimmerWave } from '../ui/text-shimmer-wave';
import { Copy, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import { Attachment } from 'ai';
import { renderers } from '@/constants/renderers';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import WeatherCard from '../widgets/Weather';
import ImageDisplay from '../widgets/ImageDisplay';

interface ChatMessageProps {
  content: any;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content: msg, isUser }) => {

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy: ', err);
    });
  };

  const imageAttachments = useMemo(() =>
    msg?.experimental_attachments?.filter(
      (attachment: Attachment) => attachment?.contentType?.startsWith('image/')
    ) || [],
    [msg?.experimental_attachments]
  );

  const pdfAttachments = useMemo(() =>
    msg?.experimental_attachments?.filter(
      (attachment: Attachment) => attachment?.contentType?.startsWith('application/pdf')
    ) || [],
    [msg?.experimental_attachments]
  );

  const variant = msg.role === "user" ? "sent" : "received";

  function markdownToPlain(text: string) {
    let out = text
      .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2') // bold/italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')        // links
      .replace(/`(.+?)`/g, '$1')                 // inline code
      .replace(/#+\s?/g, '')                     // headings
      .replace(/>\s?/g, '')                      // blockquotes
      .replace(/---/g, '')                       // horizontal rules
      .replace(/\r?\n|\r/g, ' ')                 // new lines
      .replace(/\s+/g, ' ')                      // multiple spaces
      .replace(/\$\$.*?\$\$/g, '')               // display latex
      .replace(/\$.*?\$/g, '')                   // inline latex
      .replace(/\|/g, '')                        // table pipes
      .replace(/:---+|---+:/g, '')               // table headers dashes
      .trim();
    return out;
  }

  const memoizedContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm, remarkToc]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={renderers}
    >
      {msg?.content}
    </ReactMarkdown>
  ), [msg?.content]);

  const getToolResult = (toolName: string, toolInvocation: any) => {
    switch (toolName) {
      case 'displayWeather':
        return toolInvocation?.result?.location?.name && (
          <WeatherCard data={toolInvocation?.result} />
        );
      case 'youtubeTranscription':
        return (
          <>
            <iframe src={toolInvocation?.result?.embedLink} width="100%" className='aspect-video max-h-[216px] rounded-lg max-w-[384px]' height="100%" allowFullScreen></iframe>
          </>
        );
      case 'generateImage':
        return (
          <ImageDisplay
            src={toolInvocation?.result?.imageUrl}
            prompt={toolInvocation?.result?.prompt}
          />
        );
      case 'cameraAiTool':
        return (
          <></>
        );
      case 'webSearchTool':
        return (
          <Tabs defaultValue='answer'>
            <TabsList className='w-full'>
              <TabsTrigger value='answer'>Answer</TabsTrigger>
              <TabsTrigger value='source'>Sources</TabsTrigger>
            </TabsList>
            <TabsContent value='answer'>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm, remarkToc]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={renderers}
              >
                {toolInvocation?.result?.summary}
              </ReactMarkdown>
            </TabsContent>
            <TabsContent value='source'>
              {toolInvocation?.result?.sources?.map((source: any, i: number) => (
                <Link href={source.url} target='_blank' key={i}>
                  <div className="bg-card mb-2 cursor-pointer hover:bg-secondary/20 transition-all duration-300 rounded-xl p-2 shadow-md hover:shadow-xl border border-border/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-primary/80 to-primary rounded-full flex-shrink-0 shadow-inner flex items-center justify-center text-primary-foreground">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium line-clamp-1 text-sm">{source.url}</h4>
                        <p className="text-sm line-clamp-1 text-muted-foreground">{source.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </TabsContent>
            <Separator />
            <p className='text-muted-foreground text-sm'>Summary:</p>
          </Tabs>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className='max-w-[85%]'>
        <div key={msg.id} className="first:pt-0 last:pb-0">
          <div className={`flex gap-3 ${variant === "sent" && "flex-row-reverse bg-secondary-foreground/10 p-2 px-3 rounded-2xl"}`}>
            <div className="flex-1 max-w-[100%]">
              <div>
                {msg.toolInvocations?.map((toolInvocation: any) => {
                  const { toolName, toolCallId, state } = toolInvocation;
                  const showResultText = ['displayWeather', 'webSearchTool', 'generateImage', 'youtubeTranscription', 'cameraAiTool'].includes(toolName);

                  const toolMessages: Record<string, string> = {
                    displayWeather: 'Analysing Weather...',
                    webSearchTool: 'Searching Web...',
                    generateImage: 'Generating Image...',
                    youtubeTranscription: 'Analysing Video...',
                    cameraAiTool: 'Analysing Video'
                  };
                  return (
                    <div key={toolCallId}>
                      {showResultText ? (
                        state === 'result' ? (
                          getToolResult(toolName, toolInvocation)
                        ) : (
                          <TextShimmerWave className="font-mono text-sm" duration={1}>
                            {toolMessages[toolName] ?? ''}
                          </TextShimmerWave>
                        )
                      ) : null}
                    </div>
                  );
                })}
                {imageAttachments.length > 0 && (
                  <div className={`flex flex-wrap ${imageAttachments.length > 1 ? '' : ''}`}>
                    {imageAttachments.map((attachment: Attachment, index: number) => (
                      <Image
                        key={`${msg?.id}-image-${index}`}
                        src={attachment.url}
                        width={150}
                        height={150}
                        alt={attachment.name ?? `attachment-${index}`}
                        className="rounded-xl overflow-hidden"
                      />
                    ))}
                  </div>
                )}

                {pdfAttachments.map((attachment: Attachment, index: number) => (
                  <iframe
                    key={`${msg?.id}-pdf-${index}`}
                    src={attachment.url}
                    className="w-full h-96 mt-4 rounded border"
                    title={attachment.name ?? `attachment-${index}`}
                  />
                ))}
              </div>
              {memoizedContent}
              {
                msg.role !== "user" &&
                <div className='flex items-center gap-2'>
                  <Button
                    size="sm"
                    onClick={() => handleCopy(String(msg.content).replace(/\n$/, ''))}
                    variant="outline"
                    className="cursor-pointer my-1 shadow-md"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);