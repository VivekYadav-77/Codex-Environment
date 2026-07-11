// Phase 10-13 Step Generators for AlgorithmViewer
// Each generator takes an input (array, string, etc) and returns an array of steps

// ─── Phase 10: Advanced Algorithms ─────────────────────────────────────────

const sweepLineGenerator = (arr) => {
    const steps = []
    // Treat arr as [start, end] pairs: e.g. [1,4,2,6,8,10] → pairs [[1,4],[2,6],[8,10]]
    const n = arr.length
    const intervals = []
    for (let i = 0; i + 1 < n; i += 2) {
        intervals.push([arr[i], arr[i + 1] > arr[i] ? arr[i + 1] : arr[i] + 3])
    }
    if (intervals.length === 0) {
        intervals.push([1, 5], [3, 8], [6, 10])
    }

    const events = []
    for (const [s, e] of intervals) {
        events.push([s, 1])
        events.push([e, -1])
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1])

    steps.push({
        array: intervals.map(iv => iv[0]),
        message: `Sweep Line: ${intervals.length} intervals. Creating events from start/end points.`,
        comparing: [],
        sorted: [],
        swapping: [],
    })

    let count = 0
    let maxCount = 0
    for (let i = 0; i < events.length; i++) {
        const [x, delta] = events[i]
        count += delta
        maxCount = Math.max(maxCount, count)
        steps.push({
            array: events.map(e => e[0]),
            comparing: [i],
            swapping: [],
            sorted: count > 0 ? [i] : [],
            message: `x=${x}: ${delta > 0 ? 'START' : 'END'} event → active count = ${count} (peak so far: ${maxCount})`,
        })
    }

    steps.push({
        array: intervals.map(iv => iv[0]),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: intervals.length }, (_, i) => i),
        message: `Sweep complete. Maximum simultaneous intervals = ${maxCount}.`,
    })

    return steps
}

const meetInTheMiddleGenerator = (arr) => {
    const steps = []
    const n = Math.min(arr.length, 8)
    const input = arr.slice(0, n)
    const target = Math.floor(input.reduce((a, b) => a + b, 0) / 2)
    const mid = Math.floor(n / 2)
    const left = input.slice(0, mid)
    const right = input.slice(mid)

    steps.push({
        array: input,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Meet in the Middle: arr=[${input}], target=${target}. Splitting at index ${mid}.`,
    })

    // Enumerate left sums
    const leftSums = [0]
    for (const x of left) {
        const prev = [...leftSums]
        for (const s of prev) leftSums.push(s + x)
        steps.push({
            array: input,
            comparing: Array.from({ length: mid }, (_, i) => i),
            swapping: [],
            sorted: [],
            message: `Left half sums so far: [${leftSums.join(', ')}]`,
        })
    }

    // Sort right sums
    const rightSums = [0]
    for (const x of right) {
        const prev = [...rightSums]
        for (const s of prev) rightSums.push(s + x)
    }
    rightSums.sort((a, b) => a - b)

    steps.push({
        array: input,
        comparing: Array.from({ length: n - mid }, (_, i) => mid + i),
        swapping: [],
        sorted: [],
        message: `Right half sums (sorted): [${rightSums.join(', ')}]`,
    })

    // Binary search for complement
    let found = false
    for (const s of leftSums) {
        const need = target - s
        if (rightSums.includes(need)) {
            found = true
            steps.push({
                array: input,
                comparing: [],
                swapping: [],
                sorted: Array.from({ length: n }, (_, i) => i),
                message: `Found! Left sum ${s} + right sum ${need} = target ${target}. ✓`,
            })
            break
        }
    }

    if (!found) {
        steps.push({
            array: input,
            comparing: [],
            swapping: [],
            sorted: [],
            message: `No subset found summing to ${target}. (Target not reachable.)`,
        })
    }

    return steps
}

const lazyPropagationGenerator = (arr) => {
    const steps = []
    const n = Math.min(arr.length, 8)
    const array = arr.slice(0, n).map(v => Math.abs(v) % 20 + 1)

    steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Lazy Seg Tree: array=[${array}]. Build sum segment tree.`,
    })

    // Show tree structure conceptually
    const prefix = [0]
    for (const v of array) prefix.push(prefix[prefix.length - 1] + v)

    steps.push({
        array: prefix.slice(1),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Prefix sums (tree built): [${prefix.slice(1).join(', ')}]. Range sum [l,r] = prefix[r]-prefix[l-1].`,
    })

    // Range update: add 5 to indices 0..mid
    const mid = Math.floor(n / 2)
    const updateVal = 5
    const updated = [...array]
    for (let i = 0; i <= mid; i++) updated[i] += updateVal

    steps.push({
        array: [...array],
        comparing: Array.from({ length: mid + 1 }, (_, i) => i),
        swapping: [],
        sorted: [],
        message: `Lazy update: add ${updateVal} to range [0, ${mid}]. Mark node LAZY — do NOT update children yet.`,
    })

    steps.push({
        array: updated,
        comparing: [],
        swapping: Array.from({ length: mid + 1 }, (_, i) => i),
        sorted: [],
        message: `Lazy pushed down on demand. After push: [${updated.join(', ')}]. Each element in [0,${mid}] now += ${updateVal}.`,
    })

    // Range sum query
    const querySum = updated.reduce((a, b) => a + b, 0)
    steps.push({
        array: updated,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        message: `Range sum query [0, ${n - 1}] = ${querySum}. Lazy propagation saved O(n) updates — only O(log n) nodes touched.`,
    })

    return steps
}

const rabinKarpGenerator = (arr) => {
    const steps = []
    const text = arr.slice(0, 8).map(v => String.fromCharCode(97 + (Math.abs(v) % 6))).join('')
    const pattern = text.slice(0, 3)
    const BASE = 31, MOD = 1e9 + 7

    steps.push({
        array: text.split('').map(c => c.charCodeAt(0) - 96),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Rabin-Karp: text="${text}", pattern="${pattern}". Base=${BASE}, Mod=${MOD}.`,
    })

    // Compute pattern hash
    let patHash = 0
    for (let i = 0; i < pattern.length; i++) {
        patHash = (patHash * BASE + pattern.charCodeAt(i)) % MOD
    }

    steps.push({
        array: text.split('').map(c => c.charCodeAt(0) - 96),
        comparing: Array.from({ length: pattern.length }, (_, i) => i),
        swapping: [],
        sorted: [],
        message: `Pattern hash("${pattern}") = ${patHash.toFixed(0)}. Now slide window across text.`,
    })

    let windowHash = 0
    const m = pattern.length
    const n = text.length
    let power = 1
    for (let i = 0; i < m - 1; i++) power = (power * BASE) % MOD

    for (let i = 0; i < m; i++) {
        windowHash = (windowHash * BASE + text.charCodeAt(i)) % MOD
    }

    for (let i = 0; i <= n - m; i++) {
        const isMatch = windowHash === patHash && text.slice(i, i + m) === pattern
        steps.push({
            array: text.split('').map(c => c.charCodeAt(0) - 96),
            comparing: Array.from({ length: m }, (_, j) => i + j),
            swapping: [],
            sorted: isMatch ? Array.from({ length: m }, (_, j) => i + j) : [],
            message: `Window[${i}..${i + m - 1}]="${text.slice(i, i + m)}" hash=${windowHash.toFixed(0)}${isMatch ? ' ← MATCH FOUND!' : ' ≠ pattern hash'}`,
        })

        if (i < n - m) {
            windowHash = (windowHash - text.charCodeAt(i) * power % MOD + MOD) % MOD
            windowHash = (windowHash * BASE + text.charCodeAt(i + m)) % MOD
        }
    }

    steps.push({
        array: text.split('').map(c => c.charCodeAt(0) - 96),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        message: `Rabin-Karp complete. Rolling hash avoids re-computing full hash each step → O(n+m) average.`,
    })

    return steps
}

