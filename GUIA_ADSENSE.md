# Guia de Integração Google AdSense

## Como integrar publicidade ao seu site

Este guia descreve como adicionar Google AdSense ou publicidade customizada ao Simulador de Concursos.

## 1. Google AdSense (Recomendado)

### Passo 1: Criar uma conta Google AdSense
1. Acesse [Google AdSense](https://www.google.com/adsense/start/)
2. Clique em "COMECE AGORA"
3. Entre com sua conta Google (crie uma se necessário)
4. Preencha o formulário com informações sobre seu site
5. Aceite os termos de serviço

### Passo 2: Aguardar aprovação
- Google levará 1-2 semanas para revisar seu site
- Você receberá um email confirmando a aprovação

### Passo 3: Adicionar código AdSense ao layout

No arquivo `app/layout.tsx`, adicione o script do AdSense na seção `<head>`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

**Substitua `ca-pub-XXXXXXXXXXXXXXXX` com seu Publisher ID do AdSense**

### Passo 4: Adicionar anúncios nas páginas

#### Banner no topo (728x90 ou 970x90)

```tsx
<div>
  <ins
    className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="0000000000"
    data-ad-format="horizontal"
  />
</div>

<Script id="adsense-banner">
  {`(adsbygoogle = window.adsbygoogle || []).push({});`}
</Script>
```

#### Sidebar (300x600 ou 300x1000)

```tsx
<div>
  <ins
    className="adsbygoogle"
    style={{ display: 'block', width: '300px', height: '600px' }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="0000000001"
    data-ad-format="vertical"
  />
</div>

<Script id="adsense-sidebar">
  {`(adsbygoogle = window.adsbygoogle || []).push({});`}
</Script>
```

#### Resultado (970x250)

```tsx
<div>
  <ins
    className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="0000000002"
    data-ad-format="horizontal"
  />
</div>

<Script id="adsense-result">
  {`(adsbygoogle = window.adsbygoogle || []).push({});`}
</Script>
```

## 2. Publicidade Customizada

Se quiser usar outro serviço de publicidade, edite o componente `AdSpace.tsx`:

```tsx
// app/components/AdSpace.tsx
export default function AdSpace({ type, className = '' }: AdSpaceProps) {
  // Para Google AdSense, retorne:
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={getSlotForType(type)}
        data-ad-format={getFormatForType(type)}
      />
    </div>
  );
}
```

## 3. Locais dos anúncios no site

### 🎯 Topo (Hero Section)
- Acima do formulário de categorias
- Tamanho: 728x90 ou 970x90

### 🎯 Sidebar (Tela Principal)
- Ao lado direito do formulário
- Tamanho: 300x600 ou 300x1000
- Sticky (acompanha o scroll)

### 🎯 Pós-Resultado
- Abaixo do resultado final, antes do gabarito
- Tamanho: 970x250

## 4. Melhores práticas

✅ **Faça:**
- Posicione anúncios estrategicamente sem prejudicar a UX
- Use o componente `AdSpace` para padronização
- Teste os anúncios em diferentes dispositivos
- Monitore o desempenho no Google AdSense

❌ **Evite:**
- Muitos anúncios na mesma página
- Anúncios que cobrem conteúdo importante
- Cliques forçados ou enganosos
- Violar os termos de serviço do Google

## 5. Monitoramento

Acesse seu painel AdSense em https://adsense.google.com para:
- Visualizar ganhos
- Monitorar cliques
- Analisar desempenho por página
- Ajustar placements

## 6. Alternativas ao Google AdSense

Se preferir outras plataformas:

- **Mediavine**: para tráfego acima de 50k/mês
- **AdThrive**: para tráfego acima de 100k/mês
- **PropellerAds**: para qualquer volume
- **Buysellads**: publicidade direta
- **Carbon Ads**: publicidade orientada ao nicho

## Dúvidas?

Consulte a documentação oficial do Google AdSense em https://support.google.com/adsense
