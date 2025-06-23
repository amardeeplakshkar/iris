import { cn } from "@/lib/utils";
import { ChatRequestOptions } from "ai";
import { Send, Paperclip, Command, BrainCog, FolderCode, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import { FileUp, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface FileDisplayProps {
    fileName: string;
    onClear: () => void;
}
function FileDisplay({ fileName, onClear }: FileDisplayProps) {
    return (
        <div className="flex -mt-2 mb-1 items-center gap-2 bg-black/5 dark:bg-white/5 w-fit px-3 py-1 rounded-lg group border dark:border-white/10">
            <FileUp className="w-4 h-4 dark:text-white" />
            <span className="text-sm dark:text-white">{fileName}</span>
            <button
                type="button"
                onClick={onClear}
                className="ml-1 cursor-pointer p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-3 h-3 dark:text-white" />
            </button>
        </div>
    );
}

interface ChatInputProps {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (event?: {
        preventDefault?: () => void;
    }, chatRequestOptions?: ChatRequestOptions) => void;
    isGenerating?: boolean;
    setInput?: React.Dispatch<React.SetStateAction<string>>
    showSearch: boolean;
    setShowSearch: Dispatch<SetStateAction<boolean>>
    showThink: boolean;
    setShowThink: Dispatch<SetStateAction<boolean>>
    showCanvas: boolean;
    setShowCanvas: Dispatch<SetStateAction<boolean>>;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, handleInputChange, handleSubmit, isGenerating, setInput, showCanvas, showSearch, showThink, setShowCanvas, setShowSearch, setShowThink }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname()
    const [placeholder, setPlaceholder] = useState("Type your message here...")

    const handleToggleChange = (value: string) => {
        let newShowSearch = showSearch;
        let newShowThink = showThink;
        let newShowCanvas = showCanvas;
    
        switch (value) {
            case "search":
                newShowSearch = !showSearch;
                newShowThink = false;
                setShowSearch(newShowSearch);
                setShowThink(false);
                break;
            case "think":
                newShowThink = !showThink;
                newShowSearch = false;
                setShowThink(newShowThink);
                setShowSearch(false);
                break;
            case "canvas":
                newShowCanvas = !showCanvas;
                setShowCanvas(newShowCanvas);
                break;
            default:
                newShowSearch = false;
                newShowThink = false;
                setShowSearch(false);
                setShowThink(false);
                break;
        }
    
        if (newShowSearch) {
            setPlaceholder("Search...");
        } else if (newShowThink) {
            setPlaceholder("Think...");
        } else {
            setPlaceholder("Type your message here...");
        }
    };

    return (
        <form
            onSubmit={(event: React.FormEvent) => {
                event.preventDefault();
                if (!input || input === null) {
                    toast.error("Please Enter Prompt First");
                    return;
                }
                handleSubmit(event, {
                    experimental_attachments: files,
                });
                setFiles(undefined)
                setFileName(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }}
            className={`border-border bg-background p-4 sticky bottom-0}`}
        >
            {fileName && <FileDisplay fileName={fileName} onClear={() => setFileName(null)} />}
            <div className="relative flex items-end">
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder={isGenerating ? "Generating response..." : placeholder}
                    className={`pr-16 resize-none ${fileName ? "min-h-[80px]" : "min-h-[100px]"}`}
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();

                            handleSubmit(event, {
                                experimental_attachments: files,
                            });
                            
                            setFiles(undefined)
                            setFileName(null);

                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }
                    }}
                />
                <div className="absolute bottom-2 left-12 flex items-center p-0.5 gap-2">
                    <button
                        type="button"
                        onClick={() => handleToggleChange("search")}
                        className={cn(
                            "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                            showSearch
                                ? "bg-blue-500/15 border-blue-500 text-blue-500"
                                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <motion.div
                                animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
                                whileHover={{ rotate: showSearch ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                            >
                                <Globe className={cn("w-4 h-4", showSearch ? "text-blue-500" : "text-inherit")} />
                            </motion.div>
                        </div>
                        <AnimatePresence>
                            {showSearch && (
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs overflow-hidden whitespace-nowrap text-blue-500 flex-shrink-0"
                                >
                                    Search
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleToggleChange("think")}
                        className={cn(
                            "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                            showThink
                                ? "bg-purple-500/15 border-purple-500 text-purple-500"
                                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <motion.div
                                animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                                whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                            >
                                <BrainCog className={cn("w-4 h-4", showThink ? "text-purple-500" : "text-inherit")} />
                            </motion.div>
                        </div>
                        <AnimatePresence>
                            {showThink && (
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs overflow-hidden whitespace-nowrap text-purple-500 flex-shrink-0"
                                >
                                    Think
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleToggleChange("canvas")}
                        className={cn(
                            "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                            showCanvas
                                ? "bg-orange-500/15 border-orange-500 text-orange-500"
                                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <motion.div
                                animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
                                whileHover={{ rotate: showCanvas ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                            >
                                <FolderCode className={cn("w-4 h-4", showCanvas ? "text-orange-500" : "text-inherit")} />
                            </motion.div>
                        </div>
                        <AnimatePresence>
                            {showCanvas && (
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xs overflow-hidden whitespace-nowrap text-orange-500 flex-shrink-0"
                                >
                                    Canvas
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
                <Button
                    type="submit"
                    size="icon"
                    variant="outline"
                    className="absolute bottom-2 right-2"
                    disabled={isGenerating}
                >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="icon"
                    variant="outline"
                    className="absolute bottom-2 left-2"
                    disabled={isGenerating}
                >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach</span>
                </Button>
                <input
                    type="file"
                    onChange={(event) => {
                        if (event.target.files && event.target.files.length > 0) {
                            const maxSize = 10 * 1024 * 1024;
                            const oversizedFiles = Array.from(event.target.files).filter(
                                file => file.size > maxSize
                            );

                            if (oversizedFiles.length > 0) {
                                toast.error(`File '${oversizedFiles[0].name}' exceeds the 10MB limit.`);
                                event.target.value = '';
                                return;
                            }

                            setFiles(event.target.files);
                            setFileName(event.target.files[0].name);
                        }
                    }}
                    hidden
                    multiple
                    ref={fileInputRef}
                />
            </div>
        </form>
    );
};

export default ChatInput;



{/* 
    
    <div className="flex items-center">
<button
  type="button"
  onClick={() => handleToggleChange("search")}
  className={cn(
    "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
    showSearch
      ? "bg-blue-500/15 border-blue-500 text-blue-500"
      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
  )}
>
  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
    <motion.div
      animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
      whileHover={{ rotate: showSearch ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      <Globe className={cn("w-4 h-4", showSearch ? "text-blue-500" : "text-inherit")} />
    </motion.div>
  </div>
  <AnimatePresence>
    {showSearch && (
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs overflow-hidden whitespace-nowrap text-blue-500 flex-shrink-0"
      >
        Search
      </motion.span>
    )}
  </AnimatePresence>
</button>

<CustomDivider />

<button
  type="button"
  onClick={() => handleToggleChange("think")}
  className={cn(
    "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
    showThink
      ? "bg-purple-500/15 border-purple-500 text-purple-500"
      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
  )}
>
  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
    <motion.div
      animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
      whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      <BrainCog className={cn("w-4 h-4", showThink ? "text-purple-500" : "text-inherit")} />
    </motion.div>
  </div>
  <AnimatePresence>
    {showThink && (
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs overflow-hidden whitespace-nowrap text-purple-500 flex-shrink-0"
      >
        Think
      </motion.span>
    )}
  </AnimatePresence>
</button>

<CustomDivider />

<button
  type="button"
  onClick={handleCanvasToggle}
  className={cn(
    "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
    showCanvas
      ? "bg-orange-500/15 border-orange-500 text-orange-500"
      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
  )}
>
  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
    <motion.div
      animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
      whileHover={{ rotate: showCanvas ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      <FolderCode className={cn("w-4 h-4", showCanvas ? "text-orange-500" : "text-inherit")} />
    </motion.div>
  </div>
  <AnimatePresence>
    {showCanvas && (
      <motion.span
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "auto", opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs overflow-hidden whitespace-nowrap text-orange-500 flex-shrink-0"
      >
        Canvas
      </motion.span>
    )}
  </AnimatePresence>
</button>
</div>

*/}