const zAlgorithmGenerator = (arr) => {
    const steps = []
    const text = arr.slice(0, 8).map(v => String.fromCharCode(97 + (Math.abs(v) % 4))).join('')
    const s = text

    steps.push({
        array: s.split('').map(c => c.charCodeAt(0) - 96),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Z-Algorithm on "${s}". Z[i] = length of longest prefix match starting at position i.`,
    })

    const n = s.length
    const z = new Array(n).fill(0)
    z[0] = n
    let l = 0, r = 0

    for (let i = 1; i < n; i++) {
        if (i < r) z[i] = Math.min(r - i, z[i - l])
        while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++
        if (i + z[i] > r) { l = i; r = i + z[i] }

        steps.push({
            array: z.map(v => v || 0),
            comparing: [i],
            swapping: z[i] > 0 ? [i] : [],
            sorted: z[i] === n - i ? [i] : [],
            message: `Z[${i}]=${z[i]}: "${s.slice(i, i + z[i])}" matches prefix "${s.slice(0, z[i])}"${z[i] > 0 ? ` (Z-box [${l},${r}])` : ''}`,
        })
    }

    const maxZ = Math.max(...z.slice(1))
    steps.push({
        array: z,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        message: `Z-array complete: [${z.join(', ')}]. Max Z value = ${maxZ}. Use for pattern matching in O(n).`,
    })

    return steps
}

const manacherGenerator = (arr) => {
    const steps = []
    const raw = arr.slice(0, 6).map(v => String.fromCharCode(97 + (Math.abs(v) % 4))).join('')
    const s = raw
    const t = '#' + s.split('').join('#') + '#'

    steps.push({
        array: s.split('').map(c => c.charCodeAt(0) - 96),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Manacher's: input="${s}". Transform to "${t}" (# separators handle even palindromes).`,
    })

    const n = t.length
    const p = new Array(n).fill(0)
    let c = 0, rBound = 0

    for (let i = 0; i < n; i++) {
        const mirror = 2 * c - i
        if (i < rBound) p[i] = Math.min(rBound - i, p[mirror])
        while (i + p[i] + 1 < n && i - p[i] - 1 >= 0 && t[i + p[i] + 1] === t[i - p[i] - 1]) p[i]++
        if (i + p[i] > rBound) { c = i; rBound = i + p[i] }

        steps.push({
            array: p.filter((_, idx) => idx % 2 === 1),
            comparing: [Math.floor(i / 2)],
            swapping: p[i] > 1 ? [Math.floor(i / 2)] : [],
            sorted: [],
            message: `Center ${i} ("${t[i]}"): p[${i}]=${p[i]}. Palindrome radius = ${p[i]}. Z-box center=${c}, right=${rBound}.`,
        })
    }

    const maxP = Math.max(...p)
    const ci = p.indexOf(maxP)
    const start = (ci - maxP) / 2
    const longest = s.substring(start, start + maxP)

    steps.push({
        array: p.filter((_, i) => i % 2 === 1),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: Math.ceil(n / 2) }, (_, i) => i),
        message: `Done! Longest palindrome = "${longest}" (length ${maxP}) at index ${start}. O(n) total.`,
    })

    return steps
}

