import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定義標題樣式
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          // 自定義段落樣式
          p: ({ children }) => (
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 leading-relaxed font-medium">
              {children}
            </p>
          ),
          // 自定義列表樣式
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              {children}
            </li>
          ),
          // 自定義強調樣式
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-900 dark:text-gray-100 font-medium">
              {children}
            </em>
          ),
          // 自定義代碼樣式
          code: ({ children }) => (
            <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          // 自定義引用樣式
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 dark:border-blue-800 pl-3 py-1 mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-r">
              {children}
            </blockquote>
          ),
          // 自定義表格樣式
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
              {children}
            </td>
          ),
          // 自定義分隔線
          hr: () => (
            <hr className="border-gray-200 dark:border-gray-700 my-3" />
          ),
          // 自定義鏈接樣式
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
