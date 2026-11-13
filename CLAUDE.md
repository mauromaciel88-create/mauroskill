# Mauro AI Video Studio — regras do projeto

## Contexto
Estúdio modular de produção audiovisual com IA. O dono trabalha **só pelo celular Android**:
tudo roda na nuvem; ele conversa, revisa prévias e aprova. Nunca peça para instalar nada localmente.

## Idioma
- Conversa, documentação, roteiros, textos de vídeo e legendas: **português do Brasil**.
- Código e nomes de arquivo: identificadores técnicos podem ser em inglês; comentários em português.
- Locale de formatação: `pt-BR` (ex.: `R$ 1.250.000,00`).

## Formatos de saída
Todo vídeo sai em **9:16 (1080x1920, Reels/Shorts)** e **16:9 (1920x1080, YouTube)** a partir do
**mesmo storyboard**. Storyboard não guarda pixels; cenas são responsivas e respeitam safe zones.

## Princípios
1. Vídeo como código: cena = HTML determinístico (relógio controlado por `window.__seek(t)`).
2. Storyboard JSON é o contrato entre Video Director e Skills (`core/schema/storyboard.schema.json`).
3. Uma Skill por vez: implementar → renderizar de verdade → mostrar prévia → aguardar aprovação.
4. Mapas, fontes e bibliotecas ficam **no repositório** (rede da nuvem é restrita).
5. Voz atrás de interface (`core/tts`): trocar de motor não altera as Skills.
6. Explicar decisões técnicas em português: o dono quer aprender.

## Git
Desenvolver na branch indicada pela sessão. Commits pequenos. Não abrir PR sem pedido.
