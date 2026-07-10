---
title: "The CAP Theorem"
description: "Master Consistency, Availability, Partition Tolerance, and the PACELC trade-offs."
level: "Beginner"
track: "System Design"
order: 3
---

# The CAP Theorem

The **CAP Theorem** states that a distributed system can deliver at most two of the following three guarantees:

1. **Consistency (C)**: Every read receives the most recent write or an error.
2. **Availability (A)**: Every non-failing node returns a non-error response (without guarantee of containing the most recent write).
3. **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

---

## The Core Trade-off

Because physical networks are inherently unreliable, **Partition Tolerance (P) is a must**. Therefore, we must choose between:
- **CP (Consistency / Partition Tolerance)**: Reject requests or block until the partition heals to ensure data is correct.
- **AP (Availability / Partition Tolerance)**: Accept requests and return local (possibly stale) data to ensure uptime.

Let's visualize what happens during a network partition:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. Network Partition", "description": "Connection between database Node A and Node B is broken."},
    {"title": "2. Client Write", "description": "Client writes new data to Node A. Node A cannot sync this write to Node B."},
    {"title": "3. Client Read from B", "description": "Another client attempts to read from Node B."},
    {"title": "4. CP Mode Choice", "description": "In CP mode, Node B rejects the read or blocks to maintain consistency, sacrificing availability."},
    {"title": "5. AP Mode Choice", "description": "In AP mode, Node B returns its old stale data, maintaining availability but sacrificing consistency."}
  ]
}' />

---

## Beyond CAP: The PACELC Theorem

PACELC extends CAP by describing the trade-offs during normal operation (when there are **E**lse no partitions):
- **P**artition **A**vailability or **C**onsistency.
- **E**lse, **L**atency or **C**onsistency.

For example, databases like MongoDB choose **PC/EC** (Consistency during partitions, Consistency during normal operations), whereas Amazon's DynamoDB uses **PA/EL** (Availability and low Latency).
