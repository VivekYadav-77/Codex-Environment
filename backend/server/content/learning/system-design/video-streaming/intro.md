---
title: "Designing Video Streaming"
description: "Learn how to design highly scalable video streaming systems like YouTube and Netflix."
level: "Interview"
track: "System Design"
order: 6
---

# Designing Video Streaming

Video streaming systems (like YouTube or Netflix) support uploading, storing, encoding, and playing back high-definition videos to millions of concurrent users.

---

## High-Level Architecture and Data Flow

The system consists of two major flows:
1. **Video Ingestion / Transcoding (Write Path)**: Processing uploaded videos.
2. **Video Playback (Read Path)**: Distributing video streams dynamically.

Let's visualize the end-to-end request flow:

<Visualizer type="ArchitectureAnimator" data='{
  "steps": [
    {"title": "1. Video Upload", "description": "A creator uploads a high-definition raw video file to the Web Server."},
    {"title": "2. Ingestion & Transcoding", "description": "Raw video is split into chunks and processed by transcoders into multiple resolutions (1080p, 720p, 480p) and formats (HLS, DASH)."},
    {"title": "3. CDN Distribution", "description": "Transcoded video chunks are distributed to regional CDN Edge caches around the globe."},
    {"title": "4. Playback Request", "description": "A viewer requests the video. The API returns a Manifest file (.m3u8) listing chunk URLs."},
    {"title": "5. Adaptive Bitrate Streaming", "description": "The client player pulls chunks from the nearest CDN Edge, dynamically adjusting quality (bitrate) based on network speed."}
  ]
}' />

---

## Core Technical Deep Dives

### 1. Transcoding Pipeline
Raw video files are massive. We must encode them to support varying bandwidth conditions and devices.
- **Protocols**: 
  - **HLS (HTTP Live Streaming)**: Developed by Apple, widely supported.
  - **DASH (Dynamic Adaptive Streaming over HTTP)**: Open standard.
- **Parallelization**: Videos are split into 2-5 second chunks and transcoded concurrently on distributed worker clusters.

### 2. Storage Strategy
- **Video Chunks**: Stored in Object Stores (e.g., AWS S3, Google Cloud Storage).
- **Metadata**: Stored in relational databases (SQL) or document stores (NoSQL) for fast catalog search.
- **Cache**: CDNs store the hot video chunks. The origin server is only queried for rare or newly uploaded videos.
