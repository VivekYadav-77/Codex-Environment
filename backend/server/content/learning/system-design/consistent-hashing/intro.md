---
title: "Consistent Hashing"
description: "Learn how consistent hashing scales distributed caches and databases with minimal key relocation."
level: "Intermediate"
track: "System Design"
order: 4
---

# Consistent Hashing

In a distributed database or caching cluster, we need to partition data across multiple server nodes. 

## The Problem with Simple Hashing

The traditional approach uses the modulo operator:
$$\text{Server ID} = \text{hash}(\text{key}) \pmod N$$
where $N$ is the number of servers.
- **The Issue**: If a server is added or removed, $N$ changes. Consequently, almost all keys map to new servers. This results in massive cache misses or database re-sharding storms.

---

## The Consistent Hashing Solution

Consistent Hashing maps both **servers** and **keys** to a circular ring of range $0$ to $2^{32}-1$.

### Request Flow and Key Distribution

Let's visualize how keys are mapped and what happens during server membership changes:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. The Hash Ring", "description": "A circular hash ring is initialized from values 0 to 2^32 - 1."},
    {"title": "2. Place Servers", "description": "Server nodes are hashed and placed at specific coordinates on the ring."},
    {"title": "3. Map Keys", "description": "Keys (e.g., user IDs) are hashed. We traverse clockwise to find the first server node."},
    {"title": "4. Server Addition", "description": "A new server is added. Only keys located between the new server and its counter-clockwise neighbor are moved."},
    {"title": "5. Virtual Nodes", "description": "To prevent uneven distribution (hotspots), servers are hashed multiple times (virtual nodes) to distribute their placement evenly."}
  ]
}' />

### Advantages
- **Minimal Key Movement**: On average, only $K/N$ keys need to be relocated when a node changes, where $K$ is the total keys and $N$ is the number of servers.
- **Load Balancing**: Virtual nodes ensure keys are distributed evenly across physical machines of varying capacities.
