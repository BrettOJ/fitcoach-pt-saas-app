# Kafka on Kubernetes (Strimzi)

This folder contains example manifests to run a single-node Kafka cluster using Strimzi operator for local testing.

Install Strimzi operator first (see https://strimzi.io/):

```pwsh
kubectl apply -f 'https://github.com/strimzi/strimzi-kafka-operator/releases/download/0.52.0/strimzi-cluster-operator-0.52.0.yaml' -n fitcoach
```

Then apply the Kafka cluster manifest:

```pwsh
kubectl apply -f kafka-single-node.yaml -n fitcoach
```
