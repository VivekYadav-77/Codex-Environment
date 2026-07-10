---
title: "Trees and Binary Search Trees"
description: "Understand hierarchical data structures, binary trees, and binary search trees (BST)."
level: "Intermediate"
track: "DSA Mastery"
order: 4
---

# Trees and Binary Search Trees

A **Tree** is a non-linear, hierarchical data structure consisting of nodes connected by edges. Unlike arrays and linked lists, trees are organized top-down.

## Key Terminology
- **Root**: The topmost node of the tree.
- **Parent / Child**: A node directly connected to another node moving down is its child; the upward node is the parent.
- **Leaf**: A node with no children.
- **Subtree**: A tree consisting of a node and all of its descendants.

---

## Binary Trees

A **Binary Tree** is a tree where each node has at most **two children**, referred to as the left child and the right child.

### Traversals
To visit all nodes in a binary tree, we use traversal algorithms:
1. **Inorder (LNR)**: Traverse left, visit node, traverse right. (For BSTs, this yields sorted order).
2. **Preorder (NLR)**: Visit node, traverse left, traverse right. (Useful for copying a tree).
3. **Postorder (LRN)**: Traverse left, traverse right, visit node. (Useful for deleting a tree).
4. **Level-Order (BFS)**: Visit nodes level-by-level from top to bottom.

---

## Binary Search Trees (BST)

A **Binary Search Tree** is a binary tree with the **BST Property**:
- The value of all nodes in the **left subtree** must be less than the node's value.
- The value of all nodes in the **right subtree** must be greater than the node's value.

```
       8 (Root)
      / \
     3   10
    / \    \
   1   6    14
```

### Complexities

| Operation | Average Case | Worst Case |
| :--- | :--- | :--- |
| **Search** | $O(\log N)$ | $O(N)$ (skewed tree) |
| **Insertion** | $O(\log N)$ | $O(N)$ |
| **Deletion** | $O(\log N)$ | $O(N)$ |

*Self-balancing trees like AVL or Red-Black trees guarantee $O(\log N)$ for all operations by rebalancing after insertions/deletions.*
