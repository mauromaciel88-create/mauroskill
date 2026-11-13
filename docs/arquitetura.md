# Arquitetura — Mauro AI Video Studio

```
Briefing → Video Director → Storyboard (JSON, pt-BR, com narração)
        → TTS (áudio + tempo das palavras)
        → duração de cada cena = duração do áudio (+ respiro)
        → Render determinístico (Chromium/Playwright + ffmpeg) em 9:16 e 16:9
        → legendas + mixagem → video_9x16.mp4 + video_16x9.mp4
```

## Decisões (e por quê)
- **Vídeo como código (HTML/SVG/Canvas → MP4):** sem computador, só texto; reutilizável por template; versionável no Git.
- **Relógio controlado:** a cena expõe `window.__seek(t)`. O renderizador avança quadro a quadro e tira
  screenshots; não depende da velocidade da máquina, então o resultado é idêntico sempre.
- **Storyboard como contrato:** o Director não gera vídeo, gera cenas `{skill, duracao, narracao, params}`.
  Skill nova encaixa sem mexer nas outras.
- **Dois formatos, um storyboard:** cena responsiva (`data-format="9x16|16x9"`), renderizada duas vezes.
- **Core compartilhado:** tema, easing, legendas, render e TTS ficam em `core/`; Skills só trazem o que é específico.
- **Voz como interface:** `core/tts/tts.py --engine auto|edge|espeak`. Padrão desejado: Edge TTS (vozes neurais
  pt-BR). Reserva offline: espeak-ng (robótico, só para testes).

## Estrutura de uma Skill
```
skills/<nome>/
  SKILL.md      quando usar, parâmetros, como gerar a cena
  references/   referências visuais e técnicas
  templates/    HTML parametrizável
  examples/     storyboards de exemplo
  QUALITY.md    critérios de aceite (verificados em render real)
```
