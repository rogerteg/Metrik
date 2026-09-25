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
 * - Blockquotes starting with `> ` -> <blockquote>
 *
 * Styling is provided by the Metrik design system (`TaskActivityFeed.css`).
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`ul-${keyPrefix}-${renderedElements.length}`} className="mrf-md-list">
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
        <blockquote key={`quote-${lineIndex}`} className="mrf-md-quote">
          {parseInlineFormatting(quoteContent, `quote-${lineIndex}`)}
        </blockquote>
      );
    } else {
      flushList(`line-${lineIndex}`);

      if (trimmed === '') {
        renderedElements.push(<br key={`br-${lineIndex}`} />);
      } else {
        renderedElements.push(
          <p key={`p-${lineIndex}`} className="mrf-md-p">
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
      return <strong key={key} className="mrf-md-strong">{inner}</strong>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code key={key} className="mrf-md-code font-mono">
          {inner}
        </code>
      );
    }

    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return <em key={key} className="mrf-md-em">{inner}</em>;
    }

    return part;
  });
}
