interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className={`${
            item.active 
              ? 'text-orange-600 dark:text-orange-400 font-semibold' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {item.label}
          </span>
          
          {index < items.length - 1 && (
            <span className="text-gray-400 dark:text-gray-600">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}
