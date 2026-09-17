import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, BarChart3, CheckCircle2, Lightbulb, Activity } from 'lucide-react';

interface AIReportMarkdownProps {
  content: string;
  remarkPlugins?: any[];
}

export function AIReportMarkdown({ content, remarkPlugins }: AIReportMarkdownProps) {
  const renderHeading = (children: any, props: any, Level: 'h2' | 'h3' | 'h4') => {
    let text = '';
    if (Array.isArray(children)) {
      text = children.join('');
    } else {
      text = String(children);
    }
    
    let Icon: React.ElementType | null = null;
    let chipClass = '';
    
    if (text.includes('🚨')) {
      Icon = Activity;
      chipClass = 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
      text = text.replace('🚨', '').trim();
    } else if (text.includes('🟠')) {
      Icon = AlertTriangle;
      chipClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
      text = text.replace('🟠', '').trim();
    } else if (text.includes('🟢')) {
      Icon = CheckCircle2;
      chipClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
      text = text.replace('🟢', '').trim();
    } else if (text.includes('📊')) {
      Icon = BarChart3;
      chipClass = 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
      text = text.replace('📊', '').trim();
    } else if (text.includes('💡')) {
      Icon = Lightbulb;
      chipClass = 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
      text = text.replace('💡', '').trim();
    }

    if (Icon) {
      return (
        <div className="flex items-center gap-2 sm:gap-2.5 mt-3.5 sm:mt-4 first:mt-0 mb-2 border-b border-white/5 pb-1.5 not-prose">
          <div className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${chipClass}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <Level className="text-xs sm:text-sm font-bold text-white m-0 p-0 border-0 tracking-tight">
            {text}
          </Level>
        </div>
      );
    }

    return (
      <Level className="text-xs sm:text-sm font-bold text-white mt-3 first:mt-0 mb-1.5 tracking-tight" {...props}>
        {children}
      </Level>
    );
  };

  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      components={{
        h2: ({ node, children, ...props }) => renderHeading(children, props, 'h2'),
        h3: ({ node, children, ...props }) => renderHeading(children, props, 'h3'),
        h4: ({ node, children, ...props }) => renderHeading(children, props, 'h4'),
        ul: ({ children }) => (
          <ul className="space-y-1 my-1.5 pl-3 sm:pl-4 list-disc marker:text-blue-400/70 not-prose">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1 my-1.5 pl-3 sm:pl-4 list-decimal marker:text-blue-400/70 not-prose">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-[11.5px] sm:text-xs text-slate-300 leading-snug pl-0.5">
            {children}
          </li>
        ),
        p: ({ children }) => (
          <p className="text-[11.5px] sm:text-xs text-slate-300 leading-relaxed mb-1.5 last:mb-0">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),
        code: ({ children }) => (
          <code className="text-[11px] bg-slate-800/80 text-blue-300 px-1 py-0.5 rounded border border-white/5 font-mono">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
