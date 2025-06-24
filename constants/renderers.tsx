import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockGroup, CodeBlockCode } from "@/components/ui/code-block";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { HoverPeek } from "@/components/ui/link-preview";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Artifact from "@/components/widgets/Artifact";
import { MessageMermaid } from "@/components/widgets/Mermaid";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";


export const renderers = {
  table({ node, className, children, ...props }: any) {
    return (
      <div className="my-4 w-full overflow-x-auto">
        <Table
          className='rounded overflow-hidden'
          {...props}
        >
          {children}
        </Table>
      </div>
    );
  },
  thead({ node, ...props }: any) {
    return <TableHeader {...props} />;
  },
  tbody({ node, ...props }: any) {
    return <TableBody {...props} />;
  },
  tr({ node, ...props }: any) {
    return (
      <TableRow
        {...props}
      />
    );
  },
  th({ node, ...props }: any) {
    return (
      <TableHead
        className=''
        {...props}
      />
    );
  },
  td({ node, ...props }: any) {
    return (
      <TableCell
        className=''
        {...props}
      />
    );
  },
  blockquote({ node, ...props }: any) {
    return <blockquote className="border-l-4 pl-4 italic text-muted-foreground" {...props} />;
  },

  hr({ node, ...props }: any) {
    return <Separator className="my-6" {...props} />;
  },

  em({ node, ...props }: any) {
    return <em className="italic" {...props} />;
  },

  del({ node, ...props }: any) {
    return <del className="line-through text-muted-foreground" {...props} />;
  },

  h1: ({ node, children, ...props }: any) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }: any) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }: any) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }: any) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }: any) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }: any) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },

  pre: ({ children }: any) => <>{children}</>,
  ol: ({ node, children, ...props }: any) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }: any) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }: any) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }: any) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }: any) => {
    const { href } = props;
    return (
      <HoverPeek url={href}>
        <Link
          className="text-blue-500 text-ellipsis line-clamp-1 inline hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      </HoverPeek>
    );
  },
  img({ node, src, alt, ...props }: any) {
    return <img src={src} alt={alt} className="rounded-md my-4 max-w-full" {...props} />;
  },

  span({ node, ...props }: any) {
    return <span className="text-base" {...props} />;
  },

  div({ node, ...props }: any) {
    return <div className="my-2" {...props} />;
  },

  br({ node, ...props }: any) {
    return <br {...props} />;
  },

  input({ node, ...props }: any) {
    return <input className="border px-2 py-1 rounded" disabled {...props} />;
  },

  label({ node, ...props }: any) {
    return <label className="text-sm font-medium" {...props} />;
  },

  small({ node, ...props }: any) {
    return <small className="text-xs text-muted-foreground" {...props} />;
  },

  abbr({ node, title, ...props }: any) {
    return <abbr title={title} className="underline dotted cursor-help" {...props} />;
  },

  kbd({ node, ...props }: any) {
    return <kbd className="px-1 py-0.5 border rounded bg-muted font-mono text-sm" {...props} />;
  },

  sup({ node, ...props }: any) {
    return <sup className="text-xs align-super" {...props} />;
  },
  think({ node, ...props }: any) {
    return <div className="bg-red-500 p-2 rounded" {...props} />;
  },
  sub({ node, ...props }: any) {
    return <sub className="text-xs align-sub" {...props} />;
  },
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "") || "";
    const codeContent = String(children).replace(/\n$/, "");
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCopy = () => {
      navigator.clipboard.writeText(codeContent)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
    const { theme } = useTheme()
    let contentToShow;
    switch (match[1]) {
      case "mermaid":
        contentToShow = <MessageMermaid source={codeContent} theme={theme === "dark" ? "dark" : "light"} />;
        break;
      default:
        contentToShow = (
          <>
            <CodeBlock>
              <CodeBlockGroup className="border-border border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                    {match![1]}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CodeBlockGroup>
              <CodeBlockCode code={codeContent} language={match![1] || "text"} theme={theme === "dark" ? "dracula" : "github-light"} />
            </CodeBlock>
            {
              match[1] === "html" &&
              <>
                <Drawer>
                  <DrawerTrigger className="mt-2" asChild>
                    <Button variant="outline">
                      <ExternalLink />
                      Open in IRIS Artifact
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerTitle className="sr-only">
                      Open in Artifact
                    </DrawerTitle>
                    <Artifact setError={setError} theme={theme} codeContent={codeContent} fileName="index.html" template="static" />
                  </DrawerContent>
                </Drawer>
              </>
            }
            {
              match[1] === "jsx" &&
              <>
                <Drawer>
                  <DrawerTrigger className="mt-2" asChild>
                    <Button variant="outline">
                      <ExternalLink />
                      Open in IRIS Artifact
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerTitle className="sr-only">
                      Open in Artifact
                    </DrawerTitle>
                    <Artifact setError={setError} theme={theme} codeContent={codeContent} fileName="App.js" template="react" />
                  </DrawerContent>
                </Drawer>
              </>
            }
            {
              error && (
                <Alert>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )
            }
          </>
        )

        break;
    }

    return !inline && match ? (
      <>
        {contentToShow}
      </>
    ) : (
      <Badge className="whitespace-pre-wrap" {...props}>
        {children}
      </Badge>
    );
  },
};