# Kubernetes deployment for FitCoach

Build Docker images (example tags):

```pwsh
cd fitcoach
docker build -f src/FitCoach.Workout.Api/Dockerfile -t fitcoach/workout:latest .
docker build -f src/FitCoach.UserManagement.Api/Dockerfile -t fitcoach/user:latest .
docker build -f src/FitCoach.Progress.Api/Dockerfile -t fitcoach/progress:latest .
docker build -f frontend/Dockerfile -t fitcoach/frontend:latest frontend
```

Push to your registry and replace image names accordingly in `k8s/services-and-deployments.yaml`.

Deploy to Kubernetes:

```pwsh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config-and-secrets.yaml
kubectl apply -f k8s/services-and-deployments.yaml
```

Notes:
- Postgres here uses an ephemeral `emptyDir` volume — for production, use a `PersistentVolumeClaim`.
- Secrets are placeholders; rotate and store securely (e.g., Azure KeyVault, SealedSecrets, etc.).
- For local testing use `kind` or `minikube` and adjust LoadBalancer type to NodePort if needed.

Kafka / Confluent notes:
- This repo includes `k8s/confluent/kafka-single-node.yaml` which is a Strimzi Kafka single-node cluster manifest.
- Install the Strimzi operator first, then apply that manifest in the `fitcoach` namespace. The bootstrap server will be available within the cluster at `my-cluster-kafka-bootstrap:9092`.

