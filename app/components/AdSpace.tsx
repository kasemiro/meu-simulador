'use client';

interface AdSpaceProps {
  type: 'top' | 'sidebar' | 'bottom';
  className?: string;
  adSlot?: string;
}

export default function AdSpace({ type, className = '', adSlot }: AdSpaceProps) {
  const getAdConfig = () => {
    switch (type) {
      case 'top':
        return {
          width: '100%',
          height: '90px',
          label: 'Banner Superior (728x90 ou 970x90)',
          containerClass: 'w-full h-24',
          style: { display: 'block', minHeight: '90px' }
        };
      case 'sidebar':
        return {
          width: '300px',
          height: '600px',
          label: 'Sidebar (300x600 ou 300x1000)',
          containerClass: 'w-full h-96',
          style: { display: 'block', minHeight: '600px' }
        };
      case 'bottom':
        return {
          width: '100%',
          height: '250px',
          label: 'Resultado (970x250)',
          containerClass: 'w-full h-64',
          style: { display: 'block', minHeight: '250px' }
        };
    }
  };

  const config = getAdConfig();
  const hasAdSlot = !!adSlot;

  return (
    <div className={`${config.containerClass} bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center p-4 ${className}`}>
      {hasAdSlot ? (
        // Se tiver ad-slot do Google AdSense, renderize o anúncio
        <ins
          className="adsbygoogle"
          style={config.style}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Se não tiver, mostre placeholder
        <div className="text-center">
          <div className="text-3xl mb-2">📢</div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Publicidade - {config.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
            Google AdSense ou publicidade customizada
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            {`${config.width} x ${config.height}`}
          </p>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            <a href="/GUIA_ADSENSE.md" className="hover:underline">
              Ver guia de integração →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
