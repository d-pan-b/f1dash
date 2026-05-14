/** Curated livery ranges — each lap picks one range, then randomizes inside it. */
export type CarLivery = {
  main: string
  accent: string
  rim: string
  sidepod: string
}

const RANGES: { pick: () => CarLivery }[] = [
  {
    pick: () => {
      const h = 0 + Math.random() * 18
      const s = 82 + Math.random() * 16
      const mainL = 12 + Math.random() * 8
      return {
        main: hsl(220, 14, mainL + 6),
        accent: hsl(h, s, 48 + Math.random() * 12),
        rim: hsl(220, 8, 58 + Math.random() * 15),
        sidepod: hsl(220, 16, 8 + Math.random() * 5),
      }
    },
  },
  {
    pick: () => {
      const h = 168 + Math.random() * 28
      return {
        main: hsl(210, 18, 14 + Math.random() * 6),
        accent: hsl(h, 70 + Math.random() * 22, 42 + Math.random() * 14),
        rim: hsl(195, 12, 52 + Math.random() * 18),
        sidepod: hsl(200, 22, 9 + Math.random() * 5),
      }
    },
  },
  {
    pick: () => {
      const h = 248 + Math.random() * 35
      return {
        main: hsl(230, 16, 13 + Math.random() * 7),
        accent: hsl(h, 62 + Math.random() * 25, 55 + Math.random() * 12),
        rim: hsl(260, 10, 62 + Math.random() * 12),
        sidepod: hsl(240, 20, 8 + Math.random() * 5),
      }
    },
  },
  {
    pick: () => {
      const h = 38 + Math.random() * 28
      return {
        main: hsl(215, 12, 14 + Math.random() * 6),
        accent: hsl(h, 88 + Math.random() * 12, 48 + Math.random() * 14),
        rim: hsl(35, 25, 58 + Math.random() * 14),
        sidepod: hsl(25, 18, 10 + Math.random() * 4),
      }
    },
  },
  {
    pick: () => {
      const accentHue = Math.random() < 0.5 ? 0 + Math.random() * 25 : 155 + Math.random() * 20
      return {
        main: hsl(220, 8, 18 + Math.random() * 10),
        accent: hsl(accentHue, 55 + Math.random() * 30, 52 + Math.random() * 12),
        rim: hsl(220, 4, 48 + Math.random() * 22),
        sidepod: hsl(220, 10, 9 + Math.random() * 6),
      }
    },
  },
]

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`
}

export function randomLivery(): CarLivery {
  const range = RANGES[Math.floor(Math.random() * RANGES.length)]!
  return range.pick()
}
