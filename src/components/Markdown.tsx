import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/slug";

function text(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(text).join("");
  return "";
}

const components: Components = {
  h2: ({ children }) => <h2 id={slugify(text(children))}>{children}</h2>,
  a: ({ href = "", children }) =>
    href.startsWith("http") ? (
      <a href={href} rel="noopener" target="_blank">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
};

/** Raw HTML in markdown is ignored (react-markdown default), so content files cannot inject scripts. */
export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
