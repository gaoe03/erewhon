/* ============================================================
   The ingredient drawing cabinet.
   Every icon is drawn in a 64×64 box with clean, bold shapes —
   the animated feTurbulence filter is what makes them wobble
   and look hand-drawn. Don't over-draw; the boil does the work.
   ============================================================ */

(function () {
  const C = {
    ink: '#2A2118',
    red: '#D8503C',
    pink: '#F2A7BB',
    blush: '#E87FA0',
    magenta: '#D9568C',
    yellow: '#F0C24F',
    orange: '#E8893D',
    peach: '#F0A284',
    green: '#5E8C4F',
    deep: '#3F6B4F',
    lime: '#A4BE6C',
    teal: '#5E9C8F',
    blue: '#4F7BC0',
    sky: '#A8C8E8',
    purple: '#7B5AA6',
    brown: '#8A5A3B',
    cocoa: '#5C4030',
    tan: '#D9B98C',
    wheat: '#C68A4F',
    cream: '#F6EDD8',
    white: '#FBF7EE',
  };

  // shared stroke shorthand
  const S = `stroke="${C.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const S2 = `stroke="${C.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const NS = 'stroke="none"';

  const ICONS = {

    strawberry: `
      <path d="M32 58 C16 50 10 34 16 26 C22 19 42 19 48 26 C54 34 48 50 32 58 Z" fill="${C.red}" ${S}/>
      <path d="M22 22 L27 11 L31 20 Z" fill="${C.green}" ${S}/>
      <path d="M33 20 L37 10 L42 22 Z" fill="${C.green}" ${S}/>
      <path d="M24 33 h.01 M32 36 h.01 M40 33 h.01 M28 45 h.01 M36 45 h.01 M32 50 h.01" stroke="${C.cream}" stroke-width="3.5" stroke-linecap="round"/>`,

    banana: `
      <path d="M14 14 C9 39 27 55 50 51 C56 50 56 44 50 43 C32 46 22 32 23 15 C23.5 9 14.5 8 14 14 Z" fill="${C.yellow}" ${S}/>
      <path d="M49 46 l3.5 -1" stroke="${C.cocoa}" stroke-width="4" stroke-linecap="round"/>
      <path d="M16 13 l1 -3.5" stroke="${C.cocoa}" stroke-width="4" stroke-linecap="round"/>`,

    mango: `
      <path d="M18 41 C13 27 27 13 40 15 C52 17 53 33 43 44 C34 53 22 53 18 41 Z" fill="${C.orange}" ${S}/>
      <path d="M38 19 C46 22 49 31 44 39" stroke="${C.red}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".65"/>
      <path d="M40 13 Q47 6 53 9 Q48 15 40 13 Z" fill="${C.green}" ${S}/>`,

    pineapple: `
      <path d="M24 23 L28 8 L32 20 L36 6 L40 23" fill="${C.green}" ${S}/>
      <ellipse cx="32" cy="40" rx="14" ry="17" fill="${C.yellow}" ${S}/>
      <path d="M24 31 l15 17 M21 40 l11 13 M40 31 l-15 17 M43 40 l-11 13" ${S2} fill="none"/>`,

    blueberry: `
      <circle cx="22" cy="41" r="8" fill="${C.blue}" ${S}/>
      <circle cx="41" cy="42" r="8" fill="${C.blue}" ${S}/>
      <circle cx="31" cy="25" r="8" fill="${C.blue}" ${S}/>
      <path d="M29 23 l4 4 M33 23 l-4 4" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M20 39 l4 4 M24 39 l-4 4" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M39 40 l4 4 M43 40 l-4 4" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>`,

    raspberry: `
      <path d="M32 17 C29 10 24 8 19 10 M32 17 C35 10 40 8 45 10" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="#D9568C" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round">
      <circle cx="25" cy="25" r="6.8"/>
      <circle cx="39" cy="25" r="6.8"/>
      <circle cx="32" cy="22" r="6.8"/>
      <circle cx="23" cy="35" r="6.8"/>
      <circle cx="41" cy="35" r="6.8"/>
      <circle cx="32" cy="34" r="7"/>
      <circle cx="28" cy="45" r="6"/>
      <circle cx="36" cy="45" r="6"/>
      <circle cx="32" cy="53" r="5.4"/>
      </g>`,

    cherry: `
      <path d="M24 36 C24 22 34 14 46 10" stroke="${C.deep}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M42 38 C40 26 42 18 46 10" stroke="${C.deep}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M46 10 Q56 8 58 16 Q50 18 46 10 Z" fill="${C.green}" ${S}/>
      <circle cx="23" cy="44" r="9" fill="${C.red}" ${S}/>
      <circle cx="42" cy="46" r="9" fill="${C.red}" ${S}/>`,

    date: `
      <path d="M24 14 C14 22 14 46 24 54 C30 58 36 58 42 52 C50 44 48 22 38 13 C33 9 28 10 24 14 Z" fill="${C.brown}" ${S}/>
      <path d="M26 20 C22 30 22 42 27 49 M36 17 C42 26 42 42 37 50" ${S2} fill="none" opacity=".5" stroke="${C.tan}"/>`,

    peach: `
      <circle cx="32" cy="38" r="17" fill="${C.peach}" ${S}/>
      <path d="M32 22 C27 30 27 46 32 54" ${S2} fill="none"/>
      <path d="M32 20 C32 14 34 12 37 10" stroke="${C.cocoa}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M36 14 Q45 8 50 13 Q44 19 36 14 Z" fill="${C.green}" ${S}/>`,

    dragonfruit: `
      <path d="M32 8 C16 8 8 20 8 34 C8 48 18 58 32 58 C46 58 56 48 56 34 C56 20 48 8 32 8 Z" fill="#D9568C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 16 C20 16 15 25 15 35 C15 46 23 52 32 52 C41 52 49 46 49 35 C49 25 44 16 32 16 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 26 h.01 M32 23 h.01 M40 26 h.01 M20 33 h.01 M28 31 h.01 M36 31 h.01 M44 33 h.01 M24 40 h.01 M32 38 h.01 M40 40 h.01 M28 47 h.01 M36 47 h.01 M32 30 h.01" stroke="#2A2118" stroke-width="3.5" stroke-linecap="round"/>`,

    watermelon: `
      <path d="M32 56 L13 29 A25 25 0 0 1 51 29 Z" fill="${C.red}" ${S}/>
      <path d="M13 29 A25 25 0 0 1 51 29" stroke="${C.green}" stroke-width="7" fill="none"/>
      <path d="M30 36 h.01 M37 30 h.01 M27 27 h.01" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`,

    apple: `
      <path d="M32 22 C24 13 13 19 14 33 C15 45 23 54 32 51 C41 54 49 45 50 33 C51 19 40 13 32 22 Z" fill="${C.red}" ${S}/>
      <path d="M32 20 C32 14 33 12 36 9" stroke="${C.cocoa}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M35 13 Q43 7 48 12 Q42 18 35 13 Z" fill="${C.green}" ${S}/>`,

    lemon: `
      <path d="M14 35 Q13 24 26 21 Q43 18 49 28 Q52 34 46 40 Q34 49 22 45 Q15 42 14 35 Z" fill="${C.yellow}" ${S}/>
      <path d="M49 29 l2.5 -1.5 M15 38 l-2.5 1.5" ${S} fill="none"/>`,

    orange: `
      <circle cx="32" cy="34" r="20" fill="${C.orange}" ${S}/>
      <circle cx="32" cy="34" r="13" fill="${C.peach}" ${S2}/>
      <path d="M32 34 L32 21 M32 34 L43 27 M32 34 L43 41 M32 34 L32 47 M32 34 L21 41 M32 34 L21 27" ${S2} fill="none" opacity=".5"/>`,

    lime: `
      <path d="M14 35 Q13 24 26 21 Q43 18 49 28 Q52 34 46 40 Q34 49 22 45 Q15 42 14 35 Z" fill="#7FA84A" ${S}/>
      <path d="M49 29 l2.5 -1.5 M15 38 l-2.5 1.5" ${S} fill="none"/>`,

    kiwi: `
      <circle cx="32" cy="32" r="21" fill="${C.brown}" ${S}/>
      <circle cx="32" cy="32" r="17.5" fill="${C.lime}" ${NS}/>
      <circle cx="32" cy="32" r="6" fill="${C.cream}" ${NS}/>
      <path d="M32 21 L32 25 M40 24 L37.5 27.5 M43 32 L39 32 M40 40 L37.5 36.5 M32 43 L32 39 M24 40 L26.5 36.5 M21 32 L25 32 M24 24 L26.5 27.5" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`,

    coconut: `
      <path d="M11 23 Q11 20 14 20 H50 Q53 20 53 23 C53 43 45 53 32 53 C19 53 11 43 11 23 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 23 H46 C46 39 41 47 32 47 C23 47 18 39 18 23 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 20 H50" stroke="#2A2118" stroke-width="3" stroke-linecap="round"/>
      <path d="M15 26 C13 30 14 36 17 40 M49 26 C51 30 50 36 47 40" stroke="#2A2118" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`,

    avocado: `
      <path d="M32 8 C21 8 15 22 15 36 C15 48 22 56 32 56 C42 56 49 48 49 36 C49 22 43 8 32 8 Z" fill="${C.deep}" ${S}/>
      <path d="M32 13 C24 13 19 24 19 36 C19 46 24 52 32 52 C40 52 45 46 45 36 C45 24 40 13 32 13 Z" fill="${C.lime}" ${NS}/>
      <circle cx="32" cy="40" r="8" fill="${C.brown}" ${S2}/>`,

    fig: `
      <path d="M32 9 C30 21 14 25 14 40 C14 50 22 57 32 57 C42 57 50 50 50 40 C50 25 34 21 32 9 Z" fill="${C.purple}" ${S}/>
      <ellipse cx="32" cy="44" rx="9" ry="7" fill="${C.blush}" ${NS} opacity=".75"/>`,

    almond: `
      <path d="M41 11 C52 19 55 38 45 48 C37 55 25 53 20 45 C16 37 23 28 29 22 C33 18 37 14 41 11 Z" fill="${C.wheat}" ${S}/>
      <path d="M38 20 C33 25 28 31 26 38 M42 26 C38 31 34 37 32 43" ${S2} fill="none" opacity=".4"/>`,

    carton: `
      <path d="M19 28 L26 16 L38 16 L45 28 L45 55 L19 55 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 28 L32 24 L45 28" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="34" width="22" height="16" rx="2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M32 38 C34.5 41.5 36 43.5 36 45.5 A4 4 0 0 1 28 45.5 C28 43.5 29.5 41.5 32 38 Z" fill="#E8E8E6" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>`,
    cartonAlmond: `
      <path d="M19 28 L26 16 L38 16 L45 28 L45 55 L19 55 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 28 L32 24 L45 28" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="34" width="22" height="16" rx="2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M34 36 C39 39 39 46 33 48 C28 47 27 40 31 37 C32 36.3 33 36 34 36 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>
      <path d="M33 39 C31 41 30 44 31 46" stroke="#8A5A3B" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55"/>`,
    cartonOat: `
      <path d="M19 28 L26 16 L38 16 L45 28 L45 55 L19 55 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 28 L32 24 L45 28" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="34" width="22" height="16" rx="2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="28" cy="43" rx="3" ry="6" transform="rotate(-16 28 43)" fill="#D9B98C" stroke="#2A2118" stroke-width="2"/>
      <ellipse cx="35" cy="42" rx="3" ry="6" transform="rotate(15 35 42)" fill="#C68A4F" stroke="#2A2118" stroke-width="2"/>`,
    cartonCoconut: `
      <path d="M19 28 L26 16 L38 16 L45 28 L45 55 L19 55 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 28 L32 24 L45 28" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="34" width="22" height="16" rx="2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M26 40 A7 6 0 0 0 38 40 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>
      <path d="M29 40 A4 3.4 0 0 0 35 40 Z" fill="#FBF7EE" stroke="none"/>
      <path d="M26 40 H38" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>`,
    cartonEggnog: `
      <path d="M19 28 L26 16 L38 16 L45 28 L45 55 L19 55 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 28 L32 24 L45 28" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="34" width="22" height="16" rx="2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="32" cy="42" rx="5" ry="6.4" fill="#F6EDD8" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>
      <path d="M30 39 h.01 M34 41 h.01 M31 44 h.01" stroke="#8A5A3B" stroke-width="1.8" stroke-linecap="round"/>`,

    coconutWater: `
      <circle cx="31" cy="38" r="17" fill="${C.green}" ${S}/>
      <path d="M23 24 H39 L36 30 H26 Z" fill="${C.cream}" ${S2}/>
      <path d="M40 8 L36 27" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>
      <path d="M40 8 L36 27" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 4"/>`,

    dollop: `
      <path d="M16 47 C11 47 12 39 18 39 C16 32 24 29 27 34 C28 27 37 27 37 34 C42 30 49 35 44 41 C50 42 49 48 44 48 Z" fill="${C.white}" ${S}/>
      <path d="M22 43 Q28 40 33 43" ${S2} fill="none" opacity=".4"/>`,

    softserve: `
      <path d="M20 50 C15 50 15 43 21 42 C14 40 18 32 25 35 C20 29 28 25 32 30 C36 25 44 29 39 35 C46 32 50 40 43 42 C49 43 49 50 44 50 Z" fill="${C.white}" ${S}/>
      <path d="M24 43 Q32 40 41 43" ${S2} fill="none" opacity=".4"/>
      <path d="M22 37 Q30 34 38 37" ${S2} fill="none" opacity=".4"/>`,

    crust: `
      <ellipse cx="32" cy="39" rx="27" ry="18" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 39 Q7 33 11 36 Q14 30 19 35 Q23 29 28 34 Q32 28 36 34 Q41 29 45 35 Q50 30 53 36 Q57 33 59 39" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="32" cy="40" rx="17" ry="9.5" fill="#E8C99B" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,

    sprinkles: `
      <path d="M17 25 l6 -3" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>
      <path d="M31 19 l6 2" stroke="${C.blue}" stroke-width="5" stroke-linecap="round"/>
      <path d="M43 27 l4 -5" stroke="${C.yellow}" stroke-width="5" stroke-linecap="round"/>
      <path d="M15 36 l3 5" stroke="${C.green}" stroke-width="5" stroke-linecap="round"/>
      <path d="M30 35 l6 -1" stroke="${C.magenta}" stroke-width="5" stroke-linecap="round"/>
      <path d="M45 40 l2 6" stroke="${C.orange}" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 47 l6 2" stroke="${C.purple}" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 48 l5 -3" stroke="${C.teal}" stroke-width="5" stroke-linecap="round"/>`,

    coffee: `
      <path d="M30 13 H53 L50 53 C50 57 46 58 40 58 C34 58 30 57 30 53 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M31 25 H52 L50 53 C50 57 46 58 40 58 C34 58 30 57 30 53 Z" fill="#5C4030" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="15" cy="34" rx="11" ry="15" transform="rotate(-30 15 34)" fill="#5C4030" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22 C16 28 16 40 8 46" stroke="#C68A4F" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,

    matcha: `
      <path d="M13 33 H51 C51 45 43 53 32 53 C21 53 13 45 13 33 Z" fill="${C.tan}" ${S}/>
      <ellipse cx="32" cy="33" rx="19" ry="5" fill="${C.green}" ${S2}/>
      <path d="M26 22 q-2 -5 1 -9 M36 23 q2 -5 -1 -9" ${S2} fill="none" opacity=".6"/>`,

    spirulina: `
      <path d="M32 11 C49 11 57 28 46 39 C36 48 20 44 20 33 C20 25 28 21 34 25 C38 28 38 34 33 35" stroke="${C.blue}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,

    chlorella: `
      <path d="M32 11 C49 11 57 28 46 39 C36 48 20 44 20 33 C20 25 28 21 34 25 C38 28 38 34 33 35" stroke="${C.deep}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`,

    spinach: `
      <path d="M32 6 C17 16 12 36 21 47 C27 54 37 54 43 47 C52 36 47 16 32 6 Z" fill="${C.green}" ${S}/>
      <path d="M32 14 L32 46 M32 24 L23 31 M32 24 L41 31 M32 35 L25 41 M32 35 L39 41" ${S2} fill="none" opacity=".5"/>
      <path d="M32 47 L32 57" ${S} fill="none"/>`,

    kale: `
      <path d="M32 10 Q40 6 43 13 Q52 11 51 20 Q58 23 53 30 Q58 37 50 40 Q51 49 42 47 Q39 55 32 51 Q25 55 22 47 Q13 49 14 40 Q6 37 11 30 Q6 23 13 20 Q12 11 21 13 Q24 6 32 10 Z" fill="${C.deep}" ${S}/>
      <path d="M32 18 L32 44 M32 26 L24 32 M32 26 L40 32" ${S2} stroke="${C.lime}" fill="none"/>
      <path d="M32 51 L32 58" ${S} fill="none"/>`,

    mint: `
      <path d="M32 56 C32 42 32 30 32 17" ${S} fill="none"/>
      <path d="M32 30 C19 29 14 17 23 12 C31 9 34 20 32 30 Z" fill="${C.green}" ${S}/>
      <path d="M32 38 C45 37 50 25 41 20 C33 17 30 28 32 38 Z" fill="${C.green}" ${S}/>`,

    maca: `
      <path d="M21 28 C12 33 13 47 22 51 C28 54 38 54 44 49 C52 42 49 31 41 27 C35 24 27 25 21 28 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 52 C34 56 34 60 30 63" stroke="#2A2118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M26 27 C24 17 22 13 19 9 M32 26 C32 16 32 11 33 6 M38 27 C41 18 44 15 47 11" stroke="#5E8C4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M22 38 h.01 M30 42 h.01 M38 38 h.01" stroke="#2A2118" stroke-width="2.5" stroke-linecap="round" opacity=".4"/>`,

    cacao: `
      <path d="M20 14 C8 28 10 46 22 52 C36 58 52 44 50 28 C49 19 42 11 33 11 C28 11 23 11 20 14 Z" transform="rotate(18 32 32)" fill="#B0633A" ${S}/>
      <path d="M24 16 C18 28 19 42 26 50 M33 13 C28 26 28 40 34 51 M42 15 C39 27 40 39 44 47" transform="rotate(18 32 32)" ${S2} fill="none" opacity=".5"/>`,

    vanilla: `
      <path d="M19 8 C14 28 21 47 33 56" stroke="${C.cocoa}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M30 8 C26 26 32 44 43 53" stroke="${C.cocoa}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="48" cy="17" r="4" fill="${C.white}" ${S2}/>
      <circle cx="55" cy="22" r="4" fill="${C.white}" ${S2}/>
      <circle cx="48" cy="27" r="4" fill="${C.white}" ${S2}/>
      <circle cx="51" cy="22" r="2.5" fill="${C.yellow}" ${NS}/>`,

    cinnamon: `
      <rect x="10" y="22" width="42" height="9" rx="4.5" transform="rotate(-14 32 27)" fill="${C.brown}" ${S}/>
      <rect x="12" y="36" width="42" height="9" rx="4.5" transform="rotate(-14 33 41)" fill="${C.brown}" ${S}/>
      <path d="M14 24 a4 4 0 1 0 0 .01 M16 38 a4 4 0 1 0 0 .01" transform="rotate(-14 32 32)" ${S2} fill="${C.tan}"/>`,

    turmeric: `
      <path d="M14 38 C10 30 18 24 24 28 C26 20 36 18 40 24 C48 22 54 30 48 36 C54 42 46 50 40 46 C36 52 26 52 24 46 C16 48 12 44 14 38 Z" fill="${C.orange}" ${S}/>
      <circle cx="33" cy="37" r="6" fill="${C.yellow}" ${S2}/>`,

    ginger: `
      <path d="M14 38 C10 30 18 24 24 28 C26 20 36 18 40 24 C48 22 54 30 48 36 C54 42 46 50 40 46 C36 52 26 52 24 46 C16 48 12 44 14 38 Z" fill="${C.tan}" ${S}/>
      <circle cx="33" cy="37" r="6" fill="${C.cream}" ${S2}/>`,

    scoop: `
      <path d="M14 34 C14 48 50 48 50 34 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/><path d="M17 34 C19 24 45 24 47 34 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/><path d="M14 34 H50" stroke="#2A2118" stroke-width="3" stroke-linecap="round"/><path d="M25 30 h.01 M33 28 h.01 M40 31 h.01 M29 32 h.01 M37 31 h.01" stroke="#C68A4F" stroke-width="3" stroke-linecap="round"/>`,

    seamoss: `
      <path d="M32 57 C30 44 29 32 26 16" stroke="${C.teal}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M31 46 C24 42 19 35 19 26 M31 38 C39 36 44 29 45 20 M30 28 C24 26 21 21 21 14 M29 22 C34 20 36 15 36 10" stroke="${C.teal}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="24" r="2.6" fill="${C.teal}" ${NS}/>
      <circle cx="45" cy="18" r="2.6" fill="${C.teal}" ${NS}/>
      <circle cx="36" cy="9" r="2.4" fill="${C.teal}" ${NS}/>
      <circle cx="26" cy="14" r="2.4" fill="${C.teal}" ${NS}/>`,

    beepollen: `
      <circle cx="26" cy="26" r="5.5" fill="${C.yellow}" ${S2}/>
      <circle cx="38" cy="24" r="5.5" fill="${C.orange}" ${S2}/>
      <circle cx="21" cy="38" r="5.5" fill="${C.orange}" ${S2}/>
      <circle cx="33" cy="37" r="5.5" fill="${C.yellow}" ${S2}/>
      <circle cx="44" cy="35" r="5.5" fill="${C.yellow}" ${S2}/>
      <circle cx="28" cy="48" r="5.5" fill="${C.yellow}" ${S2}/>
      <circle cx="40" cy="47" r="5.5" fill="${C.orange}" ${S2}/>
      <path d="M50 14 h.01 M14 28 h.01 M52 44 h.01" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/>`,

    honey: `
      <path d="M18 30 C12 36 12 50 18 55 C26 61 38 61 46 55 C52 50 52 36 46 30 Z" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 26 H48 V31 C48 33 46 34 44 34 H20 C18 34 16 33 16 31 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 42 q5 6 0 12 M32 40 q5 7 0 14 M42 42 q5 6 0 12" stroke="#E8893D" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`,

    agave: `
      <path d="M32 54 C29 38 29 22 32 11 C35 22 35 38 32 54 Z" fill="${C.teal}" ${S}/>
      <path d="M30 54 C22 44 15 36 10 31 C19 33 27 42 31 51 Z" fill="${C.teal}" ${S}/>
      <path d="M34 54 C42 44 49 36 54 31 C45 33 37 42 33 51 Z" fill="${C.teal}" ${S}/>
      <path d="M28 55 C20 51 14 46 11 42 M36 55 C44 51 50 46 53 42" ${S2} stroke="${C.teal}" fill="none"/>`,

    chia: `
      <path d="M15 46 Q32 35 49 46 Q32 55 15 46 Z" fill="${C.tan}" ${S}/>
      <path d="M24 40 h.01 M32 37 h.01 M40 40 h.01 M28 44 h.01 M36 44 h.01 M32 48 h.01 M22 46 h.01 M42 46 h.01" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M26 30 h.01 M34 27 h.01 M40 31 h.01" stroke="${C.cocoa}" stroke-width="3" stroke-linecap="round"/>`,

    hemp: `
      <path d="M32 50 C29 38 29 24 32 12 C35 24 35 38 32 50 Z" fill="${C.green}" ${S2}/>
      <path d="M31 46 C22 42 15 34 12 24 C22 28 29 36 32 45 Z" fill="${C.green}" ${S2}/>
      <path d="M33 46 C42 42 49 34 52 24 C42 28 35 36 32 45 Z" fill="${C.green}" ${S2}/>
      <path d="M30 50 C24 49 18 45 15 41 C22 42 27 45 31 49 Z" fill="${C.green}" ${S2}/>
      <path d="M34 50 C40 49 46 45 49 41 C42 42 37 45 33 49 Z" fill="${C.green}" ${S2}/>
      <path d="M32 50 L32 58" ${S} fill="none"/>`,

    flax: `
      <ellipse cx="22" cy="34" rx="5" ry="9" transform="rotate(-22 22 34)" fill="${C.wheat}" ${S2}/>
      <ellipse cx="34" cy="28" rx="5" ry="9" transform="rotate(4 34 28)" fill="${C.wheat}" ${S2}/>
      <ellipse cx="44" cy="36" rx="5" ry="9" transform="rotate(26 44 36)" fill="${C.wheat}" ${S2}/>
      <path d="M22 48 h.01 M32 50 h.01 M42 48 h.01" stroke="${C.wheat}" stroke-width="4" stroke-linecap="round"/>`,

    ashwagandha: `
      <path d="M28 20 C25 28 23 38 24 47 C25 55 28 60 31 60 C35 60 37 52 36 43 C35 34 33 27 32 19 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27 33 C20 35 15 39 11 46 M35 39 C41 42 45 47 47 54 M31 58 C30 61 28 63 26 63" stroke="#C68A4F" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 38 C30 41 32 43 35 44" stroke="#8A5A3B" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M29 20 C28 13 25 9 21 6 M32 19 C32 12 33 8 35 5 M32 20 C35 14 39 11 43 8" stroke="#5E8C4F" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,

    maple: `
      <path d="M27 8 H37 V14 H27 Z" fill="${C.cocoa}" ${S}/>
      <path d="M26 14 H38 L40 22 H24 Z" fill="${C.tan}" ${S}/>
      <path d="M24 22 H40 C46 24 47 32 47 40 C47 50 41 56 32 56 C22 56 16 50 16 40 C16 32 18 24 24 22 Z" fill="${C.wheat}" ${S}/>
      <path d="M43 27 C52 27 53 41 44 41" stroke="${C.ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27 34 Q32 30 37 34" ${S2} fill="none" stroke="${C.cocoa}" opacity=".45"/>`,

    stevia: `
      <path d="M32 57 C32 45 31 33 31 23" stroke="#2A2118" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M31 41 C21 38 14 39 9 45 C16 49 26 48 31 43 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M33 34 C43 31 50 32 55 38 C48 42 38 41 33 36 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 25 C26 14 19 11 11 13 C14 23 24 28 32 25 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 16 L29 23 M11 43 L28 45 M53 37 L34 35" stroke="#3F6B4F" stroke-width="2" stroke-linecap="round" fill="none"/>`,

    probiotic: `
      <path d="M22 44 L34 22 A9 9 0 0 1 50 31 L38 53 A9 9 0 0 1 22 44 Z" fill="${C.cream}" ${S}/>
      <path d="M28 33 L44 42 L38 53 A9 9 0 0 1 22 44 Z" fill="${C.sky}" ${NS}/>
      <path d="M28 33 L44 42" ${S} fill="none"/>
      <path d="M14 18 h.01 M20 12 h.01 M13 28 h.01" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`,

    glowdrop: `
      <path d="M32 9 C40 23 50 31 50 41 A18 17 0 0 1 14 41 C14 31 24 23 32 9 Z" fill="${C.sky}" ${S}/>
      <path d="M40 33 L42 39 L48 41 L42 43 L40 49 L38 43 L32 41 L38 39 Z" fill="${C.white}" ${NS}/>`,

    mushroom: `
      <path d="M12 31 C12 17 52 17 52 31 Q52 36 45 36 H19 Q12 36 12 31 Z" fill="#B0633A" ${S}/>
      <path d="M26 36 C26 45 24 50 22 54 H42 C40 50 38 45 38 36 Z" fill="${C.cream}" ${S}/>
      <path d="M22 26 h.01 M32 23 h.01 M42 26 h.01" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>`,

    goji: `
      <path d="M30 12 Q34 6 38 10" stroke="${C.green}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="24" cy="28" rx="6" ry="10" transform="rotate(-18 24 28)" fill="${C.red}" ${S}/>
      <ellipse cx="38" cy="26" rx="6" ry="10" transform="rotate(10 38 26)" fill="${C.red}" ${S}/>
      <ellipse cx="32" cy="44" rx="6" ry="10" transform="rotate(-4 32 44)" fill="${C.red}" ${S}/>`,

    pomegranate: `
      <circle cx="32" cy="38" r="18" fill="#C23A2E" ${S}/>
      <path d="M26 22 L24 12 M32 20 L32 9 M38 22 L40 12" stroke="${C.deep}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M26 21 L24 14 L29 18 L32 11 L35 18 L40 14 L38 21 Z" fill="#9E3328" ${S2}/>
      <circle cx="27" cy="37" r="2.3" fill="${C.pink}" ${NS}/>
      <circle cx="36" cy="35" r="2.3" fill="${C.pink}" ${NS}/>
      <circle cx="32" cy="42" r="2.3" fill="${C.pink}" ${NS}/>
      <circle cx="39" cy="42" r="2.3" fill="${C.pink}" ${NS}/>
      <circle cx="25" cy="43" r="2.3" fill="${C.pink}" ${NS}/>`,

    acai: `
      <circle cx="32" cy="22" r="7" fill="${C.purple}" ${S}/>
      <circle cx="22" cy="32" r="7" fill="${C.purple}" ${S}/>
      <circle cx="42" cy="32" r="7" fill="${C.purple}" ${S}/>
      <circle cx="27" cy="44" r="7" fill="${C.purple}" ${S}/>
      <circle cx="38" cy="44" r="7" fill="${C.purple}" ${S}/>
      <path d="M32 15 Q36 8 42 8" stroke="${C.green}" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    elderberry: `
      <path d="M32 8 L32 16" stroke="${C.deep}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 16 L22 26 M32 16 L32 24 M32 16 L42 26 M32 16 L26 22 M32 16 L38 22" stroke="${C.deep}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".7"/>
      <circle cx="21" cy="28" r="4.5" fill="#5B4488" ${S2}/>
      <circle cx="32" cy="26" r="4.5" fill="#5B4488" ${S2}/>
      <circle cx="43" cy="28" r="4.5" fill="#5B4488" ${S2}/>
      <circle cx="17" cy="36" r="4.2" fill="#5B4488" ${S2}/>
      <circle cx="26" cy="35" r="4.5" fill="#5B4488" ${S2}/>
      <circle cx="38" cy="35" r="4.5" fill="#5B4488" ${S2}/>
      <circle cx="47" cy="36" r="4.2" fill="#5B4488" ${S2}/>
      <circle cx="32" cy="42" r="4.5" fill="#5B4488" ${S2}/>`,

    yogurt: `
      <path d="M16 23 L48 23 L43 54 C43 56 41 57 39 57 L25 57 C23 57 21 56 21 54 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 18 L50 18 L48 25 L16 25 Z" fill="#5E9C8F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 25 H44" stroke="#2A2118" stroke-width="2" fill="none" stroke-linecap="round" opacity=".3"/>`,

    kefir: `
      <path d="M27 9 H37 V15 C37 18 41 20 41 27 V50 C41 54 38 56 32 56 C26 56 23 54 23 50 V27 C23 20 27 18 27 15 Z" fill="${C.white}" ${S}/>
      <path d="M23 35 H41" ${S} fill="none"/>
      <path d="M27 44 Q32 41 37 44" ${S2} fill="none" opacity=".4"/>
      <rect x="28" y="6" width="8" height="4" rx="1" fill="${C.sky}" ${S2}/>`,

    oats: `
      <ellipse cx="24" cy="41" rx="8" ry="5" transform="rotate(-8 24 41)" fill="${C.tan}" ${S2}/>
      <ellipse cx="39" cy="42" rx="8" ry="5" transform="rotate(10 39 42)" fill="${C.wheat}" ${S2}/>
      <ellipse cx="31" cy="33" rx="8" ry="5" transform="rotate(4 31 33)" fill="${C.wheat}" ${S2}/>
      <ellipse cx="42" cy="32" rx="8" ry="5" transform="rotate(-10 42 32)" fill="${C.tan}" ${S2}/>
      <ellipse cx="24" cy="29" rx="8" ry="5" transform="rotate(12 24 29)" fill="${C.tan}" ${S2}/>
      <ellipse cx="33" cy="23" rx="8" ry="5" transform="rotate(-6 33 23)" fill="${C.wheat}" ${S2}/>`,

    rice: `
      <ellipse cx="23" cy="42" rx="3" ry="7" transform="rotate(-28 23 42)" fill="${C.white}" ${S2}/>
      <ellipse cx="32" cy="44" rx="3" ry="7" transform="rotate(6 32 44)" fill="${C.white}" ${S2}/>
      <ellipse cx="41" cy="42" rx="3" ry="7" transform="rotate(30 41 42)" fill="${C.white}" ${S2}/>
      <ellipse cx="28" cy="33" rx="3" ry="7" transform="rotate(-14 28 33)" fill="${C.white}" ${S2}/>
      <ellipse cx="37" cy="32" rx="3" ry="7" transform="rotate(18 37 32)" fill="${C.white}" ${S2}/>
      <ellipse cx="32" cy="24" rx="3" ry="7" transform="rotate(2 32 24)" fill="${C.white}" ${S2}/>`,

    celery: `
      <path d="M24 56 C22 41 23 27 26 17 C28 13 36 13 38 17 C41 27 42 41 40 56 Z" fill="${C.lime}" ${S}/>
      <path d="M30 19 L30 53 M35 21 L34 53 M29 21 L25 53" stroke="${C.green}" stroke-width="1.8" fill="none" opacity=".5"/>
      <path d="M27 17 C22 9 16 10 16 15 C21 18 25 18 29 17 Z" fill="${C.green}" ${S2}/>
      <path d="M37 17 C42 9 48 10 48 15 C43 18 39 18 35 17 Z" fill="${C.green}" ${S2}/>
      <path d="M32 15 C32 7 36 5 39 8 C37 13 35 15 32 18 Z" fill="${C.green}" ${S2}/>`,

    granola: `
      <path d="M18 28 L28 22 L34 30 L26 36 Z" fill="${C.wheat}" ${S2}/>
      <path d="M36 20 L46 24 L44 34 L35 31 Z" fill="${C.tan}" ${S2}/>
      <path d="M22 40 L32 38 L36 47 L25 50 Z" fill="${C.tan}" ${S2}/>
      <path d="M40 38 L48 42 L43 50 L37 46 Z" fill="${C.wheat}" ${S2}/>
      <path d="M16 18 h.01 M48 16 h.01 M14 48 h.01 M50 54 h.01 M30 56 h.01" stroke="${C.cocoa}" stroke-width="3.4" stroke-linecap="round"/>`,

    ice: `
      <rect x="24" y="24" width="26" height="26" rx="5" transform="rotate(8 37 37)" fill="${C.sky}" ${S} opacity=".92"/>
      <rect x="11" y="17" width="20" height="20" rx="4" transform="rotate(-9 21 27)" fill="${C.sky}" ${S}/>
      <path d="M31 33 l8 8" stroke="${C.white}" stroke-width="3.4" stroke-linecap="round"/>`,

    salt: `
      <path d="M32 12 L46 28 L39 52 H25 L18 28 Z" fill="${C.white}" ${S}/>
      <path d="M32 12 L29 28 L25 52 M32 12 L36 28 L39 52 M18 28 H46" ${S2} fill="none" opacity=".4"/>`,

    oil: `
      <path d="M27 10 H37 V18 H27 Z" fill="${C.tan}" ${S2}/>
      <path d="M27 18 C19 24 17 36 21 46 C24 53 40 53 43 46 C47 36 45 24 37 18 Z" fill="${C.yellow}" ${S}/>
      <path d="M53 30 C53 35 49 36 49 32 C49 30 51 28 53 25 Z" fill="${C.yellow}" ${S2}/>`,

    aloe: `
      <path d="M28 56 C20 38 23 18 32 8 C41 18 44 38 36 56 Z" fill="${C.green}" ${S}/>
      <path d="M32 16 C29 28 29 42 32 52" ${S2} stroke="${C.lime}" fill="none"/>
      <path d="M26 30 l-3 -1 M25 40 l-3 -1 M38 30 l3 -1 M39 40 l3 -1" ${S2} fill="none"/>`,

    juice: `
      <path d="M21 16 H43 L40 54 H24 Z" fill="none" ${S}/>
      <path d="M22.5 28 H41.5 L40 54 H24 Z" fill="${C.orange}" ${NS}/>
      <path d="M21 16 H43 L40 54 H24 Z" fill="none" ${S}/>
      <path d="M39 6 L34 24" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`,

    waterdrop: `
      <path d="M32 9 C40 23 50 31 50 41 A18 17 0 0 1 14 41 C14 31 24 23 32 9 Z" fill="${C.sky}" ${S}/>
      <path d="M24 40 Q24 47 30 50" stroke="${C.white}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,

    lavender: `
      <path d="M32 58 C32 46 32 36 32 26" ${S} fill="none"/>
      <circle cx="28" cy="24" r="4.5" fill="${C.purple}" ${S2}/>
      <circle cx="36" cy="20" r="4.5" fill="${C.purple}" ${S2}/>
      <circle cx="28" cy="15" r="4.5" fill="${C.purple}" ${S2}/>
      <circle cx="36" cy="11" r="4.5" fill="${C.purple}" ${S2}/>
      <circle cx="32" cy="7" r="4" fill="${C.purple}" ${S2}/>
      <path d="M32 44 Q24 42 22 36 M32 38 Q40 36 42 30" ${S2} stroke="${C.green}" fill="none"/>`,

    graviola: `
      <path d="M22 14 C10 26 12 46 26 53 C40 59 54 47 52 31 C50 19 42 10 31 11 C28 11 25 12 22 14 Z" fill="${C.green}" ${S}/>
      <path d="M22 22 l-2 -2 M30 18 l-1 -3 M38 19 l1 -3 M45 25 l3 -2 M48 34 l3 0 M46 43 l3 2 M39 49 l1 3 M30 50 l-1 3 M22 45 l-3 2 M18 36 l-3 1 M18 28 l-3 -1" ${S2} fill="none"/>`,

    pea: `
      <path d="M14 26 C14 18 50 18 50 26 C50 40 42 50 32 50 C22 50 14 40 14 26 Z" fill="${C.green}" ${S}/>
      <circle cx="22" cy="32" r="5" fill="${C.lime}" ${S2}/>
      <circle cx="32" cy="34" r="5" fill="${C.lime}" ${S2}/>
      <circle cx="42" cy="32" r="5" fill="${C.lime}" ${S2}/>`,

    nutbutter: `
      <path d="M18 22 H46 V46 C46 52 40 56 32 56 C24 56 18 52 18 46 Z" fill="${C.wheat}" ${S}/>
      <path d="M16 14 H48 V22 H16 Z" fill="${C.tan}" ${S}/>
      <path d="M50 10 L40 28" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
      <path d="M24 34 Q28 30 32 34 T40 34" ${S2} fill="none" opacity=".45"/>`,

    beet: `
      <circle cx="32" cy="38" r="15" fill="#C9527A" ${S}/>
      <path d="M32 53 L32 60" stroke="#C9527A" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 24 C26 16 27 10 30 6 M34 24 C36 16 38 12 43 8" stroke="${C.green}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M26 36 Q30 32 36 34" stroke="#9A3458" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

    carrot: `
      <path d="M22 22 C30 18 40 22 42 28 C44 34 30 56 27 57 C24 58 18 41 18 32 C18 28 19 24 22 22 Z" fill="${C.orange}" ${S}/>
      <path d="M25 31 l10 3 M23 40 l9 3 M24 49 l6 2" ${S2} fill="none" opacity=".45"/>
      <path d="M30 21 C30 14 28 11 30 7 M37 23 C40 16 44 15 46 11 M24 23 C22 17 18 16 16 12" stroke="${C.green}" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    pumpkin: `
      <ellipse cx="32" cy="40" rx="20" ry="16" fill="${C.orange}" ${S}/>
      <path d="M32 26 C28 32 28 48 32 54 M22 28 C19 34 19 46 23 52 M42 28 C45 34 45 46 41 52" ${S2} fill="none" opacity=".5"/>
      <path d="M32 25 C31 19 33 15 37 14" stroke="${C.cocoa}" stroke-width="4" fill="none" stroke-linecap="round"/>`,

    chili: `
      <path d="M24 15 C19 26 22 40 31 51 C34 55 38 53 38 48 C38 36 36 24 32 16 C30 12 26 12 24 15 Z" fill="${C.red}" ${S}/>
      <path d="M28 14 C27 9 31 6 36 8" stroke="${C.green}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

    saffron: `
      <path d="M30 55 C26 43 22 30 20 16" stroke="${C.red}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M20 16 l-4 -3 M20 16 l3 -4" stroke="${C.red}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M32 55 C32 41 32 28 32 14" stroke="${C.orange}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M32 14 l-4 -3 M32 14 l4 -3" stroke="${C.orange}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M34 55 C38 43 42 30 45 16" stroke="${C.red}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M45 16 l-3 -4 M45 16 l4 -3" stroke="${C.red}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

    sparkle: `
      <path d="M26 11 L29 22 L40 25 L29 28 L26 39 L23 28 L12 25 L23 22 Z" fill="${C.yellow}" ${S2}/>
      <path d="M45 30 L47 38 L55 40 L47 42 L45 50 L43 42 L35 40 L43 38 Z" fill="${C.yellow}" ${S2}/>
      <path d="M17 43 L18.5 49 L24 50.5 L18.5 52 L17 58 L15.5 52 L10 50.5 L15.5 49 Z" fill="${C.orange}" ${S2}/>`,

    sesame: `
      <ellipse cx="24" cy="25" rx="4" ry="6.5" transform="rotate(-28 24 25)" fill="${C.cocoa}" ${S2}/>
      <ellipse cx="38" cy="23" rx="4" ry="6.5" transform="rotate(22 38 23)" fill="${C.ink}" ${S2}/>
      <ellipse cx="31" cy="34" rx="4" ry="6.5" transform="rotate(-8 31 34)" fill="${C.ink}" ${S2}/>
      <ellipse cx="45" cy="35" rx="4" ry="6.5" transform="rotate(34 45 35)" fill="${C.cocoa}" ${S2}/>
      <ellipse cx="19" cy="39" rx="4" ry="6.5" transform="rotate(16 19 39)" fill="${C.ink}" ${S2}/>
      <ellipse cx="33" cy="47" rx="4" ry="6.5" transform="rotate(-22 33 47)" fill="${C.cocoa}" ${S2}/>
      <ellipse cx="45" cy="48" rx="4" ry="6.5" transform="rotate(6 45 48)" fill="${C.ink}" ${S2}/>`,

    coconutcream: `
      <path d="M13 34 A19 18 0 0 0 51 34 Z" fill="${C.brown}" ${S}/>
      <path d="M16 34 C16 23 48 23 48 34 Z" fill="${C.cream}" ${S}/>
      <path d="M25 30 Q32 26 39 30" ${S2} fill="none" opacity=".45"/>`,

    coconutflakes: `
      <path d="M13 23 Q26 17 31 27 Q20 32 13 23 Z" fill="${C.white}" ${S2}/>
      <path d="M35 19 Q49 21 46 32 Q35 30 35 19 Z" fill="${C.cream}" ${S2}/>
      <path d="M16 38 Q29 33 34 44 Q21 47 16 38 Z" fill="${C.cream}" ${S2}/>
      <path d="M40 39 Q53 39 49 51 Q38 48 40 39 Z" fill="${C.white}" ${S2}/>
      <path d="M25 47 Q37 47 34 57 Q25 56 25 47 Z" fill="${C.white}" ${S2}/>`,

    passionfruit: `
      <circle cx="32" cy="35" r="21" fill="${C.purple}" ${S}/>
      <circle cx="32" cy="35" r="15" fill="${C.yellow}" ${S2}/>
      <ellipse cx="27" cy="29" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>
      <ellipse cx="37" cy="29" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>
      <ellipse cx="31" cy="36" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>
      <ellipse cx="39" cy="39" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>
      <ellipse cx="26" cy="40" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>
      <ellipse cx="33" cy="44" rx="2.4" ry="3.4" fill="${C.cocoa}" ${NS}/>`,

    peppercorn: `
      <circle cx="26" cy="26" r="6" fill="${C.pink}" ${S2}/>
      <circle cx="39" cy="24" r="6" fill="${C.blush}" ${S2}/>
      <circle cx="32" cy="36" r="6" fill="${C.blush}" ${S2}/>
      <circle cx="45" cy="36" r="6" fill="${C.pink}" ${S2}/>
      <circle cx="21" cy="38" r="6" fill="${C.blush}" ${S2}/>
      <circle cx="30" cy="48" r="6" fill="${C.pink}" ${S2}/>
      <circle cx="43" cy="48" r="5.5" fill="${C.blush}" ${S2}/>
      <path d="M24 24 q-1 -1.4 0.4 -2.2 M37 22 q-1 -1.4 0.4 -2.2 M30 34 q-1 -1.4 0.4 -2.2" stroke="${C.white}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,

    dropper: `
      <path d="M27 6 C23 6 23 12 27 12 H37 C41 12 41 6 37 6 Z" fill="${C.red}" ${S2}/>
      <rect x="28" y="12" width="8" height="7" fill="${C.cocoa}" ${S2}/>
      <path d="M21 19 H43 L41 50 C40 54 36 56 32 56 C28 56 24 54 23 50 Z" fill="${C.wheat}" ${S}/>
      <path d="M24 30 H40" stroke="${C.cocoa}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".4"/>`,

    capsule: `
      <path d="M22 44 L34 22 A9 9 0 0 1 50 31 L38 53 A9 9 0 0 1 22 44 Z" fill="${C.cream}" ${S}/>
      <path d="M28 33 L44 42 L38 53 A9 9 0 0 1 22 44 Z" fill="${C.red}" ${NS}/>
      <path d="M28 33 L44 42" ${S} fill="none"/>
      <path d="M22 44 L34 22 A9 9 0 0 1 50 31 L38 53 A9 9 0 0 1 22 44 Z" fill="none" ${S}/>`,

    mate: `
      <circle cx="32" cy="40" r="18" fill="#8A5A3B" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 31 H50 C50 25 42 22 32 22 C22 22 14 25 14 31 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 28 q3 -4 6 0 M32 27 q3 -4 6 0 M44 29 q-3 -4 -6 0" stroke="#3F6B4F" stroke-width="2" fill="none" stroke-linecap="round"/>`,

    can: `
      <rect x="22" y="13" width="20" height="39" rx="4" fill="${C.teal}" ${S}/>
      <ellipse cx="32" cy="13" rx="10" ry="3" fill="${C.cream}" ${S2}/>
      <circle cx="32" cy="13" r="2.2" fill="${C.tan}" ${S2}/>
      <path d="M22 20 H42 M22 45 H42" stroke="${C.cream}" stroke-width="2" fill="none" opacity=".5"/>
      <path d="M26 30 Q32 27 38 30" stroke="${C.cream}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

    bottle: `
      <rect x="28" y="7" width="8" height="8" rx="1" fill="${C.red}" ${S2}/>
      <path d="M28 15 H36 V23 C36 25 40 27 40 33 L40 50 C40 54 37 56 32 56 C27 56 24 54 24 50 L24 33 C24 27 28 25 28 23 Z" fill="${C.lime}" ${S}/>
      <rect x="26" y="39" width="12" height="10" rx="2" fill="${C.cream}" ${S2}/>`,

    ginkgo: `
      <path d="M32 49 C18 49 10 31 21 21 C25 17 29 20 31 26 C31 22 33 22 33 26 C35 20 39 17 43 21 C54 31 46 49 32 49 Z" fill="${C.green}" ${S}/>
      <path d="M32 49 L32 58" ${S} fill="none"/>
      <path d="M32 47 L24 26 M32 47 L40 26 M32 47 L32 25" stroke="${C.deep}" stroke-width="1.5" fill="none" opacity=".4"/>`,

    rose: `
      <circle cx="32" cy="26" r="14" fill="${C.pink}" ${S}/>
      <path d="M24 27 a8 8 0 1 1 16 0" stroke="${C.magenta}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M28.5 26 a3.5 3.5 0 1 0 7 0" stroke="${C.magenta}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M32 40 L32 58" ${S} fill="none"/>
      <path d="M32 50 Q24 48 22 42 Q30 42 32 50 Z" fill="${C.green}" ${S2}/>`,

    icecream: `
      <path d="M25 36 L39 36 L34 58 L30 58 Z" fill="${C.tan}" ${S}/>
      <path d="M27 44 l9 -3.5 M28.5 50 l6.5 -2.5" ${S2} fill="none"/>
      <path d="M17 36 Q12 26 22 24 Q23 14 33 18 Q44 14 43 25 Q52 28 46 36 Z" fill="${C.blush}" ${S}/>
      <path d="M24 28 h.01 M32 25 h.01 M38 29 h.01" stroke="${C.cream}" stroke-width="3.5" stroke-linecap="round"/>`,

    chamomile: `
      <circle cx="32" cy="18" r="9" fill="${C.white}" ${S2}/>
      <circle cx="47" cy="29" r="9" fill="${C.white}" ${S2}/>
      <circle cx="41" cy="46" r="9" fill="${C.white}" ${S2}/>
      <circle cx="23" cy="46" r="9" fill="${C.white}" ${S2}/>
      <circle cx="17" cy="29" r="9" fill="${C.white}" ${S2}/>
      <circle cx="32" cy="33" r="8" fill="${C.yellow}" ${S2}/>`,

    hibiscus: `
      <circle cx="32" cy="18" r="9" fill="${C.red}" ${S2}/>
      <circle cx="47" cy="29" r="9" fill="${C.red}" ${S2}/>
      <circle cx="41" cy="46" r="9" fill="${C.red}" ${S2}/>
      <circle cx="23" cy="46" r="9" fill="${C.red}" ${S2}/>
      <circle cx="17" cy="29" r="9" fill="${C.red}" ${S2}/>
      <circle cx="32" cy="33" r="8" fill="${C.magenta}" ${NS}/>
      <path d="M32 33 L41 22" stroke="${C.yellow}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="41" cy="21" r="3" fill="${C.yellow}" ${NS}/>`,

    butterflypea: `
      <circle cx="32" cy="18" r="9" fill="${C.blue}" ${S2}/>
      <circle cx="47" cy="29" r="9" fill="${C.blue}" ${S2}/>
      <circle cx="41" cy="46" r="9" fill="${C.blue}" ${S2}/>
      <circle cx="23" cy="46" r="9" fill="${C.blue}" ${S2}/>
      <circle cx="17" cy="29" r="9" fill="${C.blue}" ${S2}/>
      <circle cx="32" cy="33" r="7" fill="${C.sky}" ${NS}/>
      <circle cx="32" cy="33" r="3.5" fill="${C.yellow}" ${NS}/>`,

    lionsmane: `
      <path d="M16 30 C16 17 48 17 48 30 C48 38 45 43 45 49 C41 47 39 51 35 49 C33 53 31 49 28 51 C24 49 20 50 17 49 C18 43 16 38 16 30 Z" fill="${C.white}" ${S}/>
      <path d="M24 28 v9 M30 26 v11 M36 28 v9 M21 35 v7 M39 35 v7 M33 37 v6" stroke="${C.tan}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`,

    cauliflower: `
      <path d="M15 41 C9 45 8 53 14 55 C19 56 24 51 25 45 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M49 41 C55 45 56 53 50 55 C45 56 40 51 39 45 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 26 C16 18 26 13 31 17 C35 11 47 13 45 24 C54 24 55 36 47 39 C49 47 39 51 33 46 C28 51 18 48 19 39 C11 38 10 27 19 26 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="25" cy="24" r="3.2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>
      <circle cx="34" cy="22" r="3.4" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>
      <circle cx="42" cy="28" r="3.2" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>
      <circle cx="30" cy="30" r="3.4" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>
      <circle cx="38" cy="35" r="3" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>
      <circle cx="24" cy="35" r="3" fill="#FBF7EE" stroke="#2A2118" stroke-width="2"/>`,

    grass: `
      <path d="M32 56 C32 44 30 30 26 16 M32 56 C32 42 32 27 32 12 M32 56 C32 44 34 30 38 16 M32 56 C31 46 26 37 21 28 M32 56 C33 46 38 37 43 28" stroke="${C.green}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M20 56 H44" stroke="${C.brown}" stroke-width="4" stroke-linecap="round"/>`,

    pearl: `
      <circle cx="32" cy="36" r="18" fill="${C.white}" ${S}/>
      <circle cx="32" cy="36" r="18" fill="none" stroke="${C.pink}" stroke-width="2.5" opacity=".45"/>
      <ellipse cx="25" cy="29" rx="5" ry="3.5" transform="rotate(-30 25 29)" fill="${C.cream}" ${NS} opacity=".95"/>
      <circle cx="40" cy="44" r="2.5" fill="${C.sky}" ${NS} opacity=".5"/>`,

    jar: `
      <path d="M20 24 H44 V48 C44 53 39 56 32 56 C25 56 20 53 20 48 Z" fill="${C.cream}" ${S}/>
      <path d="M18 15 H46 V24 H18 Z" fill="${C.tan}" ${S}/>
      <path d="M32 33 L34 38 L39 38 L35 42 L37 47 L32 44 L27 47 L29 42 L25 38 L30 38 Z" fill="${C.orange}" ${S2}/>`,
    caramel: `
      <path d="M22 38 C20 46 24 55 32 56 C40 55 44 46 42 38 Z" fill="#C8853F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 13 H44 C48 13 51 16 51 20 V34 C51 38 48 41 44 41 H16 C12 41 9 38 9 34 V20 C9 16 12 13 16 13 Z" fill="#C8853F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 21 C22 18 28 23 36 20 C42 18 47 19 50 21" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M15 27 q8 -4 15 -1 M34 33 q7 -2 12 1" stroke="#F0C24F" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`,
    compote: `
      <path d="M12 34 H52 V40 C52 50 44 56 32 56 C20 56 12 50 12 40 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 34 C16 28 24 26 30 28 C36 24 46 26 48 32 C52 32 52 38 48 38 C44 42 38 38 34 40 C28 43 22 39 18 40 C14 40 12 36 14 34 Z" fill="#D9568C" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="24" cy="33" r="3" fill="#7B5AA6" stroke="none"/>
      <circle cx="38" cy="32" r="3" fill="#7B5AA6" stroke="none"/>`,
    greenspowder: `
      <path d="M13 39 C14 31 19 27 24 28 C25 22 33 21 35 26 C40 22 47 26 46 32 C51 32 52 39 50 39 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 39 H52 C51 49 43 55 31 55 C20 55 12 49 11 39 Z" fill="#A8C8E8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="22" cy="34" r="1.7" fill="#A4BE6C" stroke="none"/>
      <circle cx="31" cy="31" r="1.7" fill="#A4BE6C" stroke="none"/>
      <circle cx="40" cy="33" r="1.7" fill="#A4BE6C" stroke="none"/>
      <circle cx="27" cy="37" r="1.5" fill="#A4BE6C" stroke="none"/>
      <circle cx="36" cy="37" r="1.5" fill="#A4BE6C" stroke="none"/>`,
    astragalus: `
      <ellipse cx="30" cy="48" rx="17" ry="6.5" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="34" cy="40" rx="17" ry="6.5" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="30" cy="32" rx="17" ry="6.5" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="34" cy="24" rx="17" ry="6.5" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="32" cy="16" rx="17" ry="6.5" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="32" cy="16" rx="7.5" ry="2.8" fill="none" stroke="#8A5A3B" stroke-width="2.2"/>
      <ellipse cx="30" cy="32" rx="7.5" ry="2.8" fill="none" stroke="#8A5A3B" stroke-width="2.2"/>
      <ellipse cx="30" cy="48" rx="7.5" ry="2.8" fill="none" stroke="#5C4030" stroke-width="2.2"/>`,
    cistanche: `
      <path d="M32 6 C25 9 21 18 21 31 C21 45 25 56 32 59 C39 56 43 45 43 31 C43 18 39 9 32 6 Z" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 7 Q32 2 34 7" stroke="#5E8C4F" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M22 19 Q27 25 32 19 Q37 25 42 19" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 29 Q26.5 35 32 29 Q37.5 35 43 29" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 39 Q27 45 32 39 Q37 45 42 39" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 49 Q28 54 32 49 Q36 54 40 49" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    lucuma: `
      <path d="M14 30 C14 16 28 12 36 14 C50 18 54 36 44 48 C36 58 18 54 15 40 C14 36 14 33 14 30 Z" fill="#A4BE6C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 13 Q33 7 38 11" stroke="#5E8C4F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M22 22 C18 30 19 44 30 52 C40 48 46 36 44 26 C40 19 30 17 22 22 Z" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 26 C24 32 25 42 31 48 C38 45 41 36 40 29 C36 24 30 23 26 26 Z" fill="#E8893D" stroke="#2A2118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="33" cy="37" rx="5" ry="6" fill="#5C4030" stroke="#2A2118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    mesquite: `
      <path d="M8 46 C18 50 30 36 40 26 C48 18 54 14 58 16 C56 22 50 26 42 33 C30 43 20 56 10 53 C7 52 7 48 8 46 Z" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="15" cy="49" rx="3.4" ry="3" transform="rotate(-30 15 49)" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="24" cy="42" rx="3.4" ry="3" transform="rotate(-40 24 42)" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="33" cy="34" rx="3.4" ry="3" transform="rotate(-45 33 34)" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="42" cy="26" rx="3.4" ry="3" transform="rotate(-50 42 26)" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="50" cy="20" rx="3.2" ry="2.8" transform="rotate(-55 50 20)" fill="#8A5A3B" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    xylitol: `
      <path d="M12 32 L24 26 L36 32 L24 38 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <path d="M12 32 L12 46 L24 52 L24 38 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 32 L36 46 L24 52 L24 38 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 18 L44 12 L56 18 L42 24 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 18 L30 32 L42 38 L42 24 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <path d="M56 18 L56 32 L42 38 L42 24 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>`,
    peanutbutter: `
      <path d="M14 24 H40 V48 C40 53 35 56 27 56 C19 56 14 53 14 48 Z" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16 H42 V24 H12 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(27 39)">
      <path d="M0 -11 C7 -11 7 -3 3 -1 C7 1 7 11 0 11 C-7 11 -7 1 -3 -1 C-7 -3 -7 -11 0 -11 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M-3 -1 H3" stroke="#2A2118" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      </g>`,
    almondbutter: `
      <path d="M14 24 H40 V48 C40 53 35 56 27 56 C19 56 14 53 14 48 Z" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16 H42 V24 H12 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(27 40) rotate(-8)">
      <path d="M0 -14 C8 -8 8 9 0 14 C-8 9 -8 -8 0 -14 Z" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M0 -10 V11" stroke="#2A2118" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      </g>`,
    walnut: `
      <path d="M32 8 C17 8 8 20 8 33 C8 47 19 57 32 57 C45 57 56 47 56 33 C56 20 47 8 32 8 Z" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 10 V55" stroke="#2A2118" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 18 C15 22 19 28 25 28 C18 31 14 38 22 40 C16 43 19 49 26 50" fill="none" stroke="#8A5A3B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 18 C49 22 45 28 39 28 C46 31 50 38 42 40 C48 43 45 49 38 50" fill="none" stroke="#8A5A3B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 20 C32 24 31 27 28 29 M36 20 C32 24 33 27 36 29 M29 36 C32 39 31 42 28 45 M35 36 C32 39 33 42 36 45" fill="none" stroke="#8A5A3B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    oliveoil: `
      <path d="M21 16 H31 V22 C31 25 35 27 35 32 V53 C35 57 32 58 26 58 C20 58 17 57 17 53 V32 C17 27 21 25 21 22 Z" fill="#A4BE6C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 37 H35 V53 C35 57 32 58 26 58 C20 58 17 57 17 53 Z" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="20" y="10" width="12" height="7" rx="2" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="47" cy="46" rx="9" ry="9" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M46 39 Q49 30 57 30 Q55 39 48 41 Z" fill="#A4BE6C" stroke="#2A2118" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="44" cy="44" r="2.2" fill="#A4BE6C" stroke="none"/>`,
    ghee: `
      <path d="M15 27 H49 V50 C49 55 43 58 32 58 C21 58 15 55 15 50 Z" fill="#F0C24F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="32" cy="27" rx="17" ry="7" fill="#E8893D" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="32" cy="27" rx="10" ry="3.5" fill="#F0C24F" stroke="#2A2118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 26 a4 1.6 0 0 1 8 0" fill="none" stroke="#FBF7EE" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
      <path d="M22 45 Q27 41 32 45 T42 45" stroke="#E8893D" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    charcoal: `
      <path d="M12 44 C12 38 52 38 52 44 L49 54 C48 58 16 58 15 54 Z" fill="#5C4030" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 44 C16 30 24 26 32 26 C40 26 48 30 52 44 C52 49 12 49 12 44 Z" fill="#2A2118" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 38 h.01 M33 33 h.01 M40 39 h.01 M30 42 h.01" stroke="#5C4030" stroke-width="3.5" stroke-linecap="round"/>`,
    organs: `
      <g transform="rotate(-32 26 26)">
      <rect x="12" y="12" width="26" height="28" rx="13" fill="#F0A284" stroke="#2A2118" stroke-width="3"/>
      <path d="M12 26 H38 V27 C38 34 32 40 25 40 C18 40 12 34 12 27 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="3"/>
      <path d="M22 32 h.01 M30 33 h.01" stroke="#D9B98C" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <g transform="rotate(24 40 40)">
      <rect x="28" y="26" width="26" height="28" rx="13" fill="#F0A284" stroke="#2A2118" stroke-width="3"/>
      <path d="M28 40 H54 V41 C54 48 48 54 41 54 C34 54 28 48 28 41 Z" fill="#D8503C" stroke="#2A2118" stroke-width="3"/>
      <path d="M38 46 h.01 M46 47 h.01" stroke="#F0A284" stroke-width="2.5" stroke-linecap="round"/>
      </g>`,
    pie: `
      <ellipse cx="32" cy="39" rx="27" ry="18" fill="#C68A4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 39 Q7 33 11 36 Q14 30 19 35 Q23 29 28 34 Q32 28 36 34 Q41 29 45 35 Q50 30 53 36 Q57 33 59 39" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="32" cy="37" rx="18" ry="11" fill="#D9B98C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 31 L25 43 M32 29 L32 45 M39 31 L39 43" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
      <path d="M18 33 L46 33 M16 37 L48 37 M18 41 L46 41" stroke="#8A5A3B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>`,
    camu: `
      <path d="M32 36 Q32 18 39 11" stroke="#5C4030" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M39 11 Q49 7 52 16 Q43 19 39 11 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 12 Q45 13 50 15" stroke="#2A2118" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>
      <circle cx="30" cy="39" r="18" fill="#D8503C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 31 Q25 27 29 30" stroke="#F2A7BB" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".75"/>`,
    mucuna: `
      <path d="M16 12 C10 33 23 51 46 50 C52 49.5 52 43 46 43 C30 45 22 31 23 14 C23 8 16.5 7 16 12 Z" fill="#7A4A2E" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 24 Q29 30 27 36 M32 33 Q36 39 34 45" stroke="#4A2E1C" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="M15 18 l-4 -2 M15 27 l-5 0 M19 36 l-5 2 M27 45 l-3 4 M37 49 l-1 5 M46 46 l3 3" stroke="#C68A4F" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    dulse: `
      <path d="M28 58 C27 50 26 44 26 40 C20 42 14 36 16 26 C17 20 22 16 27 16 C26 22 28 28 30 32 C29 24 30 14 33 8 C37 14 37 24 35 32 C38 26 44 22 49 25 C50 35 42 42 35 40 C35 46 34 52 33 58 Z" fill="#9E3A52" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 36 C30 44 31 51 31 57 M30 36 C27 33 24 30 22 26 M31 34 C33 30 35 27 36 23" stroke="#6E2438" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`,
    reishi: `
      <path d="M12 33 C12 18 38 14 51 22 C59 27 58 38 47 40 C39 41 26 41 19 40 C14 39 12 37 12 33 Z" fill="#9A3B28" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 22 C57 25 56 35 48 38" fill="none" stroke="#F0C24F" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <path d="M16 31 Q33 22 49 29 M16 36 Q33 29 48 35" stroke="#D08A55" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M28 40 C28 47 27 53 25 58 H34 C33 52 33 46 33 40 Z" fill="#7A2E1E" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    turkeytail: `
      <path d="M8 50 A24 24 0 0 1 56 50 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13 50 A19 19 0 0 1 51 50 Z" fill="#D9B98C" stroke="none"/>
      <path d="M18 50 A14 14 0 0 1 46 50 Z" fill="#9A3B28" stroke="none"/>
      <path d="M23 50 A9 9 0 0 1 41 50 Z" fill="#F6EDD8" stroke="none"/>
      <path d="M27.5 50 A4.5 4.5 0 0 1 36.5 50 Z" fill="#8A5A3B" stroke="none"/>
      <path d="M32 50 L14 41 M32 50 L24 30 M32 50 L32 26 M32 50 L40 30 M32 50 L50 41" stroke="#2A2118" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".4"/>
      <path d="M8 50 A24 24 0 0 1 56 50 Z" fill="none" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    mushroomblend: `
      <path d="M33 35 C33 45 32 51 31 58 H40 C39 51 38 45 38 35 Z" fill="#F6EDD8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 30 C21 19 49 19 49 30 Q49 35 42 35 H28 Q21 35 21 30 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M29 26 h.01 M39 24 h.01" stroke="#F6EDD8" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M15 44 C15 50 14 54 13 58 H21 C20 54 20 50 20 44 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 40 C7 32 28 32 28 40 Q28 43 23 43 H12 Q7 43 7 40 Z" fill="#9A3B28" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    glaze: `
      <path d="M13 26 C13 20 19 18 32 18 C45 18 51 20 51 26 C51 30 48 31 47 35 C46 40 42 40 42 34 C41 41 36 41 35 34 C34 41 29 41 28 34 C27 40 22 40 21 34 C20 39 16 38 17 32 C14 31 13 29 13 26 Z" fill="#D8503C" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 24 Q32 21 43 24" stroke="#FBF7EE" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M25 29 h.01 M39 28 h.01" stroke="#FBF7EE" stroke-width="2.5" stroke-linecap="round" opacity=".4"/>`,
    blackberry: `
      <path d="M32 17 C29 10 24 8 19 10 M32 17 C35 10 40 8 45 10" fill="#5E8C4F" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="#3A2A4A" stroke="#2A2118" stroke-width="2.4" stroke-linejoin="round">
      <circle cx="25" cy="25" r="6.8"/>
      <circle cx="39" cy="25" r="6.8"/>
      <circle cx="32" cy="22" r="6.8"/>
      <circle cx="23" cy="35" r="6.8"/>
      <circle cx="41" cy="35" r="6.8"/>
      <circle cx="32" cy="34" r="7"/>
      <circle cx="28" cy="45" r="6"/>
      <circle cx="36" cy="45" r="6"/>
      <circle cx="32" cy="53" r="5.4"/>
      </g>`,
    shot: `
      <rect x="26" y="6" width="12" height="6" rx="1.5" fill="#E8893D" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M26 12 H38 V18 C38 21 40 23 40 27 V52 C40 56 37 58 32 58 C27 58 24 56 24 52 V27 C24 23 26 21 26 18 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 33 H40 V52 C40 56 37 58 32 58 C27 58 24 56 24 52 Z" fill="#E8893D" stroke="none"/>
      <path d="M24 33 H40" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>
      <rect x="27" y="37" width="10" height="9" rx="1.5" fill="#FBF7EE" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>`,
    silica: `
      <path d="M27 5 C22.5 5 22.5 12 27 12 H37 C41.5 12 41.5 5 37 5 Z" fill="#A8C8E8" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="28" y="11.5" width="8" height="6" fill="#5C4030" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 17 H42 V52 C42 56 38 58 32 58 C26 58 22 56 22 52 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 33 H41 V52 C41 56 37 57.5 32 57.5 C27 57.5 23 56 23 52 Z" fill="#A8C8E8" stroke="none"/>
      <path d="M23 33 H41" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>`,
    multivitamin: `
      <path d="M27 5 C22.5 5 22.5 12 27 12 H37 C41.5 12 41.5 5 37 5 Z" fill="#E8893D" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="28" y="11.5" width="8" height="6" fill="#5C4030" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 17 H42 V52 C42 56 38 58 32 58 C26 58 22 56 22 52 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 31 H41 V52 C41 56 37 57.5 32 57.5 C27 57.5 23 56 23 52 Z" fill="#F0C24F" stroke="none"/>
      <path d="M23 31 H41" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>
      <circle cx="29" cy="41" r="2.2" fill="#D8503C" stroke="#2A2118" stroke-width="1.4"/>
      <circle cx="35" cy="45" r="2.2" fill="#5E8C4F" stroke="#2A2118" stroke-width="1.4"/>
      <circle cx="30" cy="50" r="2" fill="#4F7BC0" stroke="#2A2118" stroke-width="1.4"/>`,
    fulvic: `
      <path d="M27 5 C22.5 5 22.5 12 27 12 H37 C41.5 12 41.5 5 37 5 Z" fill="#8A5A3B" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="28" y="11.5" width="8" height="6" fill="#5C4030" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 17 H42 V52 C42 56 38 58 32 58 C26 58 22 56 22 52 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 33 H41 V52 C41 56 37 57.5 32 57.5 C27 57.5 23 56 23 52 Z" fill="#4A3A2E" stroke="none"/>
      <path d="M23 33 H41" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>`,
    beautydrops: `
      <path d="M27 5 C22.5 5 22.5 12 27 12 H37 C41.5 12 41.5 5 37 5 Z" fill="#5E8C4F" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="28" y="11.5" width="8" height="6" fill="#5C4030" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 17 H42 V52 C42 56 38 58 32 58 C26 58 22 56 22 52 Z" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23 33 H41 V52 C41 56 37 57.5 32 57.5 C27 57.5 23 56 23 52 Z" fill="#5E8C4F" stroke="none"/>
      <path d="M23 33 H41" stroke="#2A2118" stroke-width="2" stroke-linecap="round"/>`,
    serum: `
      <path d="M32 8 C39 22 48 30 48 40 A16 16 0 0 1 16 40 C16 30 25 22 32 8 Z" fill="#F2A7BB" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M25 39 Q25 46 31 49" stroke="#FBF7EE" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <circle cx="38" cy="35" r="2.2" fill="#FBF7EE" stroke="none" opacity=".55"/>`,
    pillbottle: `
      <rect x="23" y="9" width="18" height="7" rx="2" fill="#D8503C" stroke="#2A2118" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="20" y="16" width="24" height="40" rx="4" fill="#FBF7EE" stroke="#2A2118" stroke-width="3" stroke-linejoin="round"/>
      <rect x="23" y="27" width="18" height="20" rx="2" fill="#F2A7BB" stroke="#2A2118" stroke-width="2" stroke-linejoin="round"/>
      <g transform="translate(32 37) rotate(-28)">
      <rect x="-7" y="-3.2" width="14" height="6.4" rx="3.2" fill="#FBF7EE" stroke="#2A2118" stroke-width="1.8"/>
      <path d="M0 -3.2 H6.4 A3.2 3.2 0 0 1 6.4 3.2 H0 Z" fill="#E8893D" stroke="#2A2118" stroke-width="1.8" stroke-linejoin="round"/>
      </g>`,
    fish: `
      <path d="M10 33 C16 23 32 22 42 32 C32 42 16 43 10 33 Z" fill="#A8C8E8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M41 32 L53 24 L51 33 L54 42 L41 34 Z" fill="#A8C8E8" stroke="#2A2118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 25 Q31 33 28 41" stroke="#2A2118" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="30" r="2" fill="#2A2118" stroke="none"/>`,
  };

  /* keyword → icon. First match wins, so specific rules go first. */
  const RULES = [
    [/almond butter|peanut butter|cashew butter|nut butter|tahini|seed butter/, 'nutbutter'],
    [/sesame/, 'sesame'],
    [/yerba|\bmate\b/, 'mate'],
    [/gorgie|energy drink|de soi|spritz/, 'can'],
    [/kin high rhode|high rhode|kombucha/, 'bottle'],
    [/magic mind/, 'bottle'],
    [/ginkgo/, 'ginkgo'],
    [/hibiscus/, 'hibiscus'],
    [/butterfly pea/, 'butterflypea'],
    [/lion.?s mane/, 'lionsmane'],
    [/cauliflower/, 'cauliflower'],
    [/wheatgrass|barley grass/, 'grass'],
    [/\bpearl\b/, 'pearl'],
    [/fulvic|ion gut|sakara|beauty drops|mary ruth|multivitamin|\bsilica\b/, 'dropper'],
    [/novos|nad\+?|beef organs|\borgans\b/, 'capsule'],
    [/almond milk|oat ?milk|coconut milk|macadamia milk|cashew milk|hemp milk|malk|eggnog|\bnog\b|\bmilk\b/, 'carton'],
    [/coconut water/, 'coconutWater'],
    [/coconut cream|cream of coconut|coconut butter/, 'coconutcream'],
    [/coconut flakes|shredded coconut|desiccated coconut/, 'coconutflakes'],
    [/coconut meat/, 'coconut'],
    [/kefir/, 'kefir'],
    [/coconut yogurt|cocojune|yogurt|labneh/, 'yogurt'],
    [/coconut/, 'coconut'],
    [/strawberr/, 'strawberry'],
    [/banana/, 'banana'],
    [/mango/, 'mango'],
    [/pineapple/, 'pineapple'],
    [/blueberr|blackberr|huckleberr/, 'blueberry'],
    [/raspberr/, 'raspberry'],
    [/cherry|cherries/, 'cherry'],
    [/date syrup|maple syrup|maple/, 'maple'],
    [/\bdates?\b|deglet|medjool/, 'date'],
    [/peach|nectarine|apricot/, 'peach'],
    [/dragon ?fruit|pitaya/, 'dragonfruit'],
    [/watermelon/, 'watermelon'],
    [/\bapple\b/, 'apple'],
    [/lemon|yuzu/, 'lemon'],
    [/\blime\b/, 'lime'],
    [/orange|tangerine|mandarin|clementine/, 'orange'],
    [/avocado/, 'avocado'],
    [/\bfigs?\b/, 'fig'],
    [/almond/, 'almond'],
    [/cold ?brew|espresso|coffee/, 'coffee'],
    [/matcha|green tea/, 'matcha'],
    [/spirulina|blue majik|majik|blue.?green algae|e3.?live|blue algae/, 'spirulina'],
    [/chlorella|chlorophyll|wheatgrass|barley grass/, 'chlorella'],
    [/spinach|moringa|greens/, 'spinach'],
    [/\bkale\b|collard/, 'kale'],
    [/\bmint\b|basil/, 'mint'],
    [/maca|lucuma|mesquite|burdock/, 'maca'],
    [/cacao|cocoa|chocolate|carob/, 'cacao'],
    [/vanilla/, 'vanilla'],
    [/cinnamon/, 'cinnamon'],
    [/turmeric/, 'turmeric'],
    [/ginger/, 'ginger'],
    [/sea ?moss|irish moss|kelp|algae/, 'seamoss'],
    [/peppercorn/, 'peppercorn'],
    [/sprinkle|confetti|nonpareil/, 'sprinkles'],
    [/pollen|propolis/, 'beepollen'],
    [/honey|manuka/, 'honey'],
    [/agave/, 'agave'],
    [/chia/, 'chia'],
    [/hemp/, 'hemp'],
    [/flax|pumpkin seed|sunflower seed/, 'flax'],
    [/ashwagandha|ginseng|rhodiola|astragalus/, 'ashwagandha'],
    [/stevia|monk ?fruit|xylitol|erythritol|allulose|ginkgo/, 'stevia'],
    [/probiotic|prebiotic|enzyme|organs|immunomilk|liver/, 'probiotic'],
    [/gold|shimmer/, 'sparkle'],
    [/hyaluronic|glow|skin|beauty|silica|pearl|holi.?mane/, 'glowdrop'],
    [/reishi|chaga|lion.?s mane|cordyceps|mushroom|shilajit|turkey tail|four sigmatic|gut health/, 'mushroom'],
    [/pomegranate/, 'pomegranate'],
    [/goji|camu|acerola|schisandra|buckthorn/, 'goji'],
    [/elderberr|aronia/, 'elderberry'],
    [/a[çc]a[íi]/, 'acai'],
    [/\boats?\b|oatmeal/, 'oats'],
    [/granola|cereal|cookie|graham/, 'granola'],
    [/\bice\b|frozen/, 'ice'],
    [/salt/, 'salt'],
    [/\bmct\b|\boils?\b|ghee|omega/, 'oil'],
    [/aloe/, 'aloe'],
    [/lavender|butterfly pea|rose|hibiscus/, 'lavender'],
    [/graviola|soursop|guanabana|noni/, 'graviola'],
    [/pea protein|chocho|cho ?cho|lupin/, 'pea'],
    [/walnut|pecan|pistachio|cashew|macadamia/, 'almond'],
    [/electrolyte|ionic minerals|trace minerals/, 'salt'],
    [/dandy blend|dandelion/, 'coffee'],
    [/peppermint/, 'mint'],
    [/celery/, 'celery'],
    [/parsley|arugula|cilantro|herbs/, 'spinach'],
    [/carrot/, 'carrot'],
    [/cayenne|chili|chilli|chile/, 'chili'],
    [/mucuna|cistanche|shatavari|astragalus/, 'ashwagandha'],
    [/fulvic|tincture|gut support|longevity|multivitamin|mental performance|liquid|drops/, 'oil'],
    [/pumpkin spice|holiday spice|nutmeg|allspice/, 'cinnamon'],
    [/pumpkin/, 'pumpkin'],
    [/beet/, 'beet'],
    [/kombucha|spritz|cola|yerba|mate\b|high rhode|energy drink/, 'juice'],
    [/\brice\b|lundberg/, 'rice'],
    [/crust|graham|\bpie\b/, 'crust'],
    [/passion ?fruit|maracuy|guava|lilikoi/, 'mango'],
    [/saffron/, 'saffron'],
    [/kiwi/, 'lime'],
    [/tropical/, 'pineapple'],
    [/soft serve/, 'softserve'],
    [/cream top|whip/, 'dollop'],
    [/bcaa|nad\+?\b|amino/, 'scoop'],
    [/collagen|protein|tocos|tocotrienol|colostrum|creatine|whey|powder/, 'scoop'],
    [/juice|nectar/, 'juice'],
    [/water|coconut h2o/, 'waterdrop'],
    [/syrup|caramel|sweetener/, 'honey'],
    [/berr/, 'blueberry'],
  ];

  function matchIcon(ingredient) {
    const s = String(ingredient).toLowerCase();
    for (const [re, key] of RULES) if (re.test(s)) return key;
    return 'jar';
  }

  function iconSVG(key, label, cls) {
    const inner = ICONS[key] || ICONS.jar;
    const aria = label ? `role="img" aria-label="${String(label).replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
    return `<svg viewBox="0 0 64 64" class="wob ${cls || 'icon'}" ${aria}>${inner}</svg>`;
  }

  /* The specimen itself: a to-go cup with dome lid + straw, tinted per smoothie. */
  function cupSVG(color, colorDark, label, cls) {
    const aria = label ? `role="img" aria-label="${String(label).replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
    return `<svg viewBox="0 0 64 80" class="wob ${cls || 'cup'}" ${aria}>
      <path d="M40 4 L34.5 24" stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M40 4 L34.5 24" stroke="${C.cream}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3.5 4.5"/>
      <path d="M17 24 A15 14 0 0 1 47 24" fill="${color}" ${S} opacity=".55"/>
      <rect x="13" y="23" width="38" height="6" rx="3" fill="${C.cream}" ${S}/>
      <path d="M17 29 L22 74 H42 L47 29 Z" fill="${color}" ${S}/>
      <path d="M19.5 44 Q27 39 32 44 T44.5 44" stroke="${colorDark}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M20.5 56 Q27 52 32 56 T43.5 56" stroke="${colorDark}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M22 34 Q22 50 24 68" stroke="${C.white}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>
    </svg>`;
  }

  window.ArchiveIcons = { ICONS, matchIcon, iconSVG, cupSVG, PALETTE: C };
})();
