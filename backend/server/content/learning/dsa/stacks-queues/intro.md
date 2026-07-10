---
title: "Stacks and Queues"
description: "Learn about LIFO vs FIFO structures, stack push/pop, and queue enqueue/dequeue."
level: "Beginner"
track: "DSA Mastery"
order: 3
---

# Stacks and Queues

**Stacks** and **Queues** are linear data structures that constrain how elements are inserted and removed.

---

## 1. Stacks (LIFO)

A **Stack** operates on a **LIFO (Last In, First Out)** basis. The last element added is the first one to be removed. Think of a stack of plates.

### Key Operations
- **Push**: Add an element to the top of the stack. $O(1)$
- **Pop**: Remove and return the top element. $O(1)$
- **Peek/Top**: View the top element without removing it. $O(1)$

```python
# Python list as a stack
stack = []
stack.append(1)  # Push 1
stack.append(2)  # Push 2
top = stack.pop() # Pop 2 -> returns 2
```

---

## 2. Queues (FIFO)

A **Queue** operates on a **FIFO (First In, First Out)** basis. The first element added is the first one to be removed. Think of a queue of people waiting in line.

### Key Operations
- **Enqueue**: Add an element to the back (tail) of the queue. $O(1)$
- **Dequeue**: Remove and return the front (head) element. $O(1)$
- **Peek/Front**: View the front element without removing it. $O(1)$

```python
from collections import deque
queue = deque()
queue.append(1)   # Enqueue 1
queue.append(2)   # Enqueue 2
front = queue.popleft() # Dequeue 1 -> returns 1
```

## Memory & Implementations

Both stacks and queues can be implemented using either **Arrays** (contiguous memory blocks) or **Linked Lists** (dynamic pointer nodes).

<Visualizer type="MemoryLayout" data='{"blocks": 4, "type": "int", "size": 4}' />