const suffixArrayGenerator = (arr) => {
    const steps = []
    const s = arr.slice(0, 6).map(v => String.fromCharCode(97 + (Math.abs(v) % 6))).join('') + '$'

    steps.push({
        array: s.split('').map(c => c.charCodeAt(0) - 96),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Suffix Array: string="${s}". Sort all ${s.length} suffixes lexicographically.`,
    })

    const n = s.length
    const suffixes = Array.from({ length: n }, (_, i) => i)

    steps.push({
        array: suffixes,
        comparing: Array.from({ length: n }, (_, i) => i),
        swapping: [],
        sorted: [],
        message: `Initial suffix indices: [${suffixes}]. Now sort by suffix string.`,
    })

    const sa = suffixes.sort((a, b) => s.slice(a).localeCompare(s.slice(b)))

    for (let i = 0; i < sa.length; i++) {
        steps.push({
            array: sa,
            comparing: [i],
            swapping: [],
            sorted: Array.from({ length: i + 1 }, (_, j) => j),
            message: `SA[${i}]=${sa[i]}: suffix "${s.slice(sa[i])}"`,
        })
    }

    // LCP array
    const rank = new Array(n)
    for (let i = 0; i < n; i++) rank[sa[i]] = i
    const lcp = new Array(n).fill(0)
    let h = 0
    for (let i = 0; i < n; i++) {
        if (rank[i] > 0) {
            const j = sa[rank[i] - 1]
            while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++
            lcp[rank[i]] = h
            if (h > 0) h--
        }
    }

    steps.push({
        array: lcp,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        message: `LCP array: [${lcp}]. Max LCP = ${Math.max(...lcp)} → longest repeated substring.`,
    })

    return steps
}

// ─── Phase 11: Advanced Data Structures ────────────────────────────────────

const intervalTreeGenerator = (arr) => {
    const steps = []
    const n = Math.min(arr.length, 6)
    const intervals = []
    for (let i = 0; i < n; i++) {
        const start = Math.abs(arr[i]) % 10
        intervals.push([start, start + 2 + (i % 3)])
    }

    steps.push({
        array: intervals.map(iv => iv[0]),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Interval Tree: ${intervals.length} intervals = [${intervals.map(iv => `[${iv}]`).join(', ')}].`,
    })

    // Build order (sorted by start)
    const sorted = [...intervals].sort((a, b) => a[0] - b[0])
    const maxRights = []
    let maxRight = 0
    for (const iv of sorted) {
        maxRight = Math.max(maxRight, iv[1])
        maxRights.push(maxRight)
    }

    for (let i = 0; i < sorted.length; i++) {
        steps.push({
            array: sorted.map(iv => iv[1]),
            comparing: [i],
            swapping: [],
            sorted: Array.from({ length: i }, (_, j) => j),
            message: `Insert [${sorted[i]}] into tree. maxRight in subtree = ${maxRights[i]}. Used to prune queries.`,
        })
    }

    // Query
    const lo = 3, hi = 7
    const overlapping = sorted.filter(iv => iv[0] <= hi && lo <= iv[1])
    steps.push({
        array: sorted.map(iv => iv[0]),
        comparing: Array.from({ length: sorted.length }, (_, i) => i).filter(i => sorted[i][0] <= hi && lo <= sorted[i][1]),
        swapping: [],
        sorted: Array.from({ length: sorted.length }, (_, i) => i).filter(i => sorted[i][0] <= hi && lo <= sorted[i][1]),
        message: `Query [${lo},${hi}]: ${overlapping.length} overlapping intervals = [${overlapping.map(iv => `[${iv}]`).join(', ')}]. Used maxRight to prune.`,
    })

    return steps
}

const orderStatisticTreeGenerator = (arr) => {
    const steps = []
    const sorted = [...arr.slice(0, 8)].sort((a, b) => a - b)

    steps.push({
        array: sorted,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Order Statistic Tree: ${sorted.length} elements. Each node stores subtree size for O(log n) rank/select.`,
    })

    const sizes = sorted.map((_, i) => i + 1)
    for (let i = 0; i < sorted.length; i++) {
        steps.push({
            array: sizes,
            comparing: [i],
            swapping: [],
            sorted: Array.from({ length: i + 1 }, (_, j) => j),
            message: `Node ${sorted[i]}: size = ${sizes[i]} (includes itself + all left-subtree nodes).`,
        })
    }

    // Select k=3
    const k = 3
    const kth = sorted[k - 1]
    steps.push({
        array: sorted,
        comparing: [k - 1],
        swapping: [],
        sorted: Array.from({ length: k }, (_, i) => i),
        message: `select(${k}): k-th smallest = ${kth}. Left subtree size guides: if k ≤ left.size, go left; else k -= left.size+1, go right.`,
    })

    // Rank query
    const queryVal = sorted[Math.floor(sorted.length / 2)]
    const rank = sorted.indexOf(queryVal) + 1
    steps.push({
        array: sorted,
        comparing: [rank - 1],
        swapping: [],
        sorted: Array.from({ length: rank }, (_, i) => i),
        message: `rank(${queryVal}) = ${rank}. That many elements are ≤ ${queryVal} in the tree. O(log n) query.`,
    })

    return steps
}

const bloomFilterGenerator = (arr) => {
    const steps = []
    const m = 16 // bit array size
    const k = 3  // hash functions
    const bits = new Array(m).fill(0)

    const hash = (x, seed) => {
        let h = seed * 37 + x
        h = ((h ^ (h >> 16)) * 0x45d9f3b) & 0x7fffffff
        return ((h % m) + m) % m
    }

    const items = arr.slice(0, 4).map(v => Math.abs(v) % 100 + 1)

    steps.push({
        array: new Array(m).fill(0),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Bloom Filter: ${m} bits, ${k} hash functions. Inserting ${items.length} items: [${items}].`,
    })

    for (const item of items) {
        const positions = Array.from({ length: k }, (_, i) => hash(item, i))
        for (const pos of positions) bits[pos] = 1

        steps.push({
            array: [...bits],
            comparing: positions,
            swapping: positions,
            sorted: bits.map((b, i) => b ? i : -1).filter(i => i >= 0),
            message: `Insert ${item}: hash positions [${positions.join(', ')}] set to 1. (${bits.filter(Boolean).length}/${m} bits set)`,
        })
    }

    // Query existing
    const query1 = items[0]
    const pos1 = Array.from({ length: k }, (_, i) => hash(query1, i))
    const hit1 = pos1.every(p => bits[p])
    steps.push({
        array: [...bits],
        comparing: pos1,
        swapping: [],
        sorted: hit1 ? pos1 : [],
        message: `Query(${query1}): check bits [${pos1}] → all 1s → PROBABLY IN SET. (No false negatives possible!)`,
    })

    // Query non-existing
    const query2 = 999
    const pos2 = Array.from({ length: k }, (_, i) => hash(query2, i))
    const hit2 = pos2.every(p => bits[p])
    steps.push({
        array: [...bits],
        comparing: pos2,
        swapping: [],
        sorted: [],
        message: `Query(${query2}): ${hit2 ? 'all bits set → false positive!' : 'bit 0 found → DEFINITELY NOT IN SET.'} (${hit2 ? 'False positive' : 'Definite negative'})`,
    })

    return steps
}

