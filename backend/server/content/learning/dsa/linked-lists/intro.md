---
title: "Linked Lists"
description: "Master singly and doubly linked lists, node pointers, and Floyd's cycle detection."
level: "Beginner"
track: "DSA Mastery"
order: 2
---

# Linked Lists

A **linked list** is a linear data structure where elements are not stored at contiguous memory locations. Instead, each element is a separate object called a **Node**, which contains:
1. The **Data** (value).
2. A **Pointer** (reference) to the next node in the sequence.

Unlike arrays, linked lists can dynamically grow and shrink in size without requiring expensive reallocations.

## Memory Visualization

While arrays are contiguous, linked list nodes are scattered across the heap. Each node points to the next memory address:

<Visualizer type="MemoryLayout" data='{"blocks": 4, "type": "Node", "size": 8}' />

*(Note: The addresses above are non-contiguous in real physical memory, but are chained sequentially via pointers.)*

### Key Operations

1. **Access**: $O(N)$ time complexity because we must traverse from the Head node.
2. **Search**: $O(N)$ as we inspect nodes one by one.
3. **Insertion/Deletion (at head)**: $O(1)$ constant time.
4. **Insertion/Deletion (at tail)**: $O(N)$ without a tail pointer, or $O(1)$ with a tail pointer.

## Singly vs. Doubly Linked Lists

- **Singly Linked List**: Each node points only to the next node.
- **Doubly Linked List**: Each node contains two pointers: one pointing to the next node, and one pointing to the previous node. This allows bidirectional traversal.

## Code Example

```javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Inserting a node after a given node
function insertAfter(prevNode, newVal) {
    if (!prevNode) return;
    const newNode = new ListNode(newVal);
    newNode.next = prevNode.next;
    prevNode.next = newNode;
}
```

> **Floyd's Cycle Detection Algorithm (Fast & Slow Pointers)**: To detect if a linked list has a cycle, use two pointers moving at different speeds. If a cycle exists, the fast pointer ($2\times$ speed) will eventually meet the slow pointer ($1\times$ speed).
