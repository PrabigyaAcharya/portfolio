---
title: "Dataset for Next-Generation 3D Understanding"
date: 2026-04-23
tags: [3d-gaussian-splatting, computer-vision, datasets, benchmarks]
summary: "A hierarchical dataset built on Gaussian Splat scenes for evaluating AI spatial reasoning — from individual objects up through rooms and full scenes."
draft: false
math: false
---

Imagine standing in a kitchen, looking at the cooking utensils, the ingredients in the fridge and pantry, the tools on the counter. When we move through a room, we view objects, read labels, check dates, see if the fruit is rotten — taking in all the visual cues that help us make sense of the spatial and functional arrangement of the space. If you asked a human to make tea, they can search for the kettle where the utensils are kept, find tea and sugar in the pantry, and prepare it. Now imagine asking the best commercial AI today to do the same in that 3D space. There would be a lot of problems to tackle before we get there.

## The Gap in 3D Understanding

AI systems that combine vision and language have gotten remarkably good at understanding photographs. Show one a picture of a dog and it will tell you the breed. Show it a cluttered desk and it can describe what's on it. But 3D environments are a different story.

When an AI needs to reason over a real room with depth, scale, and relationships between objects, things fall apart. The same reference can apply to similar objects nearby. The context of reasoning can be too long and cause hallucination. And the quality of the representation itself can be a problem — textures that are not describable, text that is not readable.

## Two Blind Spots in Existing Benchmarks

Most existing 3D understanding tests used **point clouds**. You get the rough shape of furniture but lose all texture, color, and material detail. You can have accurate spatial information of the scene, but you lose the fine-grained details that matter enormously. If you cannot read a label on an ingredient in a kitchen scene, how do you guide a system to prepare something?

The second problem: these tests treated every object as a separate entity. A chair is just a chair. But in a real room, that chair sits at a dining table, which is in a dining area, which is part of a larger apartment. A human understands easily if someone says "rearrange the chairs in the dining area to fit more people." For AI, this kind of reasoning is hard because it lacks any description of a dining area when multiple arrangements of tables and chairs are present. Context and hierarchy matter enormously for how we understand space — and no existing benchmark captured that.

## What We Built

We designed a benchmark that addresses both problems.

**Representation:** The scenes are represented using Gaussian Splats, which reconstruct a space so realistically that you can view it from any angle with all textures and lighting intact. Instead of a dot skeleton, you get something that looks like actually being inside the room.

**Hierarchy:** We built a hierarchical map of meaning into every scene. Each scene is annotated not just at the object level, but all the way up through object groups, functional areas, rooms, and the full scene. It works like a family tree of meaning — from the big picture down to the individual peach sitting in a fruit bowl.

We did this across 969 scenes — a mix of real-world apartments and high-quality synthetic interiors — producing over 183,000 annotated elements with text descriptions and precise 3D bounding boxes.

## The Benchmark Tasks

We designed three categories of tasks:

- **Existence questions** — does an object with a certain color or material appear in the scene?
- **Spatial questions** — how many chairs are there? Which object is closer to the window?
- **Multi-step reasoning** — what does the design of a space tell you about the person who lives there?

We tested a range of leading AI systems across all three. On basic existence questions, the best models reached around 85% accuracy. On spatial tasks like counting or judging distances, accuracy dropped to around 60% or below. The multi-step reasoning tasks exposed even deeper gaps — especially anything involving missing objects or understanding how furniture physically constrains other furniture.

## What It Tells Us

AI can name the objects in a room. But truly understanding the space the way a person does when they walk in and immediately get a sense of how someone lives — that is still an open challenge.

This dataset is a first step toward addressing it.