const skipListGenerator = (arr) => {
    const steps = []
    const values = [...arr.slice(0, 8)].sort((a, b) => a - b)

    steps.push({
        array: values,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Skip List: Inserting ${values.length} elements. Multi-level linked list with probabilistic promotion.`,
    })

    // Simulate levels
    const levels = [values] // L0 = all elements
    const l1 = values.filter((_, i) => i % 2 === 0)
    const l2 = values.filter((_, i) => i % 4 === 0)
    const l3 = values.filter((_, i) => i % 8 === 0)
    if (l1.length) levels.push(l1)
    if (l2.length) levels.push(l2)
    if (l3.length) levels.push(l3)

    for (let lv = levels.length - 1; lv >= 0; lv--) {
        steps.push({
            array: levels[lv],
            comparing: Array.from({ length: levels[lv].length }, (_, i) => i),
            swapping: [],
            sorted: [],
            message: `Level ${lv} (${lv === 0 ? 'base' : lv === levels.length - 1 ? 'express' : 'skip'}): [${levels[lv].join(' → ')}]`,
        })
    }

    // Search for target
    const target = values[Math.floor(values.length / 2)]
    let hops = 0
    steps.push({
        array: values,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Search for ${target}: start at top level (express). Drop down when you overshoot.`,
    })

    for (let lv = levels.length - 1; lv >= 0; lv--) {
        const pos = levels[lv].findIndex(v => v >= target)
        hops++
        const found = levels[lv][pos] === target
        steps.push({
            array: levels[lv],
            comparing: pos >= 0 ? [pos] : [],
            swapping: [],
            sorted: found ? [pos] : [],
            message: `Level ${lv}: checked ${pos >= 0 ? levels[lv][pos] : 'end'}. ${found ? `FOUND ${target}!` : `${target} > ${levels[lv][pos - 1] || 'start'}, drop down.`}`,
        })
        if (found) break
    }

    steps.push({
        array: values,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: values.length }, (_, i) => i),
        message: `Found ${target} in ${hops} hops vs ${values.length} on base level. O(log n) average search.`,
    })

    return steps
}

const lsmTreeGenerator = (arr) => {
    const steps = []
    const keys = arr.slice(0, 8).map((v, i) => ({ k: i + 1, v: Math.abs(v) % 100 }))

    steps.push({
        array: keys.map(kv => kv.v),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `LSM Tree: Writing ${keys.length} key-value pairs. All writes go to MemTable first (in-memory).`,
    })

    const memTable = []
    const threshold = 4

    for (let i = 0; i < keys.length; i++) {
        memTable.push(keys[i])
        steps.push({
            array: memTable.map(kv => kv.v),
            comparing: [memTable.length - 1],
            swapping: [],
            sorted: [],
            message: `Write key=${keys[i].k}: value=${keys[i].v} → MemTable (size ${memTable.length}/${threshold}). O(1) write.`,
        })

        if (memTable.length >= threshold) {
            const sorted = [...memTable].sort((a, b) => a.k - b.k)
            steps.push({
                array: sorted.map(kv => kv.v),
                comparing: [],
                swapping: Array.from({ length: sorted.length }, (_, i) => i),
                sorted: Array.from({ length: sorted.length }, (_, i) => i),
                message: `MemTable full! Flush to SSTable (sorted on disk): [${sorted.map(kv => `k${kv.k}=${kv.v}`).join(', ')}]. Sequential write → fast!`,
            })
            memTable.length = 0
        }
    }

    // Read path
    const readKey = keys[2].k
    steps.push({
        array: keys.map(kv => kv.v),
        comparing: [2],
        swapping: [],
        sorted: [2],
        message: `Read key=${readKey}: check MemTable → check SSTable L0 → found! Bloom Filter prevents unnecessary disk reads.`,
    })

    return steps
}

const quadTreeGenerator = (arr) => {
    const steps = []
    const points = arr.slice(0, 8).map((v, i) => [Math.abs(v) % 10, Math.abs(arr[(i + 1) % arr.length]) % 10])

    steps.push({
        array: points.map(p => p[0]),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Quad Tree: ${points.length} 2D points = [${points.map(p => `(${p[0]},${p[1]})`).join(', ')}]. Region [0,10]×[0,10].`,
    })

    // Simulate quadrant classification
    const nw = points.filter(p => p[0] < 5 && p[1] < 5)
    const ne = points.filter(p => p[0] >= 5 && p[1] < 5)
    const sw = points.filter(p => p[0] < 5 && p[1] >= 5)
    const se = points.filter(p => p[0] >= 5 && p[1] >= 5)

    const quadrants = [
        { name: 'NW(x<5,y<5)', pts: nw },
        { name: 'NE(x≥5,y<5)', pts: ne },
        { name: 'SW(x<5,y≥5)', pts: sw },
        { name: 'SE(x≥5,y≥5)', pts: se },
    ]

    for (const q of quadrants) {
        const indices = q.pts.map(p => points.indexOf(p))
        steps.push({
            array: points.map(p => p[0]),
            comparing: indices,
            swapping: [],
            sorted: indices,
            message: `Quadrant ${q.name}: ${q.pts.length} points = [${q.pts.map(p => `(${p[0]},${p[1]})`).join(', ')}]. Each quadrant recursively subdivides if needed.`,
        })
    }

    // Range query
    const qx = 2, qy = 2, qw = 6, qh = 6
    const inRange = points.filter(p => p[0] >= qx && p[0] < qx + qw && p[1] >= qy && p[1] < qy + qh)
    steps.push({
        array: points.map(p => p[0]),
        comparing: inRange.map(p => points.indexOf(p)),
        swapping: [],
        sorted: inRange.map(p => points.indexOf(p)),
        message: `Range query [${qx}-${qx + qw},${qy}-${qy + qh}]: ${inRange.length} points found. Quad tree skips non-intersecting quadrants!`,
    })

    return steps
}

const kdTreeGenerator = (arr) => {
    const steps = []
    const points = arr.slice(0, 8).map((v, i) => [Math.abs(v) % 10, Math.abs(arr[(i + 1) % arr.length]) % 10])

    steps.push({
        array: points.map(p => p[0]),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `K-D Tree: ${points.length} 2D points. Alternate splitting axis: depth 0=X, depth 1=Y, depth 2=X…`,
    })

    // Build tree steps
    const sortedByX = [...points].sort((a, b) => a[0] - b[0])
    const midX = sortedByX[Math.floor(sortedByX.length / 2)]

    steps.push({
        array: sortedByX.map(p => p[0]),
        comparing: [Math.floor(sortedByX.length / 2)],
        swapping: [],
        sorted: [],
        message: `Depth 0 (split by X): Sort by X, pick median (${midX[0]},${midX[1]}) as root. Left: X<${midX[0]}, Right: X≥${midX[0]}.`,
    })

    const left = sortedByX.filter(p => p[0] < midX[0])
    const right = sortedByX.filter(p => p[0] >= midX[0] && p !== midX)

    if (left.length > 0) {
        const sortedByY = [...left].sort((a, b) => a[1] - b[1])
        const midY = sortedByY[Math.floor(sortedByY.length / 2)]
        steps.push({
            array: points.map(p => p[0]),
            comparing: left.map(p => points.indexOf(p)),
            swapping: [],
            sorted: [],
            message: `Depth 1 (split by Y, left subtree): median Y=${midY[1]}. Left of root splits vertically.`,
        })
    }

    // NN search
    const query = [3, 4]
    const dists = points.map(p => ({ p, d: Math.sqrt((p[0] - query[0]) ** 2 + (p[1] - query[1]) ** 2) }))
    dists.sort((a, b) => a.d - b.d)
    const nearest = dists[0]

    steps.push({
        array: points.map(p => p[0]),
        comparing: [points.indexOf(nearest.p)],
        swapping: [],
        sorted: [points.indexOf(nearest.p)],
        message: `NN query (${query[0]},${query[1]}): nearest = (${nearest.p[0]},${nearest.p[1]}) at distance ${nearest.d.toFixed(2)}. K-D Tree prunes far subtrees.`,
    })

    return steps
}

// ─── Phase 12: DSA Patterns ─────────────────────────────────────────────────

const fastSlowPointerGenerator = (arr) => {
    const steps = []
    const nodes = arr.slice(0, 8)
    const n = nodes.length

    steps.push({
        array: nodes,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Fast & Slow Pointer: slow moves 1 step, fast moves 2 steps. Detects cycles & finds midpoints.`,
    })

    let slow = 0, fast = 0

    for (let step = 0; step < n; step++) {
        slow = (slow + 1) % n
        fast = (fast + 2) % n

        steps.push({
            array: nodes,
            comparing: [fast],
            swapping: [],
            sorted: [slow],
            pointers: [slow, fast],
            message: `Step ${step + 1}: slow=${slow} (val=${nodes[slow]}), fast=${fast} (val=${nodes[fast]})${slow === fast ? ' ← CYCLE DETECTED (slow===fast)!' : ''}`,
        })

        if (slow === fast) break
    }

    // Find middle
    slow = 0; fast = 0
    while (fast < n - 1 && fast + 1 < n - 1) {
        slow++
        fast += 2
    }

    steps.push({
        array: nodes,
        comparing: [fast],
        swapping: [],
        sorted: [slow],
        message: `Find middle (non-cyclic): slow=${slow} (value=${nodes[slow]}) is the middle node when fast reaches end.`,
    })

    return steps
}

