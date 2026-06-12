// AUTO-GENERATED — do not edit by hand; run `npm run bundle-content`
// Generated at: 2026-06-10T19:11:06.438Z

export interface ResearchThread {
  id: string;
  name: string;
  blurb: string;
}

export interface SiteLinks {
  github: string;
  scholar: string;
  email: string;
  linkedin: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  location: string;
  links: SiteLinks;
  mcp_endpoint: string;
  research_threads: ResearchThread[];
}

export interface PublicationLinks {
  pdf?: string;
  arxiv?: string;
  code?: string;
  poster?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  thread: string;
  summary: string;
  abstract: string;
  backstory?: string;
  links: PublicationLinks;
  bibtex: string;
  selected: boolean;
}

export interface NowData {
  updated: string;
  working_on: string[];
  reading: string[];
  open_to: string[];
}

export interface CVEntry {
  org: string;
  role: string;
  start: string;
  end: string;
  details?: string[];
}

export interface CvProject {
  title: string;
  description: string;
  tech: string[];
  link: string;
}

export interface CvData {
  education: CVEntry[];
  positions: CVEntry[];
  projects?: CvProject[];
  skills: string[];
  service: string[];
  awards: string[];
}

export interface EvalQuestion {
  id: string;
  question: string;
  type: 'exact' | 'numeric' | 'judged';
  tolerance?: number;
}

export interface NotebookPost {
  slug: string;
  title: string;
  date: string;
  updated: string | null;
  tags: string[];
  summary: string;
  draft: boolean;
  math: boolean;
  content: string;
}

export const site: SiteConfig = {
  "name": "Prabigya Acharya",
  "tagline": "TODO(prabigya): one humble sentence about your research",
  "location": "Kathmandu, Nepal",
  "links": {
    "github": "TODO(prabigya)",
    "scholar": "TODO(prabigya)",
    "email": "acharyaprabigya@gmail.com",
    "linkedin": "linkedin.com/in/aprab"
  },
  "mcp_endpoint": "https://prabigya.com.np/mcp",
  "research_threads": [
    {
      "id": "thread-1",
      "name": "TODO(prabigya): research theme",
      "blurb": "TODO(prabigya): 1-2 sentences in your voice"
    }
  ]
};

export const publications: Publication[] = [
  {
    "id": "piimasking-preprint-2024",
    "title": "A Comparative Study of Light-weight Language Models for PII Masking and their Deployment for Real Conversational Texts",
    "authors": [
      "Prabigya Acharya",
      "Liza Shrestha"
    ],
    "venue": "arXiv preprint",
    "year": 2024,
    "thread": "thread-1",
    "summary": "We present a comparative study of light-weight language models for Personally Identifiable Information (PII) masking in real conversational texts. Our research evaluates the performance of various models in accurately identifying and masking PII, ensuring data privacy while maintaining the integrity of the original text. We also discuss the deployment challenges and solutions for integrating these models into real-world applications.",
    "abstract": "Automated masking of Personally Identifiable Information (PII) is critical for privacy-preserving conversational systems. While current frontier large language models demonstrate strong PII masking capabilities, concerns about data handling and computational costs motivate exploration of whether lightweight models can achieve comparable performance. We compare encoder-decoder and decoder-only architectures by fine-tuning T5-small and Mistral-Instruct-v0.3 on English datasets constructed from the AI4Privacy benchmark. We create different dataset variants to study label standardization and PII representation, covering 24 standardized PII categories and higher-granularity settings. Evaluation using entity-level and character-level metrics, type accuracy, and exact match shows that both lightweight models achieve performance comparable to frontier LLMs for PII masking tasks. Label normalization consistently improves performance across architectures. Mistral achieves higher F1 and recall with greater robustness across PII types but incurs significantly higher generation latency. T5, while less robust in conversational text, offers more controllable structured outputs and lower inference cost, motivating its use in a real-time Discord bot for real-world PII redaction. Evaluation on live messages reveals performance degradation under informal inputs. These results clarify trade-offs between accuracy, robustness, and computational efficiency, demonstrating that lightweight models can provide effective PII masking while addressing data handling concerns associated with frontier LLMs.\n",
    "links": {},
    "bibtex": "@misc{acharya2025comparativestudylightweightlanguage,\n  title={A Comparative Study of Light-weight Language Models for PII Masking and their Deployment for Real Conversational Texts}, \n  author={Prabigya Acharya and Liza Shrestha},\n  year={2025},\n  eprint={2512.18608},\n  archivePrefix={arXiv},\n  primaryClass={cs.CL},\n  url={https://arxiv.org/abs/2512.18608}, \n}\n",
    "selected": true
  }
];

