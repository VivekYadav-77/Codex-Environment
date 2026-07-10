---
title: "DNS and CDN"
description: "Understand Domain Name Systems, global content delivery networks, and edge caching."
level: "Beginner"
track: "System Design"
order: 2
---

# DNS and CDN

To build global, low-latency web applications, we must distribute content closer to users and map readable names (like google.com) to machine IP addresses.

---

## 1. Domain Name System (DNS)

DNS is the phonebook of the internet. When you enter a URL, your browser performs a hierarchical lookup to locate the IP address of the target server:

1. **Local Resolver**: Checks local cache. If a cache miss occurs, queries the Root Nameserver.
2. **Root Server (`.`)**: Points to the Top-Level Domain (TLD) server (e.g., `.com`).
3. **TLD Nameserver**: Points to the Authoritative Nameserver for the specific domain.
4. **Authoritative Nameserver**: Returns the IP address mapping (e.g., A record, CNAME).

---

## 2. Content Delivery Networks (CDN)

A **Content Delivery Network (CDN)** is a geographically distributed group of servers (called Edge servers or Points of Presence - PoPs) that work together to provide fast delivery of static content (images, JS, CSS, video files).

### Request Routing and Caching Flow

Let's visualize the request path when a user fetches static assets:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. User Requests Asset", "description": "User requests an image. DNS routes the request to the nearest CDN Edge node."},
    {"title": "2. CDN Edge Cache Check", "description": "Edge node checks if the asset is in its local cache (Cache Hit)."},
    {"title": "3. CDN Cache Miss", "description": "If the asset is missing, the Edge node queries the Origin Web Server."},
    {"title": "4. Origin Server Response", "description": "The Origin Server returns the asset. The CDN Edge caches it for future users."},
    {"title": "5. Delivery to User", "description": "CDN Edge responds to the user with low latency."}
  ]
}' />

### Caching Strategies
- **TTL (Time to Live)**: Defines how long the CDN caches an item before asking the origin for updates.
- **Cache Invalidation**: Forcing a purge of cached assets when updates occur (e.g., via versioned filenames like `main.v2.js` or manual API purges).
