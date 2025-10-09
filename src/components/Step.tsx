
import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
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
                  style={darcula}
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
          }}
        />
        {code && language && (
          <SyntaxHighlighter
            children={code}
            style={darcula}
            language={language}
            PreTag="div"
          />
        )}
        {image && <img src={image} alt={title} className="img-fluid mt-3" />}
      </Card.Body>
    </Card>
  );
};

export default Step;
