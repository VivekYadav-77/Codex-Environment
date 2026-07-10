---
title: "Microservices Architecture"
description: "Master Monolith vs. Microservices, API Gateways, Service Discovery, and Circuit Breakers."
level: "Intermediate"
track: "System Design"
order: 5
---

# Microservices Architecture

In modern system design, we transition from single, unified codebases (Monoliths) to a suite of small, independent services (Microservices) that communicate over lightweight protocols (HTTP, gRPC).

---

## Key Core Components

1. **API Gateway**: The single entry point for clients. Handles authentication, routing, rate limiting, and response aggregation.
2. **Service Discovery / Registry**: A dynamic directory (e.g., Consul, Eureka) that tracks the IP addresses of running microservice instances.
3. **Message Queue / Event Bus**: Facilitates asynchronous, event-driven communications between services (e.g., Kafka, RabbitMQ).
4. **Database Per Service**: Each microservice manages its own database to guarantee loose coupling.

---

## Request Flow and Failover

Let's visualize the client request lifecycle in a microservices architecture:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. Client Request", "description": "Client sends an API request to the system Gateway."},
    {"title": "2. Gateway Routing", "description": "API Gateway authenticates the request and queries Service Discovery for the order-service IP."},
    {"title": "3. Service Call", "description": "Gateway routes the request to order-service. order-service calls inventory-service to check stock."},
    {"title": "4. Circuit Breaker Trip", "description": "If inventory-service fails, the Circuit Breaker trips immediately, returning a fallback response to avoid cascading failure."},
    {"title": "5. Asynchronous Event", "description": "Once checkout finishes, order-service publishes an Event to the Queue. email-service pulls the event to send confirmation."}
  ]
}' />

---

## Core Resiliency Patterns

- **Circuit Breaker**: Prevents a failing service from causing cascading failures. If errors exceed a threshold, it transitions to "Open" and rejects calls instantly, returning fallbacks.
- **Bulkhead**: Isolates resources (like thread pools) so that if one service fails, others continue running.
- **Saga Pattern**: Manages distributed transactions across multiple services using a sequence of local transactions and compensating actions.
