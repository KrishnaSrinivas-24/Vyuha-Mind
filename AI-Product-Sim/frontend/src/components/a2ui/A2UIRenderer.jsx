import { Zap, AlertTriangle, TrendingDown, TrendingUp, DollarSign, Info } from 'lucide-react';

/**
 * A2UI Renderer – Declarative JSON → React Component Catalog
 * 
 * Agents push structured JSON describing UI widgets, and this
 * renderer converts them into safe, interactive React components.
 * No raw HTML/JS is ever executed — only catalog components.
 */

const CATALOG = {
  Text: ({ content, variant = 'body' }) => {
    const styles = {
      heading: 'text-lg font-semibold text-text-main',
      body: 'text-sm text-text-muted',
      caption: 'text-xs text-text-faint font-mono',
      danger: 'text-sm text-danger font-medium',
      success: 'text-sm text-success font-medium',
    };
    return <p className={styles[variant] || styles.body}>{content}</p>;
  },

  Button: ({ label, variant = 'primary', onClick }) => {
    const styles = {
      primary: 'neo-btn bg-primary text-white hover:bg-primary-light',
      danger: 'neo-btn bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
      success: 'neo-btn bg-success/20 text-success border border-success/30 hover:bg-success/30',
      ghost: 'neo-btn bg-surface-raised text-text-muted border border-border hover:text-text-main',
    };
    return (
      <button className={`${styles[variant] || styles.primary} px-4 py-2 text-sm rounded-lg`} onClick={onClick}>
        {variant === 'danger' && <AlertTriangle size={14} />}
        {variant === 'success' && <Zap size={14} />}
        {label}
      </button>
    );
  },

  Slider: ({ label, value, min = 0, max = 100, onChange }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <span className="text-sm font-mono text-text-main">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full"
      />
    </div>
  ),

  MetricCard: ({ label, value, trend, status = 'neutral' }) => {
    const borderColor = {
      danger: 'border-danger/40',
      warning: 'border-warning/40',
      success: 'border-success/40',
      neutral: 'border-border',
    };
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
    const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-faint';

    return (
      <div className={`glass-card p-4 border ${borderColor[status]}`}>
        <div className="text-[10px] font-mono text-text-faint uppercase mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-mono text-text-main">{value}</span>
          {TrendIcon && <TrendIcon size={14} className={trendColor} />}
        </div>
      </div>
    );
  },

  AlertBanner: ({ title, message, severity = 'info' }) => {
    const styles = {
      info: { bg: 'bg-accent/10 border-accent/20', icon: Info, color: 'text-accent' },
      warning: { bg: 'bg-warning/10 border-warning/20', icon: AlertTriangle, color: 'text-warning' },
      danger: { bg: 'bg-danger/10 border-danger/20', icon: AlertTriangle, color: 'text-danger' },
      success: { bg: 'bg-success/10 border-success/20', icon: Zap, color: 'text-success' },
    };
    const s = styles[severity] || styles.info;

    return (
      <div className={`${s.bg} border rounded-lg p-4 flex items-start gap-3`}>
        <s.icon size={16} className={`${s.color} mt-0.5 shrink-0`} />
        <div>
          {title && <div className={`text-sm font-semibold ${s.color} mb-1`}>{title}</div>}
          <div className="text-xs text-text-muted">{message}</div>
        </div>
      </div>
    );
  },

  Row: ({ children }) => (
    <div className="flex items-center gap-3 flex-wrap">{children}</div>
  ),

  Column: ({ children }) => (
    <div className="flex flex-col gap-3">{children}</div>
  ),
};

/**
 * Renders a tree of A2UI components from a JSON schema.
 * 
 * Example schema:
 * {
 *   type: 'Column',
 *   children: [
 *     { type: 'AlertBanner', props: { title: 'Crisis!', message: '...', severity: 'danger' } },
 *     { type: 'Row', children: [
 *       { type: 'Button', props: { label: 'Apply 20% Discount', variant: 'success' } },
 *       { type: 'Button', props: { label: 'Ignore', variant: 'ghost' } },
 *     ]},
 *   ]
 * }
 */
export function A2UIRenderer({ schema, onAction }) {
  if (!schema) return null;

  const renderNode = (node, index = 0) => {
    if (!node || !node.type) return null;

    const Component = CATALOG[node.type];
    if (!Component) {
      console.warn(`[A2UI] Unknown component type: ${node.type}`);
      return null;
    }

    const nodeKey = `a2ui-${index}`;
    const props = { ...(node.props || {}) };

    // Wire onClick to onAction callback
    if (node.props?.actionId && onAction) {
      props.onClick = () => onAction(node.props.actionId, node.props);
    }

    // Render children recursively for layout components
    if (node.children && Array.isArray(node.children)) {
      return (
        <Component key={nodeKey} {...props}>
          {node.children.map((child, i) => renderNode(child, `${index}-${i}`))}
        </Component>
      );
    }

    return <Component key={nodeKey} {...props} />;
  };

  return (
    <div className="a2ui-root flex flex-col gap-3 animate-data-flow">
      {Array.isArray(schema) ? (
        schema.map((node, i) => renderNode(node, i))
      ) : (
        renderNode(schema)
      )}
    </div>
  );
}

/**
 * Generates a crisis recommendation A2UI schema.
 * Called by the simulation context when crisis is detected.
 */
export function generateCrisisA2UI(crisisIntensity, onAction) {
  if (crisisIntensity < 0.3) return null;

  const schema = {
    type: 'Column',
    children: [
      {
        type: 'AlertBanner',
        props: {
          title: '⚠ Crisis Detected — Agent Network Alert',
          message: `Supply chain disruption at ${Math.round(crisisIntensity * 100)}%. Consumer agents entering survival mode. Immediate strategic pivot recommended.`,
          severity: 'danger',
        },
      },
      {
        type: 'Row',
        children: [
          {
            type: 'Button',
            props: {
              label: '🔻 Apply 20% Emergency Discount',
              variant: 'success',
              actionId: 'emergency_discount',
            },
          },
          {
            type: 'Button',
            props: {
              label: 'Double Marketing Spend',
              variant: 'ghost',
              actionId: 'double_marketing',
            },
          },
        ],
      },
      {
        type: 'Row',
        children: [
          {
            type: 'MetricCard',
            props: { label: 'Fuel Index', value: `${Math.round(crisisIntensity * 100)}%`, trend: 'up', status: 'danger' },
          },
          {
            type: 'MetricCard',
            props: { label: 'Consumer Stress', value: `${Math.round(crisisIntensity * 87)}%`, trend: 'up', status: 'warning' },
          },
        ],
      },
    ],
  };

  return <A2UIRenderer schema={schema} onAction={onAction} />;
}
