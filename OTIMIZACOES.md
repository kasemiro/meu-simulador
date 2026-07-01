# Guia de Otimizações - Simulador de Concursos

Aproveite ao máximo seu simulador com essas otimizações de UX, performance e monetização.

---

## 1. Otimizações de UX

### A. Onboarding Melhorado

Adicione uma modal de boas-vindas:

```tsx
// components/WelcomeModal.tsx
export default function WelcomeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Simulador!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Escolha uma categoria e estude com questões geradas por IA.
        </p>
        <button onClick={onClose} className="btn-primary w-full">
          Começar a Estudar
        </button>
      </div>
    </div>
  );
}
```

### B. Histórico de Simulados

Armazene em localStorage (ou banco de dados):

```tsx
const saveSimulado = (resultado: {
  categoria: string;
  acertos: number;
  total: number;
  data: string;
}) => {
  const historico = JSON.parse(localStorage.getItem('simulados') || '[]');
  historico.push(resultado);
  localStorage.setItem('simulados', JSON.stringify(historico.slice(-10)));
};
```

### C. Recomendações Personalizadas

```tsx
const getRecommendations = (history: Simulado[]): string[] => {
  const weak = history
    .filter(s => s.acertos / s.total < 0.7)
    .map(s => s.categoria);
  return [...new Set(weak)];
};
```

### D. Badges e Conquistas

```tsx
const achievements = [
  { nome: 'Primeiro Passo', condicao: () => true },
  { nome: 'Perfeição', condicao: (s) => s.acertos === s.total },
  { nome: 'Maratonista', condicao: () => simulados.length >= 10 },
];
```

---

## 2. Otimizações de Performance

### A. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/simulador-hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

### B. Code Splitting

```tsx
import dynamic from 'next/dynamic';

const ExpensiveComponent = dynamic(
  () => import('./ExpensiveComponent'),
  { loading: () => <div>Carregando...</div> }
);
```

### C. Memoization

```tsx
import { memo } from 'react';

const QuestionCard = memo(({ question, onAnswer }) => {
  return (/* ... */);
});
```

### D. Lazy Load Ads

```tsx
// Carregue anúncios apenas quando visíveis
<IntersectionObserver>
  <AdSpace type="sidebar" />
</IntersectionObserver>
```

---

## 3. Otimizações de Monetização

### A. Estratégia de Ads

**Posicionamento**: 
- Topo: 60% de visibilidade
- Sidebar: 80% de visibilidade  
- Resultado: 100% de visibilidade

**Dica**: Anúncios na seção de resultado têm CTR 3x maior

### B. Aumentar Receita

```
1. Aumentar tráfego
   - SEO: Otimize para "simulador concursos"
   - Social: Compartilhe no LinkedIn, Twitter
   - Referral: Sistema de indicação

2. Aumentar CTR
   - Teste posições diferentes
   - Cores de anúncios contrastantes
   - Contexto relevante
   
3. Aumentar CPM
   - Tráfego de países tier-1 (EUA, UK, AUS)
   - Conteúdo premium
   - Público profissional/educativo
```

### C. Alternativas Google AdSense

Se quiser diversificar:

```
- **Mediavine**: >50k/mês (3-8x melhor CPM)
- **AdThrive**: >100k/mês (4-10x melhor CPM)
- **Affiliate**: Links para cursos preparatórios
- **Stripe**: Venda conteúdo premium
```

---

## 4. Otimizações de SEO

### A. Meta Tags

```tsx
export const metadata: Metadata = {
  title: 'Simulador de Concursos Públicos - Questões com IA',
  description: 'Prepare-se com questões geradas por IA...',
  keywords: [
    'simulador concursos',
    'questões concurso',
    'estudo concursos',
    'prova simulada'
  ],
  openGraph: {
    title: 'Simulador de Concursos com IA',
    description: '...',
    type: 'website',
    url: 'https://seu-dominio.com',
    images: [{
      url: 'https://seu-dominio.com/og-image.jpg',
      width: 1200,
      height: 630,
    }],
  },
};
```

### B. Estruturado (Schema)

```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Simulador de Concursos",
  "applicationCategory": "EducationalApplication",
  "description": "App para praticar concursos",
  "url": "https://seu-dominio.com",
  "ratingCount": "1000",
  "ratingValue": "4.8"
})}
</script>
```

### C. Sitemap

