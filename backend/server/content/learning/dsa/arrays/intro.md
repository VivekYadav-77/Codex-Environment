---
title: "Introduction to Arrays"
description: "Understand the fundamentals of arrays in memory."
level: "Beginner"
track: "DSA Mastery"
order: 1
---

# Introduction to Arrays

An **array** is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together. This makes it easier to calculate the position of each element by simply adding an offset to a base value.

## Memory Visualization

When you create an array in most languages, the OS allocates a contiguous block of memory.

<Visualizer type="MemoryLayout" data='{"blocks": 5, "type": "int", "size": 4}' />

### Key Operations

1. **Access**: $O(1)$ time complexity because we can calculate the memory address directly.
2. **Search**: $O(N)$ for unsorted arrays, as we might need to check every element.
3. **Insertion/Deletion**: $O(N)$ at the beginning or middle, because we need to shift all subsequent elements.

## Code Example

```cpp
// C++ Array Example
int arr[5] = {10, 20, 30, 40, 50};
// Accessing element at index 2
cout << arr[2]; // Outputs 30
```

> Arrays are highly cache-friendly because their elements are stored in contiguous memory locations.
