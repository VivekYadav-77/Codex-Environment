---
title: "Introduction to Graphs"
description: "Learn graph representations (adjacency lists vs. matrices) and traversal (BFS/DFS)."
level: "Intermediate"
track: "DSA Mastery"
order: 5
---

# Introduction to Graphs

A **Graph** is a non-linear data structure consisting of two components:
1. A set of **Vertices** (nodes).
2. A set of **Edges** (connections between vertices).

Graphs are highly versatile and represent real-world networks such as social connections, road networks, and airline routes.

## Classification of Graphs

- **Directed vs. Undirected**: Directed graphs have edges with arrows (one-way relationships); undirected graphs have bidirectional edges.
- **Weighted vs. Unweighted**: Weighted graphs have values associated with edges (representing distance, cost, or time).
- **Cyclic vs. Acyclic**: Cyclic graphs contain paths that can start and end at the same vertex.

---

## Graph Representations

The two primary ways to represent a graph in memory are:

1. **Adjacency Matrix**: A 2D array of size $V \times V$ where `matrix[i][j] = 1` indicates an edge between vertex `i` and `j`.
   - **Space**: $O(V^2)$
   - **Lookup**: $O(1)$ to check if edge exists.
2. **Adjacency List**: An array of lists where `list[i]` contains all neighbors of vertex `i`.
   - **Space**: $O(V + E)$
   - **Lookup**: $O(\text{degree}(V))$ to check if edge exists.

---

## Graph Traversals

To explore nodes in a graph, we use two key traversal techniques:

### 1. Breadth-First Search (BFS)
Explores neighbors at the current depth before moving deeper. BFS uses a **Queue** and is optimal for finding the shortest path in unweighted graphs.
- **Time Complexity**: $O(V + E)$
- **Space Complexity**: $O(V)$

### 2. Depth-First Search (DFS)
Explores along each branch as far as possible before backtracking. DFS uses a **Stack** (or recursion) and is useful for cycle detection and topological sorting.
- **Time Complexity**: $O(V + E)$
- **Space Complexity**: $O(V)$
