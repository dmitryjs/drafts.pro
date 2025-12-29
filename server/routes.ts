import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const tracks = await storage.getTracks();
  if (tracks.length === 0) {
    console.log("Seeding database...");
    
    // Create Tracks
    const algoTrack = await storage.createTrack({
      title: "Algorithms",
      description: "Master the basics of algorithms",
      icon: "Cpu",
      problemCount: 5
    });
    
    const dsTrack = await storage.createTrack({
      title: "Data Structures",
      description: "Learn essential data structures",
      icon: "Database",
      problemCount: 3
    });

    const systemTrack = await storage.createTrack({
      title: "System Design",
      description: "Design scalable systems",
      icon: "Server",
      problemCount: 0
    });

    // Create Problems
    await storage.createProblem({
      slug: "two-sum",
      title: "Two Sum",
      description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      difficulty: "Easy",
      category: "Arrays",
      trackId: algoTrack.id,
      order: 1
    });

    await storage.createProblem({
      slug: "reverse-linked-list",
      title: "Reverse Linked List",
      description: "Reverse a singly linked list.",
      difficulty: "Easy",
      category: "Linked Lists",
      trackId: dsTrack.id,
      order: 1
    });

    await storage.createProblem({
      slug: "lru-cache",
      title: "LRU Cache",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
      difficulty: "Medium",
      category: "Design",
      trackId: dsTrack.id,
      order: 2
    });
    
    // Add more mock data...
    console.log("Database seeded!");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed data on startup
  seedDatabase();

  // Health
  app.get(api.health.check.path, (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  // Tracks
  app.get(api.tracks.list.path, async (_req, res) => {
    const tracks = await storage.getTracks();
    res.json(tracks);
  });

  // Problems
  app.get(api.problems.list.path, async (req, res) => {
    const problems = await storage.getProblems();
    res.json(problems);
  });

  app.get(api.problems.get.path, async (req, res) => {
    const problem = await storage.getProblemBySlug(req.params.slug);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  });

  // Submissions
  app.get(api.submissions.list.path, async (_req, res) => {
    const submissions = await storage.getSubmissions();
    res.json(submissions);
  });

  app.post(api.submissions.create.path, async (req, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      const submission = await storage.createSubmission(input);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
