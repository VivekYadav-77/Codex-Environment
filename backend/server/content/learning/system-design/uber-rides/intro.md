---
title: "Designing Ride-Hailing"
description: "Master geo-spatial indexing, real-time driver tracking, and ride matching like Uber."
level: "Interview"
track: "System Design"
order: 7
---

# Designing Ride-Hailing

A ride-hailing system (like Uber or Lyft) matches riders with nearby drivers in real-time, requiring high-throughput location updates and rapid geo-spatial queries.

---

## The Geo-Spatial Challenge

With millions of active drivers updating their GPS coordinates every few seconds, a standard database query:
```sql
SELECT driver_id FROM locations WHERE lat BETWEEN x1 AND x2 AND lng BETWEEN y1 AND y2;
```
is too slow because 2D indexes are highly inefficient at scale.

### Geo-Spatial Indexing Solution
We partition the world into distinct geometric cells:
- **Geohash**: Divides the Earth into a grid of hierarchical string hashes (e.g., `dr5reg`).
- **Google H3**: Hexagonal hierarchical spatial index.
- **Quadtree**: Hierarchical tree structure where each node has four children.

---

## System Architecture and Request Flow

Let's visualize how location tracking and driver matching work in real-time:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. Location Updates", "description": "Active drivers send GPS coordinates over WebSockets every 4 seconds to the Gateway."},
    {"title": "2. Memory Grid Cache", "description": "Server updates driver coordinates in an in-memory geo-index (e.g., Redis Geospatial / H3 index)."},
    {"title": "3. Ride Request", "description": "Rider requests a ride. API Gateway receives the location and searches the local grid cells for active drivers."},
    {"title": "4. Match Engine", "description": "Match Engine checks top drivers, calculates estimated arrival times (ETA), and sends requests to drivers."},
    {"title": "5. Accept & Stream", "description": "Driver accepts the ride. Gateway streams coordinates to the rider over a Pub/Sub topic (WebSockets)."}
  ]
}' />

---

## Core Resiliency and Scale

- **Partitioning**: Shard driver locations in memory by Geohash or H3 cell IDs to distribute memory load.
- **Storage**:
  - **Dynamic State**: In-memory store (Redis) for real-time driver locations.
  - **Historical Trips**: Distributed column store (Cassandra) for trip details, billing, and receipts.
- **WebSocket Gateway**: High-capacity servers maintaining millions of persistent connections, decoupled from matching engines via message queues.
