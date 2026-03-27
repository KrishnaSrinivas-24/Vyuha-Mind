export function Panel({ children, className = '', padding = true }) {
  return (
    <div className={`neo-panel ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  );
}
