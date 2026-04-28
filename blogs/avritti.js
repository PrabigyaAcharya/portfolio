const avritti = {
    id: 4,
    title: 'Avritti: Generating Music with Genetic Algorithms',
    date: '2026-04-28',
    excerpt: 'Exploring algorithmic music generation through evolutionary systems.',
    content: `# Avritti: Generating Music with Genetic Algorithms

Most people associate music with emotion, creativity, and human expression. Algorithms, on the other hand, are usually linked with logic, rules, and computation.

But what happens when both worlds meet?

That question led us to build **Avritti**, a project focused on generating music using **Genetic Algorithms**. Instead of relying on modern deep learning models or pre-trained datasets, this project explored a different direction — using evolutionary principles to create melodies from scratch.

Avritti was created as a capstone project for AI in our seventh semester, it is currently hosted at:

**https://music.prabigya.com.np**

## The Idea Behind Avritti

Genetic Algorithms are optimization techniques inspired by natural selection.

The process is simple in theory:

- Create a population of random candidates  
- Evaluate how good each candidate is  
- Keep the better ones  
- Combine them  
- Introduce small mutations  
- Repeat the process over multiple generations  

Over time, stronger solutions begin to emerge.

In our case, those “solutions” were musical sequences.

Instead of evolving numbers or mathematical outputs, Avritti evolves melodies.

## Why Use Genetic Algorithms for Music?

Music generation is an interesting problem because there is no single correct answer.

A melody can be technically valid but still sound unpleasant. Another melody may be simple but memorable.

That makes music a strong use case for experimentation with evolutionary systems. Rather than explicitly programming every possible musical rule, we can allow patterns to evolve gradually based on scoring criteria.

This gives the system room to discover combinations that may not be obvious from fixed rules alone.

## How It Works

Each melody is represented as a sequence containing notes, timing, and structure.

The system begins by generating multiple random melodies. These are then evaluated using fitness criteria such as:

- Note transitions  
- Rhythm consistency  
- Repetition balance  
- Variation  
- Overall harmony  

The higher scoring melodies are selected for the next generation.

Two important operations drive the system forward.

### Crossover

Parts of two melodies are combined to form a new one.

For example:

Parent A: C D E G  
Parent B: A G E D  
Child: C D E D

### Mutation

Small random changes are introduced to keep diversity in the population.

This may include:

- Changing a note  
- Shifting pitch  
- Adjusting duration  
- Replacing segments  

Without mutation, the system can become repetitive too quickly.

## Project Structure

The project was built using Python and separated into multiple components for clarity and experimentation.

Some of the core modules include:

- \`main.py\` for the backend application  
- \`genetic_backbone.py\` for the evolutionary logic  
- \`melody.py\` for melody representation and handling  
- \`frontend/\` for the browser interface  

This modular structure made it easier to test scoring systems, generation rules, and playback features independently.

## What We Learned

One of the most interesting parts of the project was seeing how unexpected musical patterns began to emerge.

Some generated outputs contained:

- Repeated hooks  
- Balanced phrasing  
- Structured rhythm  
- Pleasant transitions  

At the same time, not every generation sounded good.

Some melodies felt random. Others became too repetitive.

That highlighted an important challenge in algorithmic creativity.

Designing the fitness function matters just as much as the algorithm itself.

If the scoring system rewards the wrong things, the output quickly reflects it.

## Why This Project Was Interesting

Many current discussions around AI-generated music focus entirely on neural networks and massive datasets.

Avritti explored another side of computational creativity.

It showed that generation does not always require training large models. Sometimes useful and interesting outputs can come from smaller systems built around search, selection, and iteration.

That makes Genetic Algorithms valuable not just for optimization, but also for experimentation.

## Live Deployment

The project is available online here:

**https://music.prabigya.com.np**

You can also explore the source code here:

**https://github.com/PrabigyaAcharya/Avritti**

## Final Thoughts

Avritti was built as a group project to explore how music and computation can interact in unconventional ways.

It combined theory, experimentation, and creativity into a single system.

More importantly, it demonstrated that sometimes the most interesting technical ideas come from revisiting older approaches and applying them to new problems.

Not every solution needs to be large-scale.

Sometimes evolution is enough.
`
}

export default avritti