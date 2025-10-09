
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface StepProps {
  title: string;
  description: string;
  code?: string;
  language?: string;
  image?: string;
}

const Step: React.FC<StepProps> = ({ title, description, code, language, image }) => {
  return (
    <article className="card">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="step-content">
          <ReactMarkdown
            children={description}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !className;
                return !inline && match ? (
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    style={oneLight}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => <h3>{children}</h3>,
              h2: ({ children }) => <h4>{children}</h4>,
              h3: ({ children }) => <h5>{children}</h5>,
              p: ({ children }) => <p>{children}</p>,
              ul: ({ children }) => <ul>{children}</ul>,
              ol: ({ children }) => <ol>{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong>{children}</strong>,
              em: ({ children }) => <em>{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="blockquote">
                  {children}
                </blockquote>
              ),
            }}
          />
        </div>
        {code && language && (
          <div className="code-block">
            <SyntaxHighlighter
              children={code}
              style={oneLight}
              language={language}
              PreTag="div"
            />
          </div>
        )}
        {image && (
          <figure className="mt-3">
            <img src={image} alt={title} className="img-fluid" />
            <figcaption className="text-muted small mt-2">
              {title}
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
};

export default Step;
