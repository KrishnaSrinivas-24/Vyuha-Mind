export function Panel({ children, className = '', padding = true }) {
  return (
    <div className={`card ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  );
}