const mergeIntervalGenerator = (arr) => {
    const steps = []
    const n = Math.min(arr.length, 8)
    const intervals = []
    for (let i = 0; i < n; i++) {
        const s = Math.abs(arr[i]) % 10
        intervals.push([s, s + 1 + (i % 3)])
    }

    steps.push({
        array: intervals.map(iv => iv[0]),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Merge Intervals: ${intervals.length} intervals = [${intervals.map(iv => `[${iv}]`).join(', ')}]. Sort by start.`,
    })

    intervals.sort((a, b) => a[0] - b[0])

    steps.push({
        array: intervals.map(iv => iv[0]),
        comparing: Array.from({ length: intervals.length }, (_, i) => i),
        swapping: [],
        sorted: [],
        message: `Sorted: [${intervals.map(iv => `[${iv}]`).join(', ')}]. Now scan and merge overlapping.`,
    })

    const result = [intervals[0]]
    for (let i = 1; i < intervals.length; i++) {
        const last = result[result.length - 1]
        const curr = intervals[i]
        if (curr[0] <= last[1]) {
            last[1] = Math.max(last[1], curr[1])
            steps.push({
                array: intervals.map(iv => iv[0]),
                comparing: [i],
                swapping: [i],
                sorted: Array.from({ length: result.length }, (_, j) => j),
                message: `[${curr}] overlaps [${last}]: merge → [${last[0]}, ${last[1]}]. (${curr[0]} ≤ ${last[1]})`,
            })
        } else {
            result.push(curr)
            steps.push({
                array: intervals.map(iv => iv[0]),
                comparing: [i],
                swapping: [],
                sorted: Array.from({ length: result.length }, (_, j) => j),
                message: `[${curr}] does NOT overlap: ${curr[0]} > ${last[1]}. Start new interval.`,
            })
        }
    }

    steps.push({
        array: result.map(iv => iv[0]),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: result.length }, (_, i) => i),
        message: `Merged result: [${result.map(iv => `[${iv}]`).join(', ')}]. ${intervals.length} → ${result.length} intervals.`,
    })

    return steps
}

const cyclicSortGenerator = (arr) => {
    const steps = []
    const n = Math.min(arr.length, 8)
    const array = arr.slice(0, n).map((v, i) => (Math.abs(v) % n) + 1)

    steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Cyclic Sort: array=[${array}], values 1..${n}. Place each value at index (value-1).`,
    })

    let i = 0
    while (i < array.length) {
        const correct = array[i] - 1
        if (array[i] !== array[correct]) {
            steps.push({
                array: [...array],
                comparing: [i, correct],
                swapping: [i, correct],
                sorted: [],
                message: `arr[${i}]=${array[i]} belongs at index ${correct}. Swap arr[${i}] ↔ arr[${correct}].`,
            });
            [array[i], array[correct]] = [array[correct], array[i]]
        } else {
            steps.push({
                array: [...array],
                comparing: [i],
                swapping: [],
                sorted: [i],
                message: `arr[${i}]=${array[i]} is in correct position (index ${i}). Move to i=${i + 1}.`,
            })
            i++
        }
    }

    const missing = []
    for (let j = 0; j < array.length; j++) {
        if (array[j] !== j + 1) missing.push(j + 1)
    }

    steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: array.length }, (_, i) => i),
        message: `Cyclic sort complete: [${array}]. ${missing.length > 0 ? `Missing: [${missing}].` : 'All values 1..n present — no missing!'}`,
    })

    return steps
}

