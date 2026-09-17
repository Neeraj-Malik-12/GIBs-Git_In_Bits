import { useState } from 'react';

interface LanguageConfig {
  icon: string;
  color: string;
}

export function getLanguageColor(language?: string | null): string {
  if (!language) return '#94a3b8';
  const cfg = LANGUAGE_CONFIG[language.toLowerCase().trim()];
  return cfg?.color ?? '#94a3b8';
}

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  javascript: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    color: '#f1e05a',
  },
  js: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    color: '#f1e05a',
  },
  typescript: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    color: '#3178c6',
  },
  ts: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    color: '#3178c6',
  },
  python: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: '#3572A5',
  },
  py: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: '#3572A5',
  },
  java: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    color: '#b07219',
  },
  css: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    color: '#563d7c',
  },
  html: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    color: '#e34c26',
  },
  'c++': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    color: '#f34b7d',
  },
  cpp: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    color: '#f34b7d',
  },
  'c#': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
    color: '#178600',
  },
  csharp: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
    color: '#178600',
  },
  c: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    color: '#555555',
  },
  go: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    color: '#00ADD8',
  },
  golang: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    color: '#00ADD8',
  },
  rust: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
    color: '#dea584',
  },
  ruby: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
    color: '#701516',
  },
  php: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    color: '#4F5D95',
  },
  kotlin: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    color: '#A97BFF',
  },
  swift: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
    color: '#F05138',
  },
  dart: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
    color: '#00B4AB',
  },
  shell: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
    color: '#89e051',
  },
  bash: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
    color: '#89e051',
  },
  dockerfile: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    color: '#384d54',
  },
  'jupyter notebook': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg',
    color: '#DA5B0B',
  },
  jupyter: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg',
    color: '#DA5B0B',
  },
  r: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg',
    color: '#198CE7',
  },
  scala: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg',
    color: '#c22d40',
  },
  vue: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    color: '#41b883',
  },
  svelte: {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
    color: '#ff3e00',
  },
};

interface LanguageBadgeProps {
  language?: string | null;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageBadge({
  language,
  showText = true,
  className = '',
  size = 'sm',
}: LanguageBadgeProps) {
  const [hasError, setHasError] = useState(false);

  if (!language) {
    return <span className="text-text-secondary text-xs">—</span>;
  }

  const key = language.toLowerCase().trim();
  const config = LANGUAGE_CONFIG[key];

  const iconSize =
    size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const dotSize =
    size === 'lg' ? 'w-3 h-3' : size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  const dotColor = config?.color || '#94a3b8';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {config?.icon && !hasError ? (
        <img
          src={config.icon}
          alt={language}
          className={`${iconSize} object-contain shrink-0 drop-shadow-sm`}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span
          className={`${dotSize} rounded-full shrink-0 shadow-sm`}
          style={{ backgroundColor: dotColor }}
        />
      )}
      {showText && (
        <span className="text-xs font-medium text-slate-200">{language}</span>
      )}
    </span>
  );
}
