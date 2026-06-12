---
title: "Tiny Image Generator"
date: 2025-12-10
tags: [machine-learning, generative-models, python]
summary: "Building a KDE-based handwritten letter generator using PCA for dimensionality reduction — no GPU required."
draft: false
math: true
---

I came across this YouTube video ["I Built a Mini 'GPT DALL-E' in One Day On a Laptop without GPU"](https://www.youtube.com/watch?v=2oh7Yp04cM8) from the channel CompuFlair. In it, it presented a task of creating a handwritten digit generator under resource constraints. I found the video very interesting and wanted to implement the ideas discussed in it to create my own letter generator.

## KDE and PCA

KDE stands for [Kernel Density Estimator](https://en.wikipedia.org/wiki/Kernel_density_estimation). Kernel Density Estimation is a method for approximating a random variable's probability density function (PDF) using a finite sample.

Using kernels, we can estimate the p.d.f of a random variable. Mathematically, given that $x = (x_1, x_2, \ldots, x_n)$ is an i.i.d sample from some univariate distribution of unknown density function, its Kernel Density Estimator is:

$$
\hat{f}_h(x) = \frac{1}{n}\sum_{i=1}^{n}K_h(x - x_i)
$$

Where $K_h$ is the scaled kernel and $h$ is the bandwidth of the kernel.

Intuitively, given $n$ observations, we want to estimate the overall distribution from which they were drawn. Consider some points sampled from an unknown distribution:

<!-- TODO: download to content/notebook/tiny-image-generator/image.png -->
![Sample points from an unknown distribution](/images/tig/image.png "fig. 1 — sample points from an unknown distribution")

As we take more samples, through KDE we can estimate the underlying distribution:

<!-- TODO: download to content/notebook/tiny-image-generator/image-1.png -->
![KDE estimate overlaid on sample points](/images/tig/image-1.png "fig. 2 — KDE estimate")

The above can be written as:

$$
\hat{f}_h(x) = \frac{1}{nh}\sum_{i=1}^{n}K\!\left(\frac{x - x_i}{h}\right)
$$

The KDE weights distances of all observed data points — more nearby points means a higher estimate and a higher probability at that location.

Bandwidth selection matters. A lower bandwidth considers only close neighbors; a higher bandwidth widens the neighborhood. Too narrow a bandwidth gives an estimate that looks like this:

<!-- TODO: download to content/notebook/tiny-image-generator/image-2.png -->
![Overfitted narrow-bandwidth KDE](/images/tig/image-2.png "fig. 3 — overfitted narrow bandwidth")

**Principal Component Analysis (PCA)** is a linear dimensionality reduction technique. The data are transformed onto a new coordinate system such that the directions of largest variance (the principal components) can be easily identified. Scikit-learn provides implementations of both KDE and PCA.

## Implementation

Diffusion models synthesize images that are highly likely under the learned probability distribution. Knowing $P$, we can generate new images from it.

Since images are vectors (pixels as components), the distribution of an image can be estimated as:

$$
P(\vec{x}) = \frac{1}{nh}\sum_{i=1}^{n}K\!\left(\frac{x - x_i}{h}\right)
$$

However, since image vectors are very high-dimensional (28×28 = 784 in our case), KDE degrades in this space. We reduce dimensionality with PCA first.

### Imports

```python
import numpy as np
from torchvision.datasets import EMNIST
from torchvision import transforms

from sklearn.decomposition import PCA
from sklearn.neighbors import KernelDensity
from PIL import Image
```

### Dataloader

```python
def get_emnist_data(split: str = "train", emnist_split: str = "letters"):
    """Returns EMNIST data as float32 array of shape (N, 784) normalized to [0, 1]."""
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Lambda(lambda x: x.transpose(1, 2))  # fix rotation
    ])

    dataset = EMNIST(
        root="./data",
        split=emnist_split,
        train=(split == "train"),
        download=True,
        transform=transform
    )

    X, y = [], []
    for img, label in dataset:
        X.append(img.reshape(-1).numpy().astype(np.float32))
        y.append(int(label))

    return np.stack(X), np.array(y, dtype=int)

train_data = get_emnist_data()
```

### Visualise the data

```python
def show_examples(X, y, num=10):
    plt.figure(figsize=(12, 2))
    for i in range(num):
        plt.subplot(1, num, i + 1)
        plt.imshow(X[i].reshape(28, 28), cmap="gray")
        plt.title(str(y[i]))
        plt.axis("off")
    plt.tight_layout()
    plt.show()

show_examples(train_data[0], train_data[1])
```

<!-- TODO: download to content/notebook/tiny-image-generator/ig_ex.png -->
![Sample EMNIST letter examples](/images/tig/ig_ex.png "fig. 4 — sample EMNIST letters")

### PCA + KDE fitting

```python
def fit_pca_kde(X: np.ndarray, n_components: int, bandwidth: float, kernel: str = "gaussian"):
    pca = PCA(n_components=n_components, random_state=42)
    Z = pca.fit_transform(X)
    Z = np.nan_to_num(Z, nan=0.0, posinf=0.0, neginf=0.0).astype(np.float64)

    kde = KernelDensity(kernel=kernel, bandwidth=bandwidth)
    kde.fit(Z)
    return pca, kde


def sample_images_improved(pca, kde, Z_train, n_samples):
    rng = np.random.default_rng()
    bandwidth_scale = 0.5
    samples_Z = []

    for _ in range(n_samples):
        idx = rng.integers(0, len(Z_train))
        noise = rng.normal(0, bandwidth_scale, size=Z_train[idx].shape)
        samples_Z.append(Z_train[idx] + noise)

    X_gen = pca.inverse_transform(np.array(samples_Z))
    return np.clip(X_gen, 0.0, 1.0)


def save_images(X, out_dir, prefix="sample", out_size=None):
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, x in enumerate(X):
        img_arr = (x.reshape(28, 28) * 255.0).astype(np.uint8)
        img = Image.fromarray(img_arr, mode="L")
        if out_size and out_size > 28:
            img = img.resize((out_size, out_size), resample=Image.LANCZOS)
        img.save(out_dir / f"{prefix}_{i:04d}.png")


def fit_pca_kde_per_letter(X, y, n_components=50, bandwidth=1.0, kernel="gaussian"):
    """Fit separate PCA+KDE models per letter class."""
    models = {}
    for letter in np.unique(y):
        X_letter = X[y == letter]
        if len(X_letter) < n_components:
            print(f"Warning: letter {letter} has only {len(X_letter)} samples, skipping")
            continue
        pca = PCA(n_components=n_components, whiten=True, random_state=42)
        Z = pca.fit_transform(X_letter)
        kde = KernelDensity(kernel=kernel, bandwidth=bandwidth)
        kde.fit(Z)
        models[letter] = (pca, kde, Z)
    return models


def sample_letter(models, letter_label, n_samples):
    if letter_label not in models:
        raise ValueError(f"Letter {letter_label} not found in models")
    pca, kde, Z_train = models[letter_label]
    return sample_images_improved(pca, kde, Z_train, n_samples)
```

### Running everything

```python
X, y = train_data
X = np.nan_to_num(X, nan=0.0, posinf=1.0, neginf=0.0).astype(np.float32)

n_components = 50
bandwidth = 0.5
n_samples_per_letter = 5
out_size = 112

print("Training PCA+KDE models per letter...")
models = fit_pca_kde_per_letter(X, y, n_components, bandwidth)

all_samples = []
for letter_label in sorted(np.unique(y)):
    print(f"  Sampling letter {letter_label}...")
    all_samples.append(sample_letter(models, letter_label, n_samples_per_letter))

X_gen = np.vstack(all_samples)
out_dir = Path(".") / "samples_letters"
save_images(X_gen, out_dir, out_size=out_size)
print(f"Saved {len(X_gen)} images to {out_dir}")
```

## Results

<!-- TODO: download to content/notebook/tiny-image-generator/a.png and f.png -->
![Generated letter a](/images/tig/a.png "fig. 5 — generated letter a")
![Generated letter f](/images/tig/f.png "fig. 6 — generated letter f")

## References

- [Kernel Density Estimation — Wikipedia](https://en.wikipedia.org/wiki/Kernel_density_estimation)
- [KDE Visualizer](https://mathisonian.github.io/kde/)
- [CompuFlair: I Built a Mini "GPT DALL-E" in One Day](https://www.youtube.com/watch?v=2oh7Yp04cM8)
