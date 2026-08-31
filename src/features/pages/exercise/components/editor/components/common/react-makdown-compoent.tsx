import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponent = ({ text }: { text?: string }) => {
    return (
        <div className="mt-4 text-sm leading-7 text-muted-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <p className="mb-4 last:mb-0">
                            {children}
                        </p>
                    ),

                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),

                    em: ({ children }) => (
                        <em className="italic">
                            {children}
                        </em>
                    ),

                    code: ({ children, className }) => {
                        const isCodeBlock = className?.includes("language-");

                        if (isCodeBlock) {
                            return (
                                <code className="block">
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] font-medium text-foreground">
                                {children}
                            </code>
                        );
                    },

                    pre: ({ children }) => (
                        <pre className="my-4 overflow-x-auto rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground">
                            {children}
                        </pre>
                    ),

                    ul: ({ children }) => (
                        <ul className="mb-4 ml-5 list-disc space-y-2">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="mb-4 ml-5 list-decimal space-y-2">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li className="pl-1">
                            {children}
                        </li>
                    ),

                    h3: ({ children }) => (
                        <h3 className="mb-3 mt-6 text-base font-semibold text-foreground first:mt-0">
                            {children}
                        </h3>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-4 border-accent pl-4 italic text-muted-foreground">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}
export default MarkdownComponent