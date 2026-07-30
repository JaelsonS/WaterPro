# WaterPro — Site Demo de Apresentação

> **Site demonstrativo** desenvolvido para apresentação comercial à empresa **Water Pro** (waterpro.pt).  
> **Demo online:** [https://waterpro-chi.vercel.app](https://waterpro-chi.vercel.app)

---

## Sobre este projeto

Este repositório contém uma **proposta de website premium** para a Water Pro — empresa portuguesa especializada em soluções de purificação, bem-estar e sustentabilidade da água.

O objetivo não é substituir o site em produção de imediato, mas **demonstrar o potencial** de uma experiência digital moderna: narrativa cinematográfica, catálogo completo de produtos, integração WhatsApp, assistente virtual **Gui**, bilíngue PT/EN e SEO técnico.

### Desenvolvido por

**[AfDigital – Soluções Tecnológicas](https://www.afdigitalweb.com)**

---

## Tecnologias utilizadas

| Tecnologia | Função |
|------------|--------|
| **Next.js 15** | Framework React com App Router, SSG e otimização SEO |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Tailwind CSS 4** | Design system e estilos utilitários |
| **next-intl** | Internacionalização PT / EN |
| **GSAP + ScrollTrigger** | Animações cinematográficas ao scroll |
| **Lenis** | Smooth scroll premium |
| **Three.js / React Three Fiber** | Elementos 3D (quando ativos) |
| **Vercel** | Deploy e hosting recomendado |

---

## Pré-requisitos

Antes de começar, certifique-se de que tem instalado:

- **Node.js** 20 ou superior ([nodejs.org](https://nodejs.org))
- **npm** (incluído com o Node.js)

Para verificar:

```bash
node -v   # deve mostrar v20.x ou superior
npm -v
```

---

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd WaterPro
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Abra o browser em **[http://localhost:3000](http://localhost:3000)**

> **Dica:** Se aparecer erro de cache (`vendor-chunks`, módulos em falta), use:
> ```bash
> npm run dev:clean
> ```
> Isto limpa a pasta `.next` e reinicia o servidor.

### 4. Build de produção (opcional, para testar antes do deploy)

```bash
npm run build
npm start
```

O site ficará disponível em `http://localhost:3000` em modo produção.

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run dev:clean` | Limpa cache `.next` e inicia dev |
| `npm run build` | Gera build de produção (143+ páginas estáticas) |
| `npm start` | Serve o build de produção |
| `npm run lint` | Verifica erros ESLint |

---

## Estrutura do site

### Páginas principais

| Rota | Descrição |
|------|-----------|
| `/` | Homepage cinematográfica (capítulos narrativos) |
| `/sobre` | História da empresa, missão, visão e valores |
| `/para-sua-casa` | Catálogo residencial |
| `/para-a-sua-empresa` | Catálogo empresarial |
| `/para-sua-casa/[slug]` | Detalhe de produto residencial |
| `/para-a-sua-empresa/[slug]` | Detalhe de produto empresarial |

### Homepage — capítulos

1. **Hero** — Carrossel de produtos reais + CTA
2. **Famílias** — Produtos clicáveis com link para detalhe
3. **O problema** — Estatísticas sobre qualidade da água
4. **Torneira** — Vídeo de água cristalina
5. **Vídeo narrativo** — Transição cinematográfica
6. **Consequências** — Impacto da água não tratada
7. **Ciência** — Timeline técnica
8. **Soluções** — Residencial vs empresarial
9. **Testemunhos** — Prova social
10. **Confiança** — FAQ e certificações
11. **O convite** — Formulário + mapa + contacto

### Funcionalidades

- Assistente virtual **Gui** (fluxos prontos → WhatsApp)
- Integração WhatsApp em cada produto
- Bilíngue PT / EN com `next-intl`
- SEO: sitemap, robots, Schema.org, Open Graph
- Efeito de água nas margens ao scroll
- Imagens reais dos produtos waterpro.pt

---

## Deploy na Vercel

1. Faça push do código para GitHub
2. Importe o repositório em [vercel.com](https://vercel.com)
3. Framework preset: **Next.js** (detetado automaticamente)
4. Clique em **Deploy**

Após o deploy, o site fica disponível em [https://waterpro-chi.vercel.app](https://waterpro-chi.vercel.app).

---

## Estrutura de pastas

```
src/
├── app/[locale]/          # Rotas (homepage, catálogos, sobre)
├── components/
│   ├── chapters/          # Secções da homepage
│   ├── layout/            # Header, Footer
│   ├── products/          # Catálogo e detalhe
│   └── ui/                # Componentes reutilizáveis
├── data/                  # Produtos (JSON scraped)
├── i18n/                  # Configuração de idiomas
├── lib/                   # Config, SEO, media, utils
messages/                  # Traduções PT e EN
public/                    # Assets estáticos
```

---

## Notas importantes

- Este é um **site demo** — alguns dados (NIF, morada exata) podem ser placeholders
- O formulário de contacto é **front-end only** (não envia email real sem backend)
- Imagens de produtos são carregadas de `waterpro.pt` (CDN externo)
- Vídeos de stock via Pexels (URLs verificadas)

---

## Licença e propriedade

Código e design desenvolvidos por **AfDigital – Soluções Tecnológicas** para apresentação à **Water Pro**.

Conteúdos de marca, produtos e imagens pertencem à Water Pro / waterpro.pt.

---

**AfDigital – Soluções Tecnológicas** · [www.afdigitalweb.com](https://www.afdigitalweb.com)
