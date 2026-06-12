# lab-agent

Reports GPU/training telemetry from your workstation to the portfolio site.

## Setup

### 1. Set environment variable

```bash
export TELEMETRY_TOKEN="your-secret-token"
# This must match the TELEMETRY_TOKEN secret set on the worker.
```

### 2. Set up cron job

Run every 3 minutes:

```cron
*/3 * * * * TELEMETRY_TOKEN=your-secret /path/to/portfolio-kit/lab-agent/report.py >> /tmp/lab-agent.log 2>&1
```

Or via systemd timer — create `/etc/systemd/system/lab-agent.timer`:

```ini
[Unit]
Description=Portfolio lab telemetry

[Timer]
OnBootSec=60
OnUnitActiveSec=180

[Install]
WantedBy=timers.target
```

### 3. Create run file (optional)

Write `~/.lab-agent/current_run.json` from your training script:

```json
{
  "run_name": "my-experiment",
  "epoch": 12,
  "total_epochs": 50,
  "loss": 0.4532,
  "started_at": "2026-06-10T10:00:00Z"
}
```

Example — update from a Python training loop:

```python
import json, os
from pathlib import Path

def update_telemetry(epoch, total_epochs, loss, run_name):
    run_file = Path.home() / ".lab-agent" / "current_run.json"
    run_file.parent.mkdir(exist_ok=True)
    run_file.write_text(json.dumps({
        "run_name": run_name,   # PUBLIC — appears on site
        "epoch": epoch,
        "total_epochs": total_epochs,
        "loss": round(float(loss), 6),
        "started_at": run_start_iso,
    }))
```

When training ends, remove or zero out the file so the site shows "idle".

## Privacy warning

**`run_name` is displayed publicly on prabigya.com.np.** Do not use confidential project names.
Use generic names like `"ml-experiment-1"` or `"dissertation-ch3"`.

All other fields (loss, epoch, GPU stats) are also public.

## Endpoints

- **Ingest:** `POST https://prabigya.com.np/ingest/lab`
  - Auth: `Authorization: Bearer <TELEMETRY_TOKEN>`
  - Body: JSON with allowlisted fields (see below)

- **Read:** `GET https://prabigya.com.np/api/lab.json`
  - Public, no auth required
  - Returns `idle` status if no data received in last 30 minutes

## Allowed payload fields

| Field | Type | Description |
|-------|------|-------------|
| run_name | string (max 120) | Training run name (**public**) |
| epoch | integer | Current epoch |
| total_epochs | integer | Total epochs |
| loss | float | Current loss value |
| started_at | string | ISO 8601 start time |
| gpu_util | integer 0-100 | GPU utilization % |
| gpu_mem | integer | GPU memory used (MB) |
| gpus | integer 0-32 | Number of GPUs |

Extra fields are rejected by the worker (strict validation).

## Requirements

- Python 3.6+
- `nvidia-smi` on PATH (optional — skipped if not available)
- `TELEMETRY_TOKEN` environment variable
