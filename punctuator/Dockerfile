FROM python:3.10-slim

WORKDIR /app

# System dependencies (expanded for PyTorch / Transformers)
RUN apt-get update && apt-get install -y \
    git curl gcc g++ libglib2.0-0 libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install required packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask app
COPY . .

CMD ["python", "server.py"]