const heapPatternGenerator = (arr) => {
    const steps = []
    const k = 3
    const nums = arr.slice(0, 10)

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Heap Pattern (Top-K): Find top-${k} largest from [${nums}] using min-heap of size ${k}.`,
    })

    const heap = []
    for (let i = 0; i < nums.length; i++) {
        heap.push(nums[i])
        heap.sort((a, b) => a - b)
        const popped = heap.length > k ? heap.shift() : null

        steps.push({
            array: nums,
            comparing: [i],
            swapping: popped !== null ? [i] : [],
            sorted: heap.map(v => nums.indexOf(v)),
            message: `Add ${nums[i]}. Heap=[${heap}]${popped !== null ? `. Evict min ${popped} (heap full)` : ''}.`,
        })
    }

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: heap.map(v => nums.lastIndexOf(v)),
        message: `Top-${k} largest: [${heap.sort((a, b) => b - a).join(', ')}]. Min-heap of size k → O(n log k) total.`,
    })

    return steps
}

const monotonicQueueGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 10).map(v => Math.abs(v) % 20 + 1)
    const k = 3

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Monotonic Queue: Sliding Window Max, window size k=${k}. Deque stores indices in decreasing value order.`,
    })

    const deque = []
    const result = []

    for (let i = 0; i < nums.length; i++) {
        // Remove out-of-window
        while (deque.length && deque[0] <= i - k) deque.shift()
        // Remove smaller from back
        while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop()
        deque.push(i)

        if (i >= k - 1) {
            result.push(nums[deque[0]])
        }

        steps.push({
            array: nums,
            comparing: [i],
            swapping: deque.filter(d => d >= i - k + 1 && d < i),
            sorted: i >= k - 1 ? [deque[0]] : [],
            message: `i=${i}: add ${nums[i]}. Deque=[${deque.map(d => nums[d]).join(', ')}]${i >= k - 1 ? `. Window max=${nums[deque[0]]}` : ''}`,
        })
    }

    steps.push({
        array: result,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: result.length }, (_, i) => i),
        message: `Window maxima: [${result.join(', ')}]. Each element added/removed from deque at most once → O(n) total.`,
    })

    return steps
}

const dpPatternGenerator = (arr) => {
    const steps = []
    const coins = [1, 2, 5]
    const amount = Math.min(Math.max(...arr.slice(0, 3)), 15)

    steps.push({
        array: new Array(amount + 1).fill(Infinity),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `DP Pattern (Coin Change): coins=[${coins}], amount=${amount}. dp[i] = min coins to make i.`,
    })

    const dp = new Array(amount + 1).fill(Infinity)
    dp[0] = 0

    steps.push({
        array: [...dp].map(v => v === Infinity ? 0 : v),
        comparing: [0],
        swapping: [],
        sorted: [0],
        message: `Base case: dp[0]=0 (0 coins to make 0). dp[1..${amount}]=∞ initially.`,
    })

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i >= coin && dp[i - coin] + 1 < dp[i]) {
                dp[i] = dp[i - coin] + 1
            }
        }
        steps.push({
            array: dp.map(v => v === Infinity ? 99 : v),
            comparing: [i],
            swapping: [],
            sorted: dp[i] < Infinity ? [i] : [],
            message: `dp[${i}] = ${dp[i] === Infinity ? '∞' : dp[i]}. Try coins [${coins.filter(c => c <= i).join(', ')}]: best = dp[${i - (coins.find(c => i >= c && dp[i - c] + 1 === dp[i]) || 0)}]+1.`,
        })
    }

    steps.push({
        array: dp.map(v => v === Infinity ? 99 : v),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: amount + 1 }, (_, i) => i),
        message: `Answer: dp[${amount}] = ${dp[amount] === Infinity ? 'impossible' : dp[amount]} coins. DP solved this in O(amount × |coins|).`,
    })

    return steps
}

const backtrackingPatternGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 4).map((v, i) => i + 1) // [1,2,3,4]

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Backtracking (Subsets): Generate all 2^${nums.length}=${2 ** nums.length} subsets of [${nums}] using choose-explore-unchoose.`,
    })

    const allSubsets = [[]]
    const path = []

    function backtrack(start) {
        allSubsets.push([...path])
        for (let i = start; i < nums.length; i++) {
            path.push(nums[i]) // choose
            steps.push({
                array: nums,
                comparing: [i],
                swapping: [],
                sorted: path.map(v => nums.indexOf(v)),
                message: `Choose ${nums[i]}: current subset = [${path}]. Recurse from index ${i + 1}.`,
            })
            backtrack(i + 1)  // explore
            const removed = path.pop() // unchoose
            steps.push({
                array: nums,
                comparing: [],
                swapping: [i],
                sorted: path.map(v => nums.indexOf(v)),
                message: `Unchoose ${removed}: backtrack to [${path}]. Try next option.`,
            })
        }
    }

    backtrack(0)

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: nums.length }, (_, i) => i),
        message: `All ${allSubsets.length} subsets generated. Backtracking: choose → explore → unchoose. Time O(2^n).`,
    })

    return steps
}

// ─── Phase 13: Interview Preparation ────────────────────────────────────────

const bruteForceGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 8)
    const target = nums[0] + nums[1]

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Brute Force → Optimal: Two Sum, target=${target}. Brute O(n²) then optimize to O(n).`,
    })

    // Brute force
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            const found = nums[i] + nums[j] === target
            steps.push({
                array: nums,
                comparing: [i, j],
                swapping: [],
                sorted: found ? [i, j] : [],
                message: `Brute O(n²): checking pair (${nums[i]}, ${nums[j]}). Sum=${nums[i] + nums[j]}${found ? ` = target ${target} → FOUND!` : ` ≠ ${target}`}`,
            })
            if (found) break
        }
    }

    // Optimal
    const seen = new Map()
    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Optimize: 'What does the inner loop do?' → It searches for complement. Use HashMap instead! O(n).`,
    })

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i]
        if (seen.has(complement)) {
            steps.push({
                array: nums,
                comparing: [i, seen.get(complement)],
                swapping: [],
                sorted: [i, seen.get(complement)],
                message: `O(n) HashMap: complement ${complement} found at index ${seen.get(complement)}. FOUND in O(1) lookup!`,
            })
            break
        }
        seen.set(nums[i], i)
        steps.push({
            array: nums,
            comparing: [i],
            swapping: [],
            sorted: [],
            message: `O(n) HashMap: store nums[${i}]=${nums[i]} → index ${i}. Check complement ${complement}: not yet seen.`,
        })
    }

    return steps
}

const patternRecognitionGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 8)

    const patterns = [
        { name: 'Sliding Window', signal: 'subarray/substring + constraint', arr: nums, highlight: [0, 1, 2] },
        { name: 'Two Pointers', signal: 'sorted array + pair search', arr: [...nums].sort((a, b) => a - b), highlight: [0, nums.length - 1] },
        { name: 'Heap (Top-K)', signal: 'k largest/smallest', arr: [...nums].sort((a, b) => b - a), highlight: [0, 1, 2] },
        { name: 'Binary Search', signal: 'sorted + find boundary', arr: [...nums].sort((a, b) => a - b), highlight: [Math.floor(nums.length / 2)] },
    ]

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Pattern Recognition: Identify which of the 15 core patterns applies. Key: read problem signals.`,
    })

    for (const { name, signal, arr: pArr, highlight } of patterns) {
        steps.push({
            array: pArr,
            comparing: highlight,
            swapping: [],
            sorted: highlight,
            message: `Pattern: "${name}" | Signal: "${signal}". If you see this, immediately think of this pattern.`,
        })
    }

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: nums.length }, (_, i) => i),
        message: `Decision tree: Array? → sorted? → Two Pointers/BinSearch. Subarray? → Sliding Window. Top-K? → Heap. Optimize? → DP.`,
    })

    return steps
}

const optimizationGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 8)
    const k = 3

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Optimization Strategies: From O(n²) → O(n). Strategy 1: Precompute, 2: Sort, 3: Hash, 4: Two Pointers.`,
    })

    // Strategy 1: Prefix sums
    const prefix = [0]
    for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
    steps.push({
        array: prefix.slice(1),
        comparing: Array.from({ length: nums.length }, (_, i) => i),
        swapping: [],
        sorted: [],
        message: `Strategy 1 - Precompute Prefix Sums: [${prefix.slice(1)}]. Range sum [l,r] = O(1) → eliminates inner loop.`,
    })

    // Strategy 2: Sort + Two Pointers
    const sorted = [...nums].sort((a, b) => a - b)
    steps.push({
        array: sorted,
        comparing: [0, sorted.length - 1],
        swapping: [],
        sorted: [0, sorted.length - 1],
        message: `Strategy 2 - Sort + Two Pointers: Sorted=[${sorted}]. Shrink from both ends instead of nested loops.`,
    })

    // Strategy 3: Heap
    const topK = [...nums].sort((a, b) => b - a).slice(0, k)
    steps.push({
        array: nums,
        comparing: topK.map(v => nums.indexOf(v)),
        swapping: [],
        sorted: topK.map(v => nums.indexOf(v)),
        message: `Strategy 3 - Heap: Top-${k}=[${topK}]. Min-heap of size k instead of full sort → O(n log k) vs O(n log n).`,
    })

    // Strategy 4: Hash
    const freqMap = {}
    for (const v of nums) freqMap[v] = (freqMap[v] || 0) + 1
    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: nums.length }, (_, i) => i),
        message: `Strategy 4 - Hash Map: freq={${Object.entries(freqMap).map(([k, v]) => `${k}:${v}`).join(',')}}. O(1) lookup replaces O(n) scan each time.`,
    })

    return steps
}

const dryRunGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 8).map(v => Math.abs(v) % 20 + 1)
    const target = nums[Math.floor(nums.length / 2)]

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Dry Run Technique: Trace binary search on [${nums}], target=${target} step by step.`,
    })

    const sorted = [...nums].sort((a, b) => a - b)
    let lo = 0, hi = sorted.length - 1

    steps.push({
        array: sorted,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Sorted: [${sorted}]. Initialize lo=${lo}, hi=${hi}. Now trace each iteration manually.`,
    })

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        steps.push({
            array: sorted,
            comparing: [mid],
            swapping: [],
            sorted: sorted[mid] === target ? [mid] : [],
            message: `lo=${lo}, hi=${hi}, mid=${mid}: arr[mid]=${sorted[mid]} ${sorted[mid] === target ? '==' : sorted[mid] < target ? '<' : '>'} target=${target}. ${sorted[mid] === target ? 'FOUND!' : sorted[mid] < target ? 'lo = mid+1' : 'hi = mid-1'}`,
        })
        if (sorted[mid] === target) break
        else if (sorted[mid] < target) lo = mid + 1
        else hi = mid - 1
    }

    steps.push({
        array: sorted,
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: sorted.length }, (_, i) => i),
        message: `Dry run complete. Each variable updated traced exactly. Catches off-by-one errors before running code.`,
    })

    return steps
}

const edgeCaseGenerator = (arr) => {
    const steps = []

    steps.push({
        array: arr.slice(0, 8),
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Edge Case Analysis: Systematically check boundary inputs. Empty, n=1, all-same, sorted, reverse, overflow.`,
    })

    const edgeCases = [
        { name: 'Empty []', arr: [], msg: 'Return default (0, null, []). Never access arr[0] without checking length.' },
        { name: 'Single [42]', arr: [42], msg: 'No comparisons needed. Many algorithms have loops that skip when n=1.' },
        { name: 'All Same [5,5,5]', arr: [5, 5, 5], msg: 'Duplicate handling. Sort stable? Merge intervals give one interval.' },
        { name: 'Already Sorted', arr: [1, 2, 3, 4, 5], msg: 'Best case for Insertion Sort. Worst case for naive QuickSort.' },
        { name: 'Reverse Sorted', arr: [5, 4, 3, 2, 1], msg: 'Worst case for Bubble/Insertion Sort. Tests invariants.' },
    ]

    for (const { name, arr: ea, msg } of edgeCases) {
        steps.push({
            array: ea.length > 0 ? ea : [0],
            comparing: ea.length > 0 ? [0] : [],
            swapping: [],
            sorted: ea.length > 0 ? Array.from({ length: ea.length }, (_, i) => i) : [],
            message: `Edge Case: ${name} → ${msg}`,
        })
    }

    steps.push({
        array: arr.slice(0, 8),
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: Math.min(arr.length, 8) }, (_, i) => i),
        message: `Always test: empty, n=1, all-same, sorted, reverse-sorted. +Overflow: use lo+(hi-lo)/2 not (lo+hi)/2!`,
    })

    return steps
}