```txt
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seu-dominio.com/</loc>
    <lastmod>2026-07-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### D. Robots.txt

```txt
<!-- public/robots.txt -->
User-agent: *
Allow: /
Sitemap: https://seu-dominio.com/sitemap.xml
```

---

## 5. Otimizações de Retenção

### A. Push Notifications

```tsx
// Se PWA
if ('serviceWorker' in navigator) {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('Pratique mais!', {
        body: 'Seu simulado de hoje está aguardando'
      });
    }
  });
}
```

### B. Email Newsletter

Collect emails e envie:
- Novas categorias
- Tips de estudo
- Resultados semanais

### C. Gamification

```tsx
const stats = {
  sequenciaAtual: 5,
  diasSeguidos: 12,
  questoesResolvidas: 345,
  pontos: 8750,
};
```

---

## 6. Otimizações de Segurança

### A. Rate Limiting

```tsx
// Use no API se criado
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

const { success } = await ratelimit.limit('user-id');
```

### B. CORS

```tsx
// next.config.js
async headers() {
  return [{
    source: '/api/(.*)',
    headers: [{
      key: 'Access-Control-Allow-Origin',
      value: process.env.ALLOWED_ORIGIN || '*',
    }],
  }];
}
```

### C. CSRF Protection

```tsx
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

// Use em formulários
<input type="hidden" name="_csrf" value={csrfToken} />
```

---

## 7. Otimizações de Analytics

### A. Google Analytics Avançado

```tsx
gtag('event', 'simulado_concluido', {
  evento_categoria: 'simulador',
  evento_label: 'português',
  acertos: 35,
  total: 40,
  tempo: 1800,
});
```

### B. Funnel Analytics

```
1. Visitantes: 1000
2. Clicam em começar: 600 (60%)
3. Selecionam categoria: 400 (40%)
4. Começam simulado: 350 (35%)
5. Completam simulado: 300 (30%)
```

### C. Heatmap

Instale Hotjar para ver:
- Onde usuários clicam
- Como fazem scroll
- Onde desistem

---

## 8. Otimizações Mobile

### A. App Shell

```tsx
// PWA básico
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### B. Responsive Images

```tsx
<picture>
  <source media="(max-width: 600px)" srcSet="small.jpg" />
  <source media="(max-width: 1200px)" srcSet="medium.jpg" />
  <img src="large.jpg" alt="..." />
</picture>
```

### C. Touch-Friendly

```css
button, input, textarea {
  min-height: 44px; /* Apple guideline */
  min-width: 44px;
  padding: 12px;
}
```

---

## 9. Otimizações de Conversão

### A. CTA Clara

```tsx
<button className="btn-accent text-lg py-4 px-8">
  ✅ Começar Simulado Agora
</button>
```

### B. Social Proof

```tsx
<div className="flex items-center gap-2 text-sm">
  <div className="flex gap-1">
    {'⭐⭐⭐⭐⭐'} {/* 5 stars */}
  </div>
  <span>4.8/5 de 1,234 avaliações</span>
</div>
```

### C. Urgência

```tsx
<div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
  ⏰ 50 questões adicionadas esta semana!
</div>
```

---

## 10. Checklist de Otimização

### Curto Prazo (1-2 semanas)
- [ ] Google AdSense integrado
- [ ] Google Analytics configurado
- [ ] SEO básico (meta tags, schema)
- [ ] Histórico local de simulados

### Médio Prazo (1-2 meses)
- [ ] PWA/app shell
- [ ] Email newsletter
- [ ] Heatmap analytics
- [ ] A/B testes de ads

### Longo Prazo (3-6 meses)
- [ ] Database real (histórico)
- [ ] Sistema de login
- [ ] Leaderboard
- [ ] Conteúdo premium
- [ ] Alternativas ad networks

---

## Métricas Importantes

Monitore essas KPIs:

```
UX:
- Session Duration: > 5 min
- Bounce Rate: < 50%
- Pages/Session: > 2

Negócio:
- Revenue/Visitor: > $0.01
- CPM: $5-15 (AdSense típico)
- CTR: 1-3%

Performance:
- LCP: < 2.5s
- INP: < 200ms
- CLS: < 0.1
```

---

## Recursos Úteis

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/) - Performance
- [Ahrefs](https://ahrefs.com/) - SEO
- [Hotjar](https://www.hotjar.com/) - User behavior
- [Vercel Analytics](https://vercel.com/analytics)

---

## Conclusão

Aplique essas otimizações progressivamente. Comece com as que geram mais impacto (Google AdSense, Analytics, SEO básico) e depois explore as outras conforme seu site cresce.

**Dica de Ouro**: Dados guiam decisões. Sempre meça antes de otimizar.

Happy optimizing! 📊🚀
