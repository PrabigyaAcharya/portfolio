---
title: "Avritti: Generating Music with Genetic Algorithms"
date: 2026-04-28
tags: [genetic-algorithms, music-generation, python]
summary: "Exploring algorithmic music generation through evolutionary systems — using selection, crossover, and mutation to evolve melodies from scratch."
draft: false
math: false
---

Most people associate music with emotion, creativity, and human expression. Algorithms, on the other hand, are usually linked with logic, rules, and computation.

But what happens when both worlds meet?

That question led us to build **Avritti**, a project focused on generating music using genetic algorithms. Instead of relying on modern deep learning models or pre-trained datasets, this project explored a different direction — using evolutionary principles to create melodies from scratch.

Avritti was created as a capstone project for the Artificial Intelligence subject in our seventh semester. It is currently hosted at [music.prabigya.com.np](https://music.prabigya.com.np).

## The Idea Behind Avritti

Genetic algorithms are optimization techniques inspired by natural selection.

The process is simple in theory:

- Create a population of random candidates
- Evaluate how good each candidate is
- Keep the better ones
- Combine them
- Introduce small mutations
- Repeat over multiple generations

Over time, stronger solutions begin to emerge. In our case, those "solutions" were musical sequences.

## Why Use Genetic Algorithms for Music?

Music generation is an interesting problem because there is no single correct answer. A melody can be technically valid but still sound unpleasant. Another may be simple but memorable.

That makes music a strong use case for evolutionary systems. Rather than explicitly programming every possible musical rule, we allow patterns to evolve gradually based on scoring criteria. This gives the system room to discover combinations that may not be obvious from fixed rules alone.

## How It Works

Each melody is represented as a sequence containing notes, timing, and structure. The system begins by generating multiple random melodies, then evaluates them using fitness criteria such as:

- Note transitions
- Rhythm consistency
- Repetition balance
- Variation
- Overall harmony

The higher-scoring melodies are selected for the next generation.

### Crossover

Parts of two melodies are combined to form a new one:

```
Parent A: C D E G
Parent B: A G E D
Child:    C D E D
```

### Mutation

Small random changes are introduced to keep diversity in the population:

- Changing a note
- Shifting pitch
- Adjusting duration
- Replacing segments

Without mutation, the system converges and becomes repetitive too quickly.

## Project Structure

The project is built in Python with a modular layout:

- `main.py` — backend application
- `genetic_backbone.py` — evolutionary logic
- `melody.py` — melody representation and handling
- `frontend/` — browser interface

This structure made it easier to test scoring systems, generation rules, and playback features independently.

## What We Learned

One of the most interesting parts was watching unexpected musical patterns emerge. Some generated outputs contained repeated hooks, balanced phrasing, structured rhythm, and pleasant transitions.

At the same time, not every generation sounded good. Some melodies felt random. Others became too repetitive.

That highlighted an important challenge in algorithmic creativity: **designing the fitness function matters just as much as the algorithm itself.** If the scoring system rewards the wrong things, the output quickly reflects it.

## Why This Was Worth Exploring

Most current discussions around AI-generated music focus entirely on neural networks and massive datasets. Avritti explored another side of computational creativity — that generation does not always require training large models. Useful and interesting outputs can come from smaller systems built around search, selection, and iteration.

That makes genetic algorithms valuable not just for optimization, but for experimentation.

## Links

- Live: [music.prabigya.com.np](https://music.prabigya.com.np)
- Source: [github.com/PrabigyaAcharya/Avritti](https://github.com/PrabigyaAcharya/Avritti)