export const now: NowData = {
  "updated": "2026-06-10",
  "working_on": [
    "TODO(prabigya): current project or paper"
  ],
  "reading": [
    "TODO(prabigya): book or paper"
  ],
  "open_to": [
    "TODO(prabigya): collaborations, roles, etc."
  ]
};

export const cv: CvData = {
  "education": [
    {
      "org": "Pulchowk Campus, Tribhuvan University",
      "role": "Bachelor of Computer Engineering",
      "start": "2019",
      "end": "2024",
      "details": [
        "TODO(prabigya): thesis or focus area"
      ]
    }
  ],
  "positions": [
    {
      "org": "Growthzilla",
      "role": "Software Engineer",
      "start": "April 2024",
      "end": "November 2024",
      "details": [
        "TODO(prabigya): what you did"
      ]
    },
    {
      "org": "NAAMII",
      "role": "Research Intern",
      "start": "November 2024",
      "end": "June 2025",
      "details": [
        "TODO(prabigya): what you did"
      ]
    },
    {
      "org": "NAAMII",
      "role": "Research Assisstant",
      "start": "June 2025",
      "end": "April 2026",
      "details": [
        "TODO(prabigya): what you did"
      ]
    },
    {
      "org": "Sunway College Kathmandu",
      "role": "Undergraduate Research Coordinator",
      "start": "May 2025",
      "end": "Current",
      "details": [
        "TODO(prabigya): what you did"
      ]
    }
  ],
  "skills": [
    "TODO(prabigya): skill area"
  ],
  "service": [
    "TODO(prabigya): reviewing, organizing, etc."
  ],
  "awards": [
    "TODO(prabigya): award name, year"
  ]
};

export const evalQuestions: EvalQuestion[] = [
  {
    "id": "q01",
    "question": "TODO(prabigya): a hard question from your research domain",
    "type": "exact"
  },
  {
    "id": "q02",
    "question": "TODO(prabigya): another question",
    "type": "judged"
  }
];

