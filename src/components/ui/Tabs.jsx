import "./Tabs.css";

/**
 * @param {{key: string, label: string, icon?: any}[]} items
 */
export default function Tabs({ items, activeKey, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={isActive}
            className={`tabs__item${isActive ? " tabs__item--active" : ""}`}
            onClick={() => onChange(item.key)}
          >
            {Icon && <Icon size={15} strokeWidth={2.25} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
