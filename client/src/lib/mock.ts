import type { Track, Problem, Submission } from "@shared/schema";

export const mockTracks: Track[] = [
  {
    id: 1,
    title: "Algorithms",
    description: "Master the fundamental building blocks of computer science.",
    icon: "Cpu",
    problemCount: 45
  },
  {
    id: 2,
    title: "Data Structures",
    description: "Learn how to organize and store data efficiently.",
    icon: "Database",
    problemCount: 32
  },
  {
    id: 3,
    title: "System Design",
    description: "Design scalable systems for millions of users.",
    icon: "Server",
    problemCount: 18
  }
];

export const mockProblems: Problem[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    category: "Array",
    trackId: 1,
    order: 1
  },
  {
    id: 2,
    slug: "reverse-linked-list",
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Easy",
    category: "Linked List",
    trackId: 2,
    order: 1
  },
  {
    id: 3,
    slug: "lru-cache",
    title: "LRU Cache",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    difficulty: "Medium",
    category: "Design",
    trackId: 2,
    order: 2
  },
  {
    id: 4,
    slug: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "Hard",
    category: "Linked List",
    trackId: 2,
    order: 3
  },
  {
    id: 5,
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    category: "Stack",
    trackId: 2,
    order: 4
  },
  {
    id: 6,
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium",
    category: "Array",
    trackId: 1,
    order: 2
  },
  {
    id: 7,
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    category: "Dynamic Programming",
    trackId: 1,
    order: 3
  },
  {
    id: 8,
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "Hard",
    category: "Array",
    trackId: 1,
    order: 4
  }
];

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    userId: 1,
    problemId: 1,
    code: "function twoSum(nums, target) { ... }",
    status: "Accepted",
    createdAt: new Date("2024-03-10T10:00:00Z")
  },
  {
    id: 2,
    userId: 1,
    problemId: 1,
    code: "function twoSum(nums, target) { ... }",
    status: "Wrong Answer",
    createdAt: new Date("2024-03-10T09:45:00Z")
  },
  {
    id: 3,
    userId: 1,
    problemId: 5,
    code: "function isValid(s) { ... }",
    status: "Accepted",
    createdAt: new Date("2024-03-11T14:20:00Z")
  }
];