export const notebookPosts: NotebookPost[] = [
  {
    "slug": "avritti-genetic-music",
    "title": "Avritti: Generating Music with Genetic Algorithms",
    "date": "2026-04-28",
    "updated": null,
    "tags": [
      "genetic-algorithms",
      "music-generation",
      "python"
    ],
    "summary": "Exploring algorithmic music generation through evolutionary systems — using selection, crossover, and mutation to evolve melodies from scratch.",
    "draft": false,
    "math": false,
    "content": "Most people associate music with emotion, creativity, and human expression. Algorithms, on the other hand, are usually linked with logic, rules, and computation.\n\nBut what happens when both worlds meet?\n\nThat question led us to build **Avritti**, a project focused on generating music using genetic algorithms. Instead of relying on modern deep learning models or pre-trained datasets, this project explored a different direction — using evolutionary principles to create melodies from scratch.\n\nAvritti was created as a capstone project for the Artificial Intelligence subject in our seventh semester. It is currently hosted at [music.prabigya.com.np](https://music.prabigya.com.np).\n\n## The Idea Behind Avritti\n\nGenetic algorithms are optimization techniques inspired by natural selection.\n\nThe process is simple in theory:\n\n- Create a population of random candidates\n- Evaluate how good each candidate is\n- Keep the better ones\n- Combine them\n- Introduce small mutations\n- Repeat over multiple generations\n\nOver time, stronger solutions begin to emerge. In our case, those \"solutions\" were musical sequences.\n\n## Why Use Genetic Algorithms for Music?\n\nMusic generation is an interesting problem because there is no single correct answer. A melody can be technically valid but still sound unpleasant. Another may be simple but memorable.\n\nThat makes music a strong use case for evolutionary systems. Rather than explicitly programming every possible musical rule, we allow patterns to evolve gradually based on scoring criteria. This gives the system room to discover combinations that may not be obvious from fixed rules alone.\n\n## How It Works\n\nEach melody is represented as a sequence containing notes, timing, and structure. The system begins by generating multiple random melodies, then evaluates them using fitness criteria such as:\n\n- Note transitions\n- Rhythm consistency\n- Repetition balance\n- Variation\n- Overall harmony\n\nThe higher-scoring melodies are selected for the next generation.\n\n### Crossover\n\nParts of two melodies are combined to form a new one:\n\n```\nParent A: C D E G\nParent B: A G E D\nChild:    C D E D\n```\n\n### Mutation\n\nSmall random changes are introduced to keep diversity in the population:\n\n- Changing a note\n- Shifting pitch\n- Adjusting duration\n- Replacing segments\n\nWithout mutation, the system converges and becomes repetitive too quickly.\n\n## Project Structure\n\nThe project is built in Python with a modular layout:\n\n- `main.py` — backend application\n- `genetic_backbone.py` — evolutionary logic\n- `melody.py` — melody representation and handling\n- `frontend/` — browser interface\n\nThis structure made it easier to test scoring systems, generation rules, and playback features independently.\n\n## What We Learned\n\nOne of the most interesting parts was watching unexpected musical patterns emerge. Some generated outputs contained repeated hooks, balanced phrasing, structured rhythm, and pleasant transitions.\n\nAt the same time, not every generation sounded good. Some melodies felt random. Others became too repetitive.\n\nThat highlighted an important challenge in algorithmic creativity: **designing the fitness function matters just as much as the algorithm itself.** If the scoring system rewards the wrong things, the output quickly reflects it.\n\n## Why This Was Worth Exploring\n\nMost current discussions around AI-generated music focus entirely on neural networks and massive datasets. Avritti explored another side of computational creativity — that generation does not always require training large models. Useful and interesting outputs can come from smaller systems built around search, selection, and iteration.\n\nThat makes genetic algorithms valuable not just for optimization, but for experimentation.\n\n## Links\n\n- Live: [music.prabigya.com.np](https://music.prabigya.com.np)\n- Source: [github.com/PrabigyaAcharya/Avritti](https://github.com/PrabigyaAcharya/Avritti)"
  },
  {
    "slug": "dataset-3d-understanding",
    "title": "Dataset for Next-Generation 3D Understanding",
    "date": "2026-04-23",
    "updated": null,
    "tags": [
      "3d-gaussian-splatting",
      "computer-vision",
      "datasets",
      "benchmarks"
    ],
    "summary": "A hierarchical dataset built on Gaussian Splat scenes for evaluating AI spatial reasoning — from individual objects up through rooms and full scenes.",
    "draft": false,
    "math": false,
    "content": "Imagine standing in a kitchen, looking at the cooking utensils, the ingredients in the fridge and pantry, the tools on the counter. When we move through a room, we view objects, read labels, check dates, see if the fruit is rotten — taking in all the visual cues that help us make sense of the spatial and functional arrangement of the space. If you asked a human to make tea, they can search for the kettle where the utensils are kept, find tea and sugar in the pantry, and prepare it. Now imagine asking the best commercial AI today to do the same in that 3D space. There would be a lot of problems to tackle before we get there.\n\n## The Gap in 3D Understanding\n\nAI systems that combine vision and language have gotten remarkably good at understanding photographs. Show one a picture of a dog and it will tell you the breed. Show it a cluttered desk and it can describe what's on it. But 3D environments are a different story.\n\nWhen an AI needs to reason over a real room with depth, scale, and relationships between objects, things fall apart. The same reference can apply to similar objects nearby. The context of reasoning can be too long and cause hallucination. And the quality of the representation itself can be a problem — textures that are not describable, text that is not readable.\n\n## Two Blind Spots in Existing Benchmarks\n\nMost existing 3D understanding tests used **point clouds**. You get the rough shape of furniture but lose all texture, color, and material detail. You can have accurate spatial information of the scene, but you lose the fine-grained details that matter enormously. If you cannot read a label on an ingredient in a kitchen scene, how do you guide a system to prepare something?\n\nThe second problem: these tests treated every object as a separate entity. A chair is just a chair. But in a real room, that chair sits at a dining table, which is in a dining area, which is part of a larger apartment. A human understands easily if someone says \"rearrange the chairs in the dining area to fit more people.\" For AI, this kind of reasoning is hard because it lacks any description of a dining area when multiple arrangements of tables and chairs are present. Context and hierarchy matter enormously for how we understand space — and no existing benchmark captured that.\n\n## What We Built\n\nWe designed a benchmark that addresses both problems.\n\n**Representation:** The scenes are represented using Gaussian Splats, which reconstruct a space so realistically that you can view it from any angle with all textures and lighting intact. Instead of a dot skeleton, you get something that looks like actually being inside the room.\n\n**Hierarchy:** We built a hierarchical map of meaning into every scene. Each scene is annotated not just at the object level, but all the way up through object groups, functional areas, rooms, and the full scene. It works like a family tree of meaning — from the big picture down to the individual peach sitting in a fruit bowl.\n\nWe did this across 969 scenes — a mix of real-world apartments and high-quality synthetic interiors — producing over 183,000 annotated elements with text descriptions and precise 3D bounding boxes.\n\n## The Benchmark Tasks\n\nWe designed three categories of tasks:\n\n- **Existence questions** — does an object with a certain color or material appear in the scene?\n- **Spatial questions** — how many chairs are there? Which object is closer to the window?\n- **Multi-step reasoning** — what does the design of a space tell you about the person who lives there?\n\nWe tested a range of leading AI systems across all three. On basic existence questions, the best models reached around 85% accuracy. On spatial tasks like counting or judging distances, accuracy dropped to around 60% or below. The multi-step reasoning tasks exposed even deeper gaps — especially anything involving missing objects or understanding how furniture physically constrains other furniture.\n\n## What It Tells Us\n\nAI can name the objects in a room. But truly understanding the space the way a person does when they walk in and immediately get a sense of how someone lives — that is still an open challenge.\n\nThis dataset is a first step toward addressing it."
  },
  {
    "slug": "embedding-language-gaussian-splat",
    "title": "Embedding Language in Gaussian Splat",
    "date": "2026-01-20",
    "updated": null,
    "tags": [
      "3d-gaussian-splatting",
      "computer-vision",
      "clip",
      "machine-learning"
    ],
    "summary": "Embedding CLIP language features into 3D Gaussian Splatting scenes to make Gaussians semantically aware of what they represent.",
    "draft": false,
    "math": true,
    "content": "I had been messing around with 3D Gaussian Splatting for a while and one thing that always bugged me was that the Gaussians are semantically blind. They know where things are and what color they are, but they have no idea *what* they are looking at. So I wanted to see if I could get them to understand language.\n\n## A Quick Background on 3D Gaussian Splatting\n\n3D Gaussian Splatting represents a scene as a collection of 3D Gaussians. Each Gaussian has a position (mean) in 3D space, a covariance (defined by scale and rotation), an opacity, and a color encoded via spherical harmonics. The `rasterization()` function in gsplat takes all of these and alpha-composites them onto a 2D image plane by sorting Gaussians by depth and blending them front to back.\n\nThe key formula for blending is:\n\n$$\nC_{\\text{pixel}} = \\sum_{i} T_i \\cdot \\alpha_i \\cdot c_i, \\quad T_i = \\prod_{j < i}(1 - \\alpha_j)\n$$\n\nwhere $T_i$ is the accumulated transmittance, $\\alpha_i$ is the opacity of the $i$-th Gaussian, and $c_i$ is its color. The `colors` argument in the rasterization call is not restricted to RGB — it can be any $N$-dimensional feature vector. This is the hook I used.\n\n## CLIP and What it Does\n\nCLIP (Contrastive Language-Image Pretraining) is a model from OpenAI trained on a massive dataset of image-text pairs. It learns a joint embedding space where images and text that describe each other end up close together. The result is that if you encode an image patch and a piece of text using CLIP, you can measure their similarity via cosine distance.\n\nSo a CLIP embedding of an image patch of a Pikachu plushie and the text \"Pikachu\" will have a high cosine similarity, while \"game controller\" would be lower. This is the property I wanted to bake into the 3D scene.\n\n## Where the CLIP Embeddings Came From: LangSplat\n\nLangSplat is a paper that first did this idea for 3DGS properly. Their pipeline is:\n\n1. Take all training images of the scene\n2. Run SAM (Segment Anything Model) on each image at three granularity scales: fine, segment, and whole\n3. For each segmented region, get a CLIP embedding (512-dimensional vector) from the CLIP image encoder\n4. Store these per-pixel CLIP embeddings aligned to each training image\n\nThey also train a small per-scene autoencoder to compress the 512-dim embeddings down to 3 dimensions, because rendering 512 channels per Gaussian per pixel would be far too expensive.\n\nI used the preprocessed dataset that LangSplat provides, which already has the per-pixel compressed CLIP embeddings stored as `.npy` files. This saved me a lot of the SAM + CLIP preprocessing work.\n\n## The Modification to `rasterization()`\n\nThe actual code change was less scary than it sounds. The `rasterization()` function in gsplat already supports arbitrary feature rendering. I added a CLIP feature attribute to each Gaussian — a 3-dimensional vector after compression — and passed it as the `colors` argument in an additional rasterization call.\n\nDuring training, alongside the standard RGB photometric loss, I added a feature reconstruction loss:\n\n$$\n\\mathcal{L}_{\\text{clip}} = \\| \\hat{F} - F_{\\text{gt}} \\|^2\n$$\n\nwhere $\\hat{F}$ is the rendered feature map from the Gaussians and $F_{\\text{gt}}$ is the ground truth per-pixel CLIP feature map from the LangSplat dataset. Since the rasterizer is differentiable, gradients flow back through the blending operation and update each Gaussian's CLIP feature attribute directly.\n\nTraining is two-staged: first the geometry and RGB are trained normally, then the CLIP feature attributes are initialized and optimized with the feature loss.\n\n## Querying the Scene\n\nAt inference time, the pipeline is:\n\n1. Encode a text query using CLIP's text encoder to get a 512-dim text embedding, then compress it with the same autoencoder down to 3 dimensions\n2. Render the CLIP feature field from any camera viewpoint using the same `rasterization()` call\n3. Compute cosine similarity between every pixel in the rendered feature map and the text embedding\n4. This gives a relevancy heatmap over the scene\n\n## Results\n\nI only tested on one scene. It contained a Pikachu plushie, an Xbox controller, a Joy-Con, UNO cards, and a Gundam figure on a couch corner.\n\nThe CLIP feature field when visualised:\n\n<!-- TODO: download to content/notebook/embedding-language-gaussian-splat/clip_render.png -->\n![Rendered CLIP feature field](https://prabigya.com.np/blogs/images/clip_gsplat/cliip_render.png \"fig. 1 — rendered CLIP feature field\")\n\nThe original scene for reference:\n\n<!-- TODO: download to content/notebook/embedding-language-gaussian-splat/original_scene.png -->\n![Original scene](https://prabigya.com.np/blogs/images/clip_gsplat/original_scene.png \"fig. 2 — original scene\")\n\nThe output was not great. The rendered feature field is blurry and noisy, mostly showing up as a washed-out red haze. However, if you look carefully, you can make out the rough outline of the Pikachu plushie — so something is being learned, just not cleanly.\n\nA few speculations on why:\n\n- The 3-dimensional compression from the autoencoder may be losing too much information. Going from 512 to 3 dimensions is aggressive, and the autoencoder is a small MLP.\n- Gaussian density in this scene may be insufficient to represent fine-grained semantic boundaries. Where geometry is thin or flat, Gaussians spread out and blur the feature field.\n- The blending formula for features is the same as for color, which means Gaussians behind other Gaussians contribute very little to the final feature. If front Gaussians carry incorrect features, the true signal from behind is suppressed.\n- The training may need more iterations or a different loss weighting between the RGB and feature losses. These two can conflict, and the feature signal might be getting drowned out.\n- Per-pixel CLIP features from SAM segmentation can be noisy at object boundaries, and this noise in the ground truth may confuse the optimization.\n\nThese are all guesses — I have not dug into which one is actually the culprit.\n\n## What This Could Be Used For\n\nIf it worked cleanly, you could use this for open-vocabulary object localization in 3D, semantic scene editing (selecting all Gaussians belonging to a queried object and manipulating them), or building 3D scene understanding systems that go beyond RGB appearance.\n\n## References\n\n- [LangSplat: 3D Language Gaussian Splatting](https://langsplat.github.io/)\n- [gsplat: An Open-Source Library for Gaussian Splatting Training and Rendering](https://github.com/nerfstudio-project/gsplat)\n- [CLIP: Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)\n- [Segment Anything](https://segment-anything.com/)"
  },
  {
    "slug": "tiny-image-generator",
    "title": "Tiny Image Generator",
    "date": "2025-12-10",
    "updated": null,
    "tags": [
      "machine-learning",
      "generative-models",
      "python"
    ],
    "summary": "Building a KDE-based handwritten letter generator using PCA for dimensionality reduction — no GPU required.",
    "draft": false,
    "math": true,
    "content": "I came across this YouTube video [\"I Built a Mini 'GPT DALL-E' in One Day On a Laptop without GPU\"](https://www.youtube.com/watch?v=2oh7Yp04cM8) from the channel CompuFlair. In it, it presented a task of creating a handwritten digit generator under resource constraints. I found the video very interesting and wanted to implement the ideas discussed in it to create my own letter generator.\n\n## KDE and PCA\n\nKDE stands for [Kernel Density Estimator](https://en.wikipedia.org/wiki/Kernel_density_estimation). Kernel Density Estimation is a method for approximating a random variable's probability density function (PDF) using a finite sample.\n\nUsing kernels, we can estimate the p.d.f of a random variable. Mathematically, given that $x = (x_1, x_2, \\ldots, x_n)$ is an i.i.d sample from some univariate distribution of unknown density function, its Kernel Density Estimator is:\n\n$$\n\\hat{f}_h(x) = \\frac{1}{n}\\sum_{i=1}^{n}K_h(x - x_i)\n$$\n\nWhere $K_h$ is the scaled kernel and $h$ is the bandwidth of the kernel.\n\nIntuitively, given $n$ observations, we want to estimate the overall distribution from which they were drawn. Consider some points sampled from an unknown distribution:\n\n<!-- TODO: download to content/notebook/tiny-image-generator/image.png -->\n![Sample points from an unknown distribution](https://prabigya.com.np/blogs/images/tig/image.png \"fig. 1 — sample points from an unknown distribution\")\n\nAs we take more samples, through KDE we can estimate the underlying distribution:\n\n<!-- TODO: download to content/notebook/tiny-image-generator/image-1.png -->\n![KDE estimate overlaid on sample points](https://prabigya.com.np/blogs/images/tig/image-1.png \"fig. 2 — KDE estimate\")\n\nThe above can be written as:\n\n$$\n\\hat{f}_h(x) = \\frac{1}{nh}\\sum_{i=1}^{n}K\\!\\left(\\frac{x - x_i}{h}\\right)\n$$\n\nThe KDE weights distances of all observed data points — more nearby points means a higher estimate and a higher probability at that location.\n\nBandwidth selection matters. A lower bandwidth considers only close neighbors; a higher bandwidth widens the neighborhood. Too narrow a bandwidth gives an estimate that looks like this:\n\n<!-- TODO: download to content/notebook/tiny-image-generator/image-2.png -->\n![Overfitted narrow-bandwidth KDE](https://prabigya.com.np/blogs/images/tig/image-2.png \"fig. 3 — overfitted narrow bandwidth\")\n\n**Principal Component Analysis (PCA)** is a linear dimensionality reduction technique. The data are transformed onto a new coordinate system such that the directions of largest variance (the principal components) can be easily identified. Scikit-learn provides implementations of both KDE and PCA.\n\n## Implementation\n\nDiffusion models synthesize images that are highly likely under the learned probability distribution. Knowing $P$, we can generate new images from it.\n\nSince images are vectors (pixels as components), the distribution of an image can be estimated as:\n\n$$\nP(\\vec{x}) = \\frac{1}{nh}\\sum_{i=1}^{n}K\\!\\left(\\frac{x - x_i}{h}\\right)\n$$\n\nHowever, since image vectors are very high-dimensional (28×28 = 784 in our case), KDE degrades in this space. We reduce dimensionality with PCA first.\n\n### Imports\n\n```python\nimport numpy as np\nfrom torchvision.datasets import EMNIST\nfrom torchvision import transforms\n\nfrom sklearn.decomposition import PCA\nfrom sklearn.neighbors import KernelDensity\nfrom PIL import Image\n```\n\n### Dataloader\n\n```python\ndef get_emnist_data(split: str = \"train\", emnist_split: str = \"letters\"):\n    \"\"\"Returns EMNIST data as float32 array of shape (N, 784) normalized to [0, 1].\"\"\"\n    transform = transforms.Compose([\n        transforms.ToTensor(),\n        transforms.Lambda(lambda x: x.transpose(1, 2))  # fix rotation\n    ])\n\n    dataset = EMNIST(\n        root=\"./data\",\n        split=emnist_split,\n        train=(split == \"train\"),\n        download=True,\n        transform=transform\n    )\n\n    X, y = [], []\n    for img, label in dataset:\n        X.append(img.reshape(-1).numpy().astype(np.float32))\n        y.append(int(label))\n\n    return np.stack(X), np.array(y, dtype=int)\n\ntrain_data = get_emnist_data()\n```\n\n### Visualise the data\n\n```python\ndef show_examples(X, y, num=10):\n    plt.figure(figsize=(12, 2))\n    for i in range(num):\n        plt.subplot(1, num, i + 1)\n        plt.imshow(X[i].reshape(28, 28), cmap=\"gray\")\n        plt.title(str(y[i]))\n        plt.axis(\"off\")\n    plt.tight_layout()\n    plt.show()\n\nshow_examples(train_data[0], train_data[1])\n```\n\n<!-- TODO: download to content/notebook/tiny-image-generator/ig_ex.png -->\n![Sample EMNIST letter examples](https://prabigya.com.np/blogs/images/tig/ig_ex.png \"fig. 4 — sample EMNIST letters\")\n\n### PCA + KDE fitting\n\n```python\ndef fit_pca_kde(X: np.ndarray, n_components: int, bandwidth: float, kernel: str = \"gaussian\"):\n    pca = PCA(n_components=n_components, random_state=42)\n    Z = pca.fit_transform(X)\n    Z = np.nan_to_num(Z, nan=0.0, posinf=0.0, neginf=0.0).astype(np.float64)\n\n    kde = KernelDensity(kernel=kernel, bandwidth=bandwidth)\n    kde.fit(Z)\n    return pca, kde\n\n\ndef sample_images_improved(pca, kde, Z_train, n_samples):\n    rng = np.random.default_rng()\n    bandwidth_scale = 0.5\n    samples_Z = []\n\n    for _ in range(n_samples):\n        idx = rng.integers(0, len(Z_train))\n        noise = rng.normal(0, bandwidth_scale, size=Z_train[idx].shape)\n        samples_Z.append(Z_train[idx] + noise)\n\n    X_gen = pca.inverse_transform(np.array(samples_Z))\n    return np.clip(X_gen, 0.0, 1.0)\n\n\ndef save_images(X, out_dir, prefix=\"sample\", out_size=None):\n    out_dir.mkdir(parents=True, exist_ok=True)\n    for i, x in enumerate(X):\n        img_arr = (x.reshape(28, 28) * 255.0).astype(np.uint8)\n        img = Image.fromarray(img_arr, mode=\"L\")\n        if out_size and out_size > 28:\n            img = img.resize((out_size, out_size), resample=Image.LANCZOS)\n        img.save(out_dir / f\"{prefix}_{i:04d}.png\")\n\n\ndef fit_pca_kde_per_letter(X, y, n_components=50, bandwidth=1.0, kernel=\"gaussian\"):\n    \"\"\"Fit separate PCA+KDE models per letter class.\"\"\"\n    models = {}\n    for letter in np.unique(y):\n        X_letter = X[y == letter]\n        if len(X_letter) < n_components:\n            print(f\"Warning: letter {letter} has only {len(X_letter)} samples, skipping\")\n            continue\n        pca = PCA(n_components=n_components, whiten=True, random_state=42)\n        Z = pca.fit_transform(X_letter)\n        kde = KernelDensity(kernel=kernel, bandwidth=bandwidth)\n        kde.fit(Z)\n        models[letter] = (pca, kde, Z)\n    return models\n\n\ndef sample_letter(models, letter_label, n_samples):\n    if letter_label not in models:\n        raise ValueError(f\"Letter {letter_label} not found in models\")\n    pca, kde, Z_train = models[letter_label]\n    return sample_images_improved(pca, kde, Z_train, n_samples)\n```\n\n### Running everything\n\n```python\nX, y = train_data\nX = np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0).astype(np.float32)\n\nn_components = 50\nbandwidth = 0.5\nn_samples_per_letter = 5\nout_size = 112\n\nprint(\"Training PCA+KDE models per letter...\")\nmodels = fit_pca_kde_per_letter(X, y, n_components, bandwidth)\n\nall_samples = []\nfor letter_label in sorted(np.unique(y)):\n    print(f\"  Sampling letter {letter_label}...\")\n    all_samples.append(sample_letter(models, letter_label, n_samples_per_letter))\n\nX_gen = np.vstack(all_samples)\nout_dir = Path(\".\") / \"samples_letters\"\nsave_images(X_gen, out_dir, out_size=out_size)\nprint(f\"Saved {len(X_gen)} images to {out_dir}\")\n```\n\n## Results\n\n<!-- TODO: download to content/notebook/tiny-image-generator/a.png and f.png -->\n![Generated letter a](https://prabigya.com.np/blogs/images/tig/a.png \"fig. 5 — generated letter a\")\n![Generated letter f](https://prabigya.com.np/blogs/images/tig/f.png \"fig. 6 — generated letter f\")\n\n## References\n\n- [Kernel Density Estimation — Wikipedia](https://en.wikipedia.org/wiki/Kernel_density_estimation)\n- [KDE Visualizer](https://mathisonian.github.io/kde/)\n- [CompuFlair: I Built a Mini \"GPT DALL-E\" in One Day](https://www.youtube.com/watch?v=2oh7Yp04cM8)"
  }
];
