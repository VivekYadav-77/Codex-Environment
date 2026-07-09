const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../server/data');

const newAlgorithms = [
    {
        "id": "binary-search",
        "name": "Binary Search",
        "category": "searching",
        "complexity": {
            "time": "O(log n)",
            "space": "O(1)"
        },
        "description": "A highly efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.",
        "operations": ["divide", "compare", "search"],
        "code": {
            "javascript": "function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
            "python": "def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1",
            "cpp": "int binarySearch(vector<int>& arr, int target) {\n    int left = 0, right = arr.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}"
        },
        "practice": {
            "theory": ["Why does binary search require a sorted array?", "What is the loop invariant for binary search?"],
            "coding": "Implement lower_bound and upper_bound using binary search.",
            "interview": "Can you use binary search to find the peak element in an unsorted array?"
        }
    },
    {
        "id": "merge-sort",
        "name": "Merge Sort",
        "category": "sorting",
        "complexity": {
            "time": "O(n log n)",
            "space": "O(n)"
        },
        "description": "A divide and conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.",
        "operations": ["divide", "merge", "sort"],
        "code": {
            "javascript": "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(left, right) {\n  let res = [], i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) res.push(left[i++]);\n    else res.push(right[j++]);\n  }\n  return res.concat(left.slice(i)).concat(right.slice(j));\n}",
            "python": "def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\ndef merge(left, right):\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] < right[j]:\n            res.append(left[i])\n            i += 1\n        else:\n            res.append(right[j])\n            j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res",
            "cpp": "void merge(vector<int>& arr, int l, int m, int r) {\n    // Implementation omitted for brevity\n}\nvoid mergeSort(vector<int>& arr, int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);\n}"
        },
        "practice": {
            "theory": ["Is merge sort stable?", "Why does merge sort require O(n) space complexity?"],
            "coding": "Implement merge sort on a linked list in O(1) space.",
            "interview": "Compare Merge Sort vs Quick Sort in terms of worst case and space complexity."
        }
    },
    {
        "id": "dfs",
        "name": "Depth-First Search",
        "category": "graphs",
        "complexity": {
            "time": "O(V + E)",
            "space": "O(V)"
        },
        "description": "An algorithm for traversing or searching tree or graph data structures. The algorithm starts at the root node and explores as far as possible along each branch before backtracking.",
        "operations": ["traverse", "backtrack", "visit"],
        "code": {
            "javascript": "function dfs(graph, start, visited = new Set()) {\n  visited.add(start);\n  console.log(start);\n  for (let neighbor of graph[start]) {\n    if (!visited.has(neighbor)) {\n      dfs(graph, neighbor, visited);\n    }\n  }\n}",
            "python": "def dfs(graph, start, visited=None):\n    if visited is None: visited = set()\n    visited.add(start)\n    print(start)\n    for next_node in graph[start]:\n        if next_node not in visited:\n            dfs(graph, next_node, visited)\n    return visited",
            "cpp": "void dfs(int v, vector<vector<int>>& adj, vector<bool>& visited) {\n    visited[v] = true;\n    cout << v << \" \";\n    for (int u : adj[v]) {\n        if (!visited[u]) {\n            dfs(u, adj, visited);\n        }\n    }\n}"
        },
        "practice": {
            "theory": ["How does DFS differ from BFS?", "Can DFS be used to detect a cycle in a graph?"],
            "coding": "Use DFS to find all connected components in an undirected graph.",
            "interview": "Explain how you would use DFS to topologically sort a directed acyclic graph."
        }
    },
    {
        "id": "bfs",
        "name": "Breadth-First Search",
        "category": "graphs",
        "complexity": {
            "time": "O(V + E)",
            "space": "O(V)"
        },
        "description": "An algorithm for traversing graph data structures. It starts at a chosen node and explores all of its neighbors at the present depth prior to moving on to the nodes at the next depth level.",
        "operations": ["enqueue", "dequeue", "visit"],
        "code": {
            "javascript": "function bfs(graph, start) {\n  let visited = new Set([start]);\n  let queue = [start];\n  while (queue.length > 0) {\n    let curr = queue.shift();\n    console.log(curr);\n    for (let neighbor of graph[curr]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}",
            "python": "from collections import deque\ndef bfs(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    while queue:\n        curr = queue.popleft()\n        print(curr)\n        for neighbor in graph[curr]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)",
            "cpp": "void bfs(int start, vector<vector<int>>& adj, int V) {\n    vector<bool> visited(V, false);\n    queue<int> q;\n    visited[start] = true;\n    q.push(start);\n    while (!q.empty()) {\n        int curr = q.front();\n        q.pop();\n        cout << curr << \" \";\n        for (int u : adj[curr]) {\n            if (!visited[u]) {\n                visited[u] = true;\n                q.push(u);\n            }\n        }\n    }\n}"
        },
        "practice": {
            "theory": ["Why does BFS find the shortest path in an unweighted graph?", "What data structure is used to implement BFS?"],
            "coding": "Use BFS to find the shortest path in a 2D grid.",
            "interview": "How does bidirectional BFS improve performance?"
        }
    }
];

