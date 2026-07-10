---
title: "Dynamic Programming"
description: "Master overlapping subproblems, memoization vs. tabulation, and Knapsack patterns."
level: "Advanced"
track: "DSA Mastery"
order: 6
---

# Dynamic Programming

**Dynamic Programming (DP)** is a powerful algorithmic paradigm used to solve optimization problems. It works by breaking down a problem into simpler, overlapping subproblems and storing their results to avoid redundant calculations.

## The Two Key Requirements

A problem can be solved using Dynamic Programming if it has:
1. **Overlapping Subproblems**: The same subproblems are solved repeatedly during recursion. (e.g., in Fibonacci: $F(5) = F(4) + F(3)$, and both need $F(3)$).
2. **Optimal Substructure**: The optimal solution to the problem can be constructed from optimal solutions of its subproblems.

---

## Top-Down vs. Bottom-Up

There are two primary approaches to implement DP:

### 1. Top-Down (Memoization)
Start with the main problem and recursively break it down. Before solving a subproblem, check a hash table or array cache. If already solved, return the cached result.
- **Implementation**: Recursion + Cache.
- **Pros**: Easy to write; only computes subproblems that are actually needed.

### 2. Bottom-Up (Tabulation)
Start with the smallest subproblems (base cases) and solve larger subproblems iteratively, filling up a table (1D or 2D array).
- **Implementation**: Iteration + Table.
- **Pros**: Avoids stack overflow; faster execution due to lack of recursion overhead.

---

## Standard DP Problems
1. **0/1 Knapsack**: Choose items with weights and values to maximize value within a weight limit.
2. **Longest Common Subsequence (LCS)**: Find the longest subsequence common to two strings.
3. **Coin Change**: Find the minimum number of coins to make a target sum.
4. **Edit Distance**: Find the minimum operations to transform one string into another.
