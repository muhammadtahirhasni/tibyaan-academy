import { renderPostContent } from "@/lib/markdown";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const html = renderPostContent(content);

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:text-primary prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-accent prose-a:underline
        prose-strong:text-foreground
        prose-blockquote:border-s-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-e-lg
        prose-li:text-foreground/90
        prose-ul:my-4 prose-ol:my-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
