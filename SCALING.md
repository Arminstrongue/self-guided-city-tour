# Preparado para 6+ milhões de viajantes por ano

## As contas

| | Valor |
|---|---|
| Viajantes por ano | 6 000 000 |
| Por dia (média) | ~16 400 |
| Hora de ponta (estimativa: 12% do dia) | ~2 000 viajantes |
| Pedidos por viajante numa visita | ~30 |
| Pedidos por segundo na hora de ponta | ~17 (média) · ~100 em picos curtos |

Margem de segurança: a arquitetura abaixo é dimensionada para **300 pedidos/segundo** (≈ 10× a ponta prevista), o objetivo do `scripts/loadtest.js`.

## Arquitetura

```
Viajante → Cloudflare (CDN, WAF, rate limiting, cache de estáticos)
         → Caddy (balanceador) → 2–4 réplicas da app Next.js (sem estado)
         → PostgreSQL (servidor dedicado ou gerido) + cópias diárias
```

- **App sem estado:** sessões em cookies assinados; qualquer réplica responde a qualquer pedido. Aumentar: `docker compose up -d --scale app=3`.
- **Cache em memória:** conteúdo das cidades e ofertas dos comerciantes (60 s), meteorologia (30 min), câmbio (6 h), estado do voo (10 min). A base de dados quase só é usada para compras, acessos e o painel.
- **Base de dados:** índices em todas as pesquisas frequentes (email do acesso, sessão Stripe, assinatura, comercial). `DB_POOL_MAX` por réplica (10) × réplicas ≤ `max_connections` (200). Acima de 4 réplicas, pôr PgBouncer à frente.
- **Pagamentos:** a Stripe aguenta o volume; os webhooks são idempotentes (cada sessão/fatura é registada uma vez, mesmo com repetições).
- **Limites de pedidos:** por IP nas APIs de compra, registo e voo; em produção, regra de rate limiting também na Cloudflare.
- **Saúde:** `/api/health` (balanceador, Docker e monitorização externa).
- **Offline:** o service worker guarda o roteiro no telemóvel, o que reduz pedidos repetidos.

## Servidores sugeridos (Hetzner)

| Fase | App | Base de dados | Custo aproximado/mês |
|---|---|---|---|
| Lançamento (< 500 mil/ano) | 1 × CX33 | no mesmo servidor | ~10 € |
| Crescimento (1–3 M/ano) | 2 × CX33 + Load Balancer LB11 | 1 × CCX13 dedicado | ~60 € |
| 6 M+/ano | 3–4 × CPX41 + LB11 | CCX23 + réplica de leitura | ~200 € |

## Mapas com milhões de utilizadores

Os mosaicos (tiles) gratuitos de tile.openstreetmap.org **não podem** ser usados em grande volume (política de utilização da OpenStreetMap). Antes do lançamento, defina `NEXT_PUBLIC_MAP_TILES` para um fornecedor:

- MapTiler, Stadia Maps ou Thunderforest (plano pago por pedidos), ou
- mosaicos próprios (Protomaps / PMTiles) servidos pela Cloudflare — custo quase zero a grande escala.

## Antes de cada grande campanha

1. `k6 run -e BASE=https://SEU_DOMINIO scripts/loadtest.js` (objetivo: < 1% de erros, p95 < 800 ms).
2. Confirmar alertas da monitorização e cópias de segurança.
3. Aumentar réplicas se a CPU média passar 60%.
