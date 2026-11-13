#!/usr/bin/env python3
"""Interface única de voz. Gera WAV + tempo de cada palavra (JSON).

Uso: tts.py --text "..." --out voz.wav --words voz.json [--engine auto|edge|espeak] [--voice pt-BR-FranciscaNeural]
Por quê: as Skills nunca falam com um motor específico; trocar de motor = trocar um argumento.
"""
import argparse, asyncio, json, subprocess, sys, wave

def duracao_wav(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()

def estimar_palavras(texto, dur):
    """Distribui o tempo pelas palavras proporcional ao tamanho (usado quando o motor não informa)."""
    ps = texto.split()
    pesos = [len(p) + 2 for p in ps]
    total, t, out = sum(pesos), 0.0, []
    for p, w in zip(ps, pesos):
        d = dur * w / total
        out.append({"palavra": p, "inicio": round(t, 3), "fim": round(t + d, 3)})
        t += d
    return out

def espeak(texto, out):
    subprocess.run(["espeak-ng", "-v", "pt-br", "-s", "150", "-w", out, texto], check=True)
    dur = duracao_wav(out)
    return dur, estimar_palavras(texto, dur)

def edge(texto, out, voz):
    import edge_tts  # pip install edge-tts (exige acesso a speech.platform.bing.com)
    mp3 = out + ".mp3"
    palavras = []
    async def run():
        com = edge_tts.Communicate(texto, voz, boundary="WordBoundary")
        with open(mp3, "wb") as f:
            async for ch in com.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    i = ch["offset"] / 1e7
                    palavras.append({"palavra": ch["text"], "inicio": round(i, 3),
                                     "fim": round(i + ch["duration"] / 1e7, 3)})
    asyncio.run(run())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-ar", "44100", out], check=True)
    return duracao_wav(out), palavras

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--words", required=True)
    ap.add_argument("--engine", default="auto", choices=["auto", "edge", "espeak"])
    ap.add_argument("--voice", default="pt-BR-FranciscaNeural")
    a = ap.parse_args()
    motor = a.engine
    if motor in ("auto", "edge"):
        try:
            dur, pal = edge(a.text, a.out, a.voice); motor = "edge"
        except Exception as e:
            if a.engine == "edge":
                sys.exit(f"Edge TTS indisponível: {e}")
            print(f"[tts] Edge indisponível ({type(e).__name__}); usando espeak-ng", file=sys.stderr)
            motor = "espeak"
    if motor == "espeak":
        dur, pal = espeak(a.text, a.out)
    json.dump({"motor": motor, "duracao": dur, "palavras": pal}, open(a.words, "w"), ensure_ascii=False, indent=1)
    print(f"[tts] motor={motor} duracao={dur:.2f}s palavras={len(pal)}")

if __name__ == "__main__":
    main()
