const fs = require('fs');
const path = 'd:\\web devfiles\\Codex Environment\\backend\\server\\data\\algorithms.json';

const newAlgorithms = [
    {
        "id": "stack-impl",
        "name": "Stack Implementation",
        "category": "stacks",
        "complexity": {
            "time": "O(1)",
            "space": "O(n)"
        },
        "description": "LIFO (Last-In-First-Out) data structure. Elements are added and removed from the same end called TOP.",
        "operations": ["push", "pop", "peek", "isEmpty"],
        "code": {
            "javascript": "class Stack {\n  constructor() { this.items = []; }\n  push(element) { this.items.push(element); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n  isEmpty() { return this.items.length === 0; }\n}",
            "python": "class Stack:\n    def __init__(self): self.items = []\n    def push(self, item): self.items.append(item)\n    def pop(self): return self.items.pop()\n    def peek(self): return self.items[-1]\n    def is_empty(self): return len(self.items) == 0",
            "java": "class Stack {\n    private List<Integer> items = new ArrayList<>();\n    public void push(int item) { items.add(item); }\n    public int pop() { return items.remove(items.size() - 1); }\n    public int peek() { return items.get(items.size() - 1); }\n    public boolean isEmpty() { return items.isEmpty(); }\n}",
            "cpp": "class Stack {\n    vector<int> items;\npublic:\n    void push(int item) { items.push_back(item); }\n    void pop() { items.pop_back(); }\n    int peek() { return items.back(); }\n    bool isEmpty() { return items.empty(); }\n}"
        },
        "practice": {
            "theory": ["What does LIFO stand for?", "Time complexity of Push/Pop?"],
            "coding": "Implement Stack using Queues.",
            "interview": "Next Greater Element."
        }
    },
    {
        "id": "stack-push",
        "name": "Stack Push",
        "category": "stacks",
        "complexity": {
            "time": "O(1)",
            "space": "O(1)"
        },
        "description": "Adds an element to the top of the stack. Requires checking for overflow in fixed-size implementations.",
        "operations": ["check-overflow", "increment-top", "insert-element"],
        "code": {
            "javascript": "function push(stack, value, maxSize) {\n    if (stack.length >= maxSize) return 'Overflow';\n    stack.push(value);\n    return stack;\n}",
            "python": "def push(stack, value, max_size):\n    if len(stack) >= max_size: return 'Overflow'\n    stack.append(value)\n    return stack",
            "java": "public void push(int[] stack, int top, int value, int maxSize) {\n    if (top >= maxSize - 1) throw new Error(\"Overflow\");\n    stack[++top] = value;\n}",
            "cpp": "void push(int stack[], int &top, int value, int maxSize) {\n    if (top >= maxSize - 1) return;\n    stack[++top] = value;\n}"
        },
        "practice": {
            "theory": ["What is Stack Overflow?", "How does Top change on Push?"],
            "coding": "Push in a dynamic array based stack.",
            "interview": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time."
        }
    },
    {
        "id": "stack-pop",
        "name": "Stack Pop",
        "category": "stacks",
        "complexity": {
            "time": "O(1)",
            "space": "O(1)"
        },
        "description": "Removes the top element from the stack. Requires checking for underflow if the stack is empty.",
        "operations": ["check-underflow", "access-top", "decrement-top"],
        "code": {
            "javascript": "function pop(stack) {\n    if (stack.length === 0) return 'Underflow';\n    return stack.pop();\n}",
            "python": "def pop(stack):\n    if not stack: return 'Underflow'\n    return stack.pop()",
            "java": "public int pop(int[] stack, int top) {\n    if (top == -1) throw new Error(\"Underflow\");\n    return stack[top--];\n}",
            "cpp": "int pop(int stack[], int &top) {\n    if (top == -1) return -1;\n    return stack[top--];\n}"
        },
        "practice": {
            "theory": ["What is Stack Underflow?", "How does Top change on Pop?"],
            "coding": "Pop implementation details.",
            "interview": "Check for balanced parentheses using a stack."
        }
    },
    {
        "id": "queue-impl",
        "name": "Queue Implementation",
        "category": "queues",
        "complexity": {
            "time": "O(1) amortized",
            "space": "O(n)"
        },
        "description": "FIFO (First-In-First-Out) data structure. Elements are added at the REAR and removed from the FRONT.",
        "operations": ["enqueue", "dequeue", "front", "rear"],
        "code": {
            "javascript": "class Queue {\n  constructor() { this.items = []; }\n  enqueue(element) { this.items.push(element); }\n  dequeue() { return this.items.shift(); }\n  front() { return this.items[0]; }\n}",
            "python": "from collections import deque\nclass Queue:\n    def __init__(self): self.items = deque()\n    def enqueue(self, item): self.items.append(item)\n    def dequeue(self): return self.items.popleft()",
            "java": "class Queue {\n    private LinkedList<Integer> items = new LinkedList<>();\n    public void enqueue(int item) { items.addLast(item); }\n    public int dequeue() { return items.removeFirst(); }\n}",
            "cpp": "class Queue {\n    queue<int> items;\npublic:\n    void enqueue(int item) { items.push(item); }\n    void dequeue() { items.pop(); }\n}"
        },
        "practice": {
            "theory": ["What does FIFO stand for?", "Difference between Linear and Circular Queue?"],
            "coding": "Implement Queue using Stacks.",
            "interview": "Sliding Window Maximum."
        }
    }
];

try {
    let raw = fs.readFileSync(path, 'utf8');
    let data = JSON.parse(raw);
    data.push(...newAlgorithms);
    fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf8');
    console.log('Successfully updated algorithms.json');
} catch (e) {
    console.error('Error updating algorithms.json:', e);
    process.exit(1);
}