const newQuestions = [
    {
        "id": "longest-substring-without-repeating-characters",
        "title": "Longest Substring Without Repeating Characters",
        "topic": "sliding-window",
        "difficulty": "Medium",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "examples": [
            {
                "input": "s = \\\"abcabcbb\\\"",
                "output": "3",
                "explanation": "The answer is \\\"abc\\\", with the length of 3."
            },
            {
                "input": "s = \\\"bbbbb\\\"",
                "output": "1",
                "explanation": "The answer is \\\"b\\\", with the length of 1."
            }
        ],
        "starterCode": {
            "javascript": "function lengthOfLongestSubstring(s) {\n  // Your code here\n}",
            "python": "def length_of_longest_substring(s):\n    pass",
            "cpp": "int lengthOfLongestSubstring(string s) {\n}"
        },
        "hints": [
            "Think about using a sliding window. What happens when you see a character you've already seen in the current window?",
            "You can use a set or a hash map to store the characters in the current window.",
            "If you see a duplicate, shrink the window from the left until the duplicate is removed."
        ]
    },
    {
        "id": "number-of-islands",
        "title": "Number of Islands",
        "topic": "graphs",
        "difficulty": "Medium",
        "description": "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.\\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
        "examples": [
            {
                "input": "grid = [\\n  [\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"],\\n  [\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"],\\n  [\\\"0\\\",\\\"0\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\"],\\n  [\\\"0\\\",\\\"0\\\",\\\"0\\\",\\\"1\\\",\\\"1\\\"]\\n]",
                "output": "3"
            }
        ],
        "starterCode": {
            "javascript": "function numIslands(grid) {\n  // Your code here\n}",
            "python": "def num_islands(grid):\n    pass",
            "cpp": "int numIslands(vector<vector<char>>& grid) {\n}"
        },
        "hints": [
            "Think of the grid as a graph where each land cell is a node, and edges connect adjacent land cells.",
            "You can iterate through the grid. When you find a '1', it's a new island. Then use DFS or BFS to visit all connected '1's and mark them as visited (or turn them to '0').",
            "Increment your island count each time you start a new search."
        ]
    }
];

function appendToFile(filename, newData) {
    const filePath = path.join(dataDir, filename);
    let data = [];
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(fileContent);
    } catch (e) {
        console.log(`Could not read ${filename}, creating new array.`);
    }
    
    // check if it already exists to avoid duplicates
    let addedCount = 0;
    for (let item of newData) {
        if (!data.find(d => d.id === item.id)) {
            data.push(item);
            addedCount++;
        }
    }
    
    if (addedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Added ${addedCount} items to ${filename}`);
    } else {
        console.log(`No new items added to ${filename}`);
    }
}

appendToFile('algorithms.json', newAlgorithms);
appendToFile('questions.json', newQuestions);
