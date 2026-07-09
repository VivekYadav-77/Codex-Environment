---
title: "Designing a URL Shortener"
description: "Learn how to build a scalable URL shortener like bit.ly."
level: "Intermediate"
track: "System Design"
order: 1
---

# Designing a URL Shortener

A URL shortener is a service that creates short aliases for long URLs. When a user clicks these short links, they are redirected to the original URL. 

## Requirements

- **Functional:** Given a long URL, generate a short alias. Redirect short links to long URLs.
- **Non-Functional:** Highly available, low latency for redirection, and scalable to millions of requests.

## System Architecture

Let's visualize the request flow. 

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. User Request", "description": "User submits a long URL to the Web Server."},
    {"title": "2. Web Server", "description": "Server checks the Cache for the URL."},
    {"title": "3. Cache Miss", "description": "If not in cache, query the Database."},
    {"title": "4. Database", "description": "Database returns the long URL. Save to Cache."},
    {"title": "5. Redirect", "description": "Server responds with 301 Redirect."}
  ]
}' />

### Capacity Estimation

- **Write Operations:** 100M URLs generated per month.
- **Read Operations:** 10B redirections per month (100:1 read-to-write ratio).

This makes the system heavily **Read-Heavy**, so caching will be critical for performance.
