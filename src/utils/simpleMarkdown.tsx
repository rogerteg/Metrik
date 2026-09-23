import React from 'react';

/**
 * Lightweight and safe Markdown parser converting basic syntax to React elements
 * without using `dangerouslySetInnerHTML`.
 *
 * Supported formatting:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * - `code` -> <code>
 * - Bullet lists starting with `- ` or `* ` -> <ul><li>
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`ul-${keyPrefix}-${renderedElements.length}`} className="list-disc list-inside space-y-1 my-1 pl-1 text-slate-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // List item check (- or * followed by space)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listContent = trimmed.substring(2);
      currentList.push(
        <li key={`li-${lineIndex}-${currentList.length}`}>
          {parseInlineFormatting(listContent, `line-${lineIndex}`)}
        </li>
      );
    } else if (trimmed.startsWith('> ')) {
      flushList(`line-${lineIndex}`);
      const quoteContent = trimmed.substring(2);
      renderedElements.push(
        <blockquote key={`quote-${lineIndex}`} className="border-l-2 border-amber-500 bg-amber-500/5 pl-3 py-1.5 my-1.5 text-slate-300 italic text-sm rounded-r">
          {parseInlineFormatting(quoteContent, `quote-${lineIndex}`)}
        </blockquote>
      );
    } else {
      flushList(`line-${lineIndex}`);

      if (trimmed === '') {
        renderedElements.push(<br key={`br-${lineIndex}`} />);
      } else {
        renderedElements.push(
          <p key={`p-${lineIndex}`} className="leading-relaxed text-slate-300 text-sm">
            {parseInlineFormatting(line, `p-${lineIndex}`)}
          </p>
        );
      }
    }
  });

  flushList('final');

  return <>{renderedElements}</>;
}

export const parseSimpleMarkdown = renderFormattedText;

/**
 * Parses inline formatting for bold (**), italic (*), and inline code (`).
 */
function parseInlineFormatting(text: string, keyPrefix: string): React.ReactNode[] {
  // Tokenize regex pattern for **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-part-${index}`;

    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const inner = part.slice(2, -2);
      return <strong key={key} className="font-semibold text-slate-100">{inner}</strong>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={key} className="rounded bg-slate-950 px-1.5 py-0.5 text-xs font-mono text-cyan-300 border border-slate-800">
          {inner}
        </code>
      );
    }

    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return <em key={key} className="italic text-slate-200">{inner}</em>;
    }

    return part;
  });
}
