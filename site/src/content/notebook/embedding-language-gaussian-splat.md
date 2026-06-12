---
title: "Embedding Language in Gaussian Splat"
date: 2026-01-20
tags: [3d-gaussian-splatting, computer-vision, clip, machine-learning]
summary: "Embedding CLIP language features into 3D Gaussian Splatting scenes to make Gaussians semantically aware of what they represent."
draft: false
math: true
---

I had been messing around with 3D Gaussian Splatting for a while and one thing that always bugged me was that the Gaussians are semantically blind. They know where things are and what color they are, but they have no idea *what* they are looking at. So I wanted to see if I could get them to understand language.

## A Quick Background on 3D Gaussian Splatting

3D Gaussian Splatting represents a scene as a collection of 3D Gaussians. Each Gaussian has a position (mean) in 3D space, a covariance (defined by scale and rotation), an opacity, and a color encoded via spherical harmonics. The `rasterization()` function in gsplat takes all of these and alpha-composites them onto a 2D image plane by sorting Gaussians by depth and blending them front to back.

The key formula for blending is:

$$
C_{\text{pixel}} = \sum_{i} T_i \cdot \alpha_i \cdot c_i, \quad T_i = \prod_{j < i}(1 - \alpha_j)
$$

where $T_i$ is the accumulated transmittance, $\alpha_i$ is the opacity of the $i$-th Gaussian, and $c_i$ is its color. The `colors` argument in the rasterization call is not restricted to RGB — it can be any $N$-dimensional feature vector. This is the hook I used.

## CLIP and What it Does

CLIP (Contrastive Language-Image Pretraining) is a model from OpenAI trained on a massive dataset of image-text pairs. It learns a joint embedding space where images and text that describe each other end up close together. The result is that if you encode an image patch and a piece of text using CLIP, you can measure their similarity via cosine distance.

So a CLIP embedding of an image patch of a Pikachu plushie and the text "Pikachu" will have a high cosine similarity, while "game controller" would be lower. This is the property I wanted to bake into the 3D scene.

## Where the CLIP Embeddings Came From: LangSplat

LangSplat is a paper that first did this idea for 3DGS properly. Their pipeline is:

1. Take all training images of the scene
2. Run SAM (Segment Anything Model) on each image at three granularity scales: fine, segment, and whole
3. For each segmented region, get a CLIP embedding (512-dimensional vector) from the CLIP image encoder
4. Store these per-pixel CLIP embeddings aligned to each training image

They also train a small per-scene autoencoder to compress the 512-dim embeddings down to 3 dimensions, because rendering 512 channels per Gaussian per pixel would be far too expensive.

I used the preprocessed dataset that LangSplat provides, which already has the per-pixel compressed CLIP embeddings stored as `.npy` files. This saved me a lot of the SAM + CLIP preprocessing work.

## The Modification to `rasterization()`

The actual code change was less scary than it sounds. The `rasterization()` function in gsplat already supports arbitrary feature rendering. I added a CLIP feature attribute to each Gaussian — a 3-dimensional vector after compression — and passed it as the `colors` argument in an additional rasterization call.

During training, alongside the standard RGB photometric loss, I added a feature reconstruction loss:

$$
\mathcal{L}_{\text{clip}} = \| \hat{F} - F_{\text{gt}} \|^2
$$

where $\hat{F}$ is the rendered feature map from the Gaussians and $F_{\text{gt}}$ is the ground truth per-pixel CLIP feature map from the LangSplat dataset. Since the rasterizer is differentiable, gradients flow back through the blending operation and update each Gaussian's CLIP feature attribute directly.

Training is two-staged: first the geometry and RGB are trained normally, then the CLIP feature attributes are initialized and optimized with the feature loss.

## Querying the Scene

At inference time, the pipeline is:

1. Encode a text query using CLIP's text encoder to get a 512-dim text embedding, then compress it with the same autoencoder down to 3 dimensions
2. Render the CLIP feature field from any camera viewpoint using the same `rasterization()` call
3. Compute cosine similarity between every pixel in the rendered feature map and the text embedding
4. This gives a relevancy heatmap over the scene

## Results

I only tested on one scene. It contained a Pikachu plushie, an Xbox controller, a Joy-Con, UNO cards, and a Gundam figure on a couch corner.

The CLIP feature field when visualised:

<!-- TODO: download to content/notebook/embedding-language-gaussian-splat/clip_render.png -->
![Rendered CLIP feature field](https://prabigya.com.np/blogs/images/clip_gsplat/cliip_render.png "fig. 1 — rendered CLIP feature field")

The original scene for reference:

<!-- TODO: download to content/notebook/embedding-language-gaussian-splat/original_scene.png -->
![Original scene](https://prabigya.com.np/blogs/images/clip_gsplat/original_scene.png "fig. 2 — original scene")

The output was not great. The rendered feature field is blurry and noisy, mostly showing up as a washed-out red haze. However, if you look carefully, you can make out the rough outline of the Pikachu plushie — so something is being learned, just not cleanly.

A few speculations on why:

- The 3-dimensional compression from the autoencoder may be losing too much information. Going from 512 to 3 dimensions is aggressive, and the autoencoder is a small MLP.
- Gaussian density in this scene may be insufficient to represent fine-grained semantic boundaries. Where geometry is thin or flat, Gaussians spread out and blur the feature field.
- The blending formula for features is the same as for color, which means Gaussians behind other Gaussians contribute very little to the final feature. If front Gaussians carry incorrect features, the true signal from behind is suppressed.
- The training may need more iterations or a different loss weighting between the RGB and feature losses. These two can conflict, and the feature signal might be getting drowned out.
- Per-pixel CLIP features from SAM segmentation can be noisy at object boundaries, and this noise in the ground truth may confuse the optimization.

These are all guesses — I have not dug into which one is actually the culprit.

## What This Could Be Used For

If it worked cleanly, you could use this for open-vocabulary object localization in 3D, semantic scene editing (selecting all Gaussians belonging to a queried object and manipulating them), or building 3D scene understanding systems that go beyond RGB appearance.

## References

- [LangSplat: 3D Language Gaussian Splatting](https://langsplat.github.io/)
- [gsplat: An Open-Source Library for Gaussian Splatting Training and Rendering](https://github.com/nerfstudio-project/gsplat)
- [CLIP: Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)
- [Segment Anything](https://segment-anything.com/)
