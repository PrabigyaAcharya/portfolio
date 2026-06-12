#!/usr/bin/env python3
"""
lab-agent/report.py — Posts GPU/training telemetry to the portfolio worker.
Run via cron every 2-5 minutes: */3 * * * * /path/to/report.py
Requires: TELEMETRY_TOKEN env var, nvidia-smi on PATH (optional)

PRIVACY NOTE: run_name is displayed publicly on the site.
  Do not use confidential project names. Use generic names like "ml-experiment-1".
"""
import json, os, subprocess, urllib.request, urllib.error
from datetime import datetime, timezone

ENDPOINT = os.environ.get("TELEMETRY_ENDPOINT", "https://prabigya.com.np/ingest/lab")
TOKEN = os.environ.get("TELEMETRY_TOKEN", "")
RUN_FILE = os.path.expanduser("~/.lab-agent/current_run.json")


def get_gpu_stats() -> dict:
    """Query nvidia-smi for GPU utilization and memory."""
    try:
        out = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=utilization.gpu,memory.used,memory.total,count",
                "--format=csv,noheader,nounits",
            ],
            stderr=subprocess.DEVNULL,
            timeout=5,
        ).decode().strip()
        # nvidia-smi outputs one line per GPU; take first GPU
        line = out.split("\n")[0].split(", ")
        return {
            "gpu_util": int(line[0].strip()),
            "gpu_mem": int(line[1].strip()),
            "gpus": int(line[3].strip()),
        }
    except Exception:
        return {}


def get_run_stats() -> dict:
    """Read current training run metadata from ~/.lab-agent/current_run.json.

    Expected format:
    {
      "run_name": "my-experiment",      # PUBLIC — appears on site
      "epoch": 12,
      "total_epochs": 50,
      "loss": 0.4532,
      "started_at": "2026-06-10T10:00:00Z"
    }
    """
    try:
        with open(RUN_FILE) as f:
            data = json.load(f)
        # Only pass through allowlisted fields
        allowed = {"run_name", "epoch", "total_epochs", "loss", "started_at"}
        return {k: v for k, v in data.items() if k in allowed}
    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"[lab-agent] warning: could not read {RUN_FILE}: {e}")
        return {}


def main():
    if not TOKEN:
        print("[lab-agent] TELEMETRY_TOKEN not set. Skipping.")
        return

    payload = {**get_gpu_stats(), **get_run_stats()}

    if not payload:
        print("[lab-agent] No telemetry data to report (nvidia-smi unavailable, no run file).")
        return

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[lab-agent] reported: {resp.status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"[lab-agent] HTTP error {e.code}: {body}")
    except urllib.error.URLError as e:
        print(f"[lab-agent] failed to report: {e}")


if __name__ == "__main__":
    main()