const complexityAnalysisGenerator = (arr) => {
    const steps = []
    const n = arr.slice(0, 8)

    steps.push({
        array: n,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Complexity Analysis: Always state AND derive complexity. "O(n log n) because the sort dominates" — not just O(n log n).`,
    })

    const complexities = [
        { label: 'O(1)', fn: () => 1, arr: [1] },
        { label: 'O(log n)', fn: x => Math.floor(Math.log2(x + 1)), arr: Array.from({ length: 8 }, (_, i) => Math.floor(Math.log2(i + 1))) },
        { label: 'O(n)', fn: x => x, arr: Array.from({ length: 8 }, (_, i) => i + 1) },
        { label: 'O(n log n)', fn: x => Math.floor(x * Math.log2(x + 1)), arr: Array.from({ length: 8 }, (_, i) => Math.floor((i + 1) * Math.log2(i + 2))) },
        { label: 'O(n²)', fn: x => x * x, arr: Array.from({ length: 8 }, (_, i) => (i + 1) * (i + 1)) },
    ]

    for (const { label, arr: ca } of complexities) {
        steps.push({
            array: ca,
            comparing: [ca.length - 1],
            swapping: [],
            sorted: Array.from({ length: ca.length }, (_, i) => i),
            message: `${label}: [${ca.join(', ')}]. Derive by counting: how many times does each input element affect the work?`,
        })
    }

    return steps
}

const communicationSkillsGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 6)

    const phases = [
        { name: '1. Clarify', arr: [1], msg: `Ask: "Can array be empty? Are values positive? What to return if no answer?" Don't code yet!` },
        { name: '2. Brute Force', arr: nums, msg: `State O(n²) brute force first. Shows understanding before optimizing.` },
        { name: '3. Optimize', arr: [...nums].sort((a, b) => a - b), msg: `"I see we're re-searching each time → use HashMap for O(n)"` },
        { name: '4. Code + Narrate', arr: nums, msg: `Code while explaining: "Here I create the HashMap to store values seen so far..."` },
        { name: '5. Dry Run', arr: nums, msg: `Trace example: "Let me verify on [${nums}]..." Shows correctness.` },
        { name: '6. Complexity', arr: nums, msg: `"Time O(n) — single pass. Space O(n) — HashMap stores at most n entries."` },
    ]

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Communication Framework: 6 phases. Think aloud — interviewers rate PROCESS, not just the final answer.`,
    })

    for (const { name, arr: pa, msg } of phases) {
        steps.push({
            array: pa.length > 0 ? pa : [0],
            comparing: Array.from({ length: pa.length }, (_, i) => i),
            swapping: [],
            sorted: Array.from({ length: pa.length }, (_, i) => i),
            message: `Phase ${name}: ${msg}`,
        })
    }

    return steps
}

const mockInterviewGenerator = (arr) => {
    const steps = []
    const nums = arr.slice(0, 8)

    steps.push({
        array: nums,
        comparing: [],
        swapping: [],
        sorted: [],
        message: `Mock Interview Strategy: Maximum ROI activity. 1 mock = 10 Leetcode reads. Practice under real pressure.`,
    })

    const weekPlan = [
        { week: 'Week 1', focus: 'Easy problems (30 total). Identify core patterns.', arr: Array.from({ length: 8 }, (_, i) => i + 1) },
        { week: 'Week 2-3', focus: 'Medium problems (50 total). 2-3 per day. Pattern-tag each.', arr: Array.from({ length: 8 }, (_, i) => (i + 1) * 2) },
        { week: 'Week 4', focus: 'Medium/Hard + 2 mocks/week. Focus on communication.', arr: Array.from({ length: 8 }, (_, i) => (i + 1) * 3) },
        { week: 'Week 5-6', focus: '4+ mocks/week. Hard problems. Mental preparation.', arr: Array.from({ length: 8 }, (_, i) => (i + 1) * 4) },
    ]

    for (let i = 0; i < weekPlan.length; i++) {
        const { week, focus, arr: wa } = weekPlan[i]
        steps.push({
            array: wa,
            comparing: [i * 2],
            swapping: [],
            sorted: Array.from({ length: i + 1 }, (_, j) => j * 2),
            message: `${week}: ${focus}`,
        })
    }

    // Debrief checklist
    const checklist = ['Pattern identified?', 'Edge cases handled?', 'Communication clear?', 'Complexity analyzed?', 'What to improve?']
    steps.push({
        array: Array.from({ length: checklist.length }, (_, i) => i + 1),
        comparing: Array.from({ length: checklist.length }, (_, i) => i),
        swapping: [],
        sorted: Array.from({ length: checklist.length }, (_, i) => i),
        message: `Post-mock debrief: ${checklist.join(' | ')}. Review immediately after each mock!`,
    })

    return steps
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const phase10to13Generators = {
    // Phase 10: Advanced Algorithms
    'sweep-line': sweepLineGenerator,
    'meet-in-the-middle': meetInTheMiddleGenerator,
    'lazy-propagation': lazyPropagationGenerator,
    'rabin-karp': rabinKarpGenerator,
    'z-algorithm': zAlgorithmGenerator,
    'manacher': manacherGenerator,
    'suffix-array': suffixArrayGenerator,
    // Phase 11: Advanced Data Structures
    'interval-tree': intervalTreeGenerator,
    'order-statistic-tree': orderStatisticTreeGenerator,
    'bloom-filter': bloomFilterGenerator,
    'skip-list': skipListGenerator,
    'lsm-tree': lsmTreeGenerator,
    'quad-tree': quadTreeGenerator,
    'kd-tree': kdTreeGenerator,
    // Phase 12: DSA Patterns
    'pattern-fast-slow': fastSlowPointerGenerator,
    'pattern-merge-interval': mergeIntervalGenerator,
    'pattern-cyclic-sort': cyclicSortGenerator,
    'pattern-heap': heapPatternGenerator,
    'pattern-monotonic-queue': monotonicQueueGenerator,
    'pattern-dp': dpPatternGenerator,
    'pattern-backtracking': backtrackingPatternGenerator,
    // Phase 13: Interview Prep
    'brute-force-thinking': bruteForceGenerator,
    'pattern-recognition': patternRecognitionGenerator,
    'optimization-strategies': optimizationGenerator,
    'dry-run-technique': dryRunGenerator,
    'edge-case-analysis': edgeCaseGenerator,
    'interview-complexity-analysis': complexityAnalysisGenerator,
    'communication-skills': communicationSkillsGenerator,
    'mock-interviews': mockInterviewGenerator,
}
