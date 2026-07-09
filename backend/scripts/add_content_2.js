const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../server/data');

const newAlgorithms = [
    {
        "id": "dijkstra",
        "name": "Dijkstra's Algorithm",
        "category": "graphs",
        "complexity": {
            "time": "O((V + E) log V)",
            "space": "O(V)"
        },
        "description": "An algorithm for finding the shortest paths between nodes in a graph, which may represent, for example, road networks.",
        "operations": ["relax", "extract-min", "visit"],
        "code": {
            "javascript": "function dijkstra(graph, start) {\n  let distances = {};\n  for (let node in graph) distances[node] = Infinity;\n  distances[start] = 0;\n  // simplified without Priority Queue for brevity\n  // in a real scenario, use a MinHeap\n}",
            "python": "import heapq\ndef dijkstra(graph, start):\n    distances = {node: float('infinity') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        curr_dist, curr_node = heapq.heappop(pq)\n        if curr_dist > distances[curr_node]:\n            continue\n        for neighbor, weight in graph[curr_node].items():\n            dist = curr_dist + weight\n            if dist < distances[neighbor]:\n                distances[neighbor] = dist\n                heapq.heappush(pq, (dist, neighbor))\n    return distances",
            "cpp": "void dijkstra(vector<vector<pair<int, int>>>& adj, int start, int V) {\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    vector<int> dist(V, INT_MAX);\n    pq.push({0, start});\n    dist[start] = 0;\n    while (!pq.empty()) {\n        int u = pq.top().second;\n        pq.pop();\n        for (auto& edge : adj[u]) {\n            int v = edge.first;\n            int weight = edge.second;\n            if (dist[v] > dist[u] + weight) {\n                dist[v] = dist[u] + weight;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n}"
        },
        "practice": {
            "theory": ["Why does Dijkstra's algorithm fail with negative edge weights?", "What data structure is used to optimize the extraction of the minimum distance node?"],
            "coding": "Implement Dijkstra's using a priority queue.",
            "interview": "Compare Dijkstra's algorithm to the Bellman-Ford algorithm."
        }
    },
    {
        "id": "lru-cache",
        "name": "LRU Cache",
        "category": "design",
        "complexity": {
            "time": "O(1)",
            "space": "O(capacity)"
        },
        "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. It supports getting and putting key-value pairs in O(1) time.",
        "operations": ["get", "put", "evict"],
        "code": {
            "javascript": "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.capacity) {\n      const lruKey = this.map.keys().next().value;\n      this.map.delete(lruKey);\n    }\n  }\n}",
            "python": "from collections import OrderedDict\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cache = OrderedDict()\n        self.capacity = capacity\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    def put(self, key: int, value: int) -> None:\n        self.cache[key] = value\n        self.cache.move_to_end(key)\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)",
            "cpp": "class LRUCache {\n    int capacity;\n    list<pair<int, int>> cache;\n    unordered_map<int, list<pair<int, int>>::iterator> map;\npublic:\n    LRUCache(int capacity) : capacity(capacity) {}\n    int get(int key) {\n        if (map.find(key) == map.end()) return -1;\n        cache.splice(cache.begin(), cache, map[key]);\n        return map[key]->second;\n    }\n    void put(int key, int value) {\n        if (map.find(key) != map.end()) {\n            cache.splice(cache.begin(), cache, map[key]);\n            map[key]->second = value;\n            return;\n        }\n        if (cache.size() == capacity) {\n            int delKey = cache.back().first;\n            cache.pop_back();\n            map.erase(delKey);\n        }\n        cache.push_front({key, value});\n        map[key] = cache.begin();\n    }\n};"
        },
        "practice": {
            "theory": ["What two data structures are commonly combined to implement an LRU cache efficiently?", "Why is a doubly linked list used instead of a singly linked list?"],
            "coding": "Implement an LRU Cache without using built-in ordered dictionaries or maps.",
            "interview": "How would you modify this to be an LFU (Least Frequently Used) cache?"
        }
    }
];

const newQuestions = [
    {
        "id": "climbing-stairs",
        "title": "Climbing Stairs",
        "topic": "dynamic-programming",
        "difficulty": "Easy",
        "description": "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
        "examples": [
            {
                "input": "n = 2",
                "output": "2",
                "explanation": "1. 1 step + 1 step\\n2. 2 steps"
            },
            {
                "input": "n = 3",
                "output": "3",
                "explanation": "1. 1 step + 1 step + 1 step\\n2. 1 step + 2 steps\\n3. 2 steps + 1 step"
            }
        ],
        "starterCode": {
            "javascript": "function climbStairs(n) {\n  // Your code here\n}",
            "python": "def climb_stairs(n):\n    pass",
            "cpp": "int climbStairs(int n) {\n}"
        },
        "hints": [
            "To reach step n, you could have come from step n-1 or step n-2.",
            "Therefore, the total number of ways to reach step n is the sum of ways to reach step n-1 and ways to reach step n-2.",
            "This is exactly the Fibonacci sequence. Can you optimize it to use O(1) space?"
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
