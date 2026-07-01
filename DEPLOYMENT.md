# Guia de Deploy - Simulador de Concursos

## Deploy no Vercel (Recomendado)

O seu projeto está já configurado para fazer deploy direto no Vercel. Siga os passos abaixo:

### 1. Preparar para Deploy

```bash
# Instale as dependências (se ainda não fez)
npm install

# Teste localmente
npm run dev

# Build de produção
npm run build
```

### 2. Deploy via GitHub

Se seu projeto está no GitHub:

1. Acesse https://vercel.com/new
2. Importe seu repositório GitHub
3. Clique em "Import"
4. Vercel detectará automaticamente Next.js
5. Clique em "Deploy"
6. Seu site estará live em alguns segundos!

### 3. Deploy via CLI do Vercel

```bash
# Instale o Vercel CLI globalmente
npm install -g vercel

# Faça login
vercel login

# Deploy
vercel

# Deploy para produção (sem confirmação)
vercel --prod
```

### 4. Configurar Variáveis de Ambiente

Se precisar adicionar variáveis de ambiente (para Google AdSense):

1. Acesse seu projeto no Vercel Dashboard
2. Vá para "Settings" → "Environment Variables"
3. Adicione suas variáveis

```
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

---

## Configurações Essenciais

### next.config.js

O arquivo `next.config.js` já está configurado com as melhores práticas:

```javascript
{
  reactStrictMode: true,
  swcMinify: true,
}
```

### Environment Variables

Crie um arquivo `.env.local` na raiz do projeto para desenvolvimento:

```
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
```

---

## Domínio Customizado

Depois de fazer deploy no Vercel:

1. Acesse seu projeto no Vercel Dashboard
2. Vá para "Settings" → "Domains"
3. Clique em "Add"
4. Escolha um dos domínios disponíveis ou use seu próprio
5. Configure DNS se necessário

---

## Pré-requisitos antes de fazer deploy

- [ ] Google AdSense integrado (opcional, mas recomendado)
- [ ] Variáveis de ambiente configuradas
- [ ] Conteúdo das categorias revisar e atualizar
- [ ] Meta tags e SEO reviados em `layout.tsx`
- [ ] Testes em mobile e desktop realizados
- [ ] Analytics configurado (Google Analytics)

---

## Monitoramento pós-Deploy

### Google Analytics

1. Crie uma conta em https://analytics.google.com
2. Copie seu ID de rastreamento (GA ID)
3. Adicione em `layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Search Console

1. Acesse https://search.google.com/search-console
2. Adicione seu domínio
3. Verifique a propriedade
4. Monitore índice e performance

### Google AdSense

1. Acesse https://adsense.google.com
2. Monitore ganhos e cliques
3. Ajuste placements conforme necessário

---

## Troubleshooting

### Build falha localmente

```bash
# Limpe cache
rm -rf .next
rm -rf node_modules

# Reinstale
npm install

# Tente novamente
npm run build
```

### Erro de versão do Node

```bash
# Verifique sua versão
node --version

# Recomendado: Node 18.17 ou superior
# Atualize se necessário
```

### Porta 3000 em uso

```bash
# Mate o processo
lsof -i :3000
kill -9 <PID>

# Ou use porta diferente
npm run dev -- -p 3001
```

---

## Performance

### Otimizações incluídas

- Image optimization automática
- Code splitting automático
- Minificação de CSS e JavaScript
- Compressão Gzip
- Server-side rendering (SSR)

### Métricas esperadas

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Testar Performance

```bash
npm run build
npm run start

# Testar com Lighthouse (Chrome DevTools)
# DevTools → Lighthouse → Analyze page load
```

---

## Segurança

### Best Practices

- [x] HTTPS forçado (automático no Vercel)
- [x] Content Security Policy (recomendado adicionar)
- [x] Headers de segurança (recomendado adicionar)
- [x] Proteção contra XSS (Next.js nativo)
- [x] Proteção contra CSRF (implementar se usar forms)

### Adicionar Headers de Segurança

No arquivo `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ],
    },
  ];
}
```

---

## Backup e Versionamento

### Git

```bash
# Commit suas mudanças
git add .
git commit -m "feat: melhorias de UX e publicidade"

# Push para main
git push origin main
```

### Vercel Deployments

Vercel mantém histórico automático:
- Acesse "Deployments" no Vercel Dashboard
- Veja histórico de todos os deploys
- Faça rollback com um clique se necessário

---

## Próximos Passos

1. **Deploy**: Siga os passos acima
2. **Google AdSense**: Configure conforme o guia
3. **Analytics**: Monitore usuários e tráfego
4. **Feedback**: Colete feedback dos usuários
5. **Otimização**: Melhore continuamente

---

## Suporte

Para dúvidas:

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Google AdSense Support](https://support.google.com/adsense)
- [Stack Overflow](https://stackoverflow.com) - tags: nextjs, vercel

---

## Resumo Rápido

```bash
# 1. Testar localmente
npm run dev

# 2. Build
npm run build

# 3. Deploy Vercel CLI
npm install -g vercel
vercel --prod
```

Pronto! Seu simulador estará live em minutos.

Good luck! 🚀
