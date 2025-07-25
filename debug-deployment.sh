#!/bin/bash
# Debug deployment issues

echo "🔍 Debugging Clerk-Stripe Starter Deployment"
echo "==========================================="
echo ""

# Check if we have kubeconfig
KUBECONFIG_FILE="/Volumes/dev/gmac-io-ci/k3s-kubeconfig.yaml"
if [ ! -f "$KUBECONFIG_FILE" ]; then
    # Try decoding the base64 version
    if [ -f "/Volumes/dev/gmac-io-ci/kubeconfig-base64.txt" ]; then
        echo "Decoding kubeconfig from base64..."
        base64 -d "/Volumes/dev/gmac-io-ci/kubeconfig-base64.txt" > /tmp/kubeconfig
        KUBECONFIG_FILE="/tmp/kubeconfig"
    else
        echo "❌ kubeconfig not found. Cannot check deployment status."
        echo "Please ensure kubeconfig exists in gmac-io-ci directory"
        exit 1
    fi
fi

export KUBECONFIG="$KUBECONFIG_FILE"

echo "📋 Checking deployment status..."
echo ""

# Check namespace
echo "1️⃣ Checking namespace:"
kubectl get namespace production 2>&1

echo ""
echo "2️⃣ Checking deployments:"
kubectl get deployments -n production 2>&1

echo ""
echo "3️⃣ Checking pods:"
kubectl get pods -n production -l app=clerk-stripe-starter 2>&1

echo ""
echo "4️⃣ Checking recent events:"
kubectl get events -n production --sort-by='.lastTimestamp' | tail -20

echo ""
echo "5️⃣ Checking secrets:"
kubectl get secrets -n production | grep -E "(clerk-stripe-starter|gitea-registry)" 2>&1

echo ""
echo "6️⃣ Checking ingress:"
kubectl get ingress -n production 2>&1

echo ""
echo "7️⃣ Pod logs (if any):"
POD=$(kubectl get pods -n production -l app=clerk-stripe-starter -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ ! -z "$POD" ]; then
    echo "Pod: $POD"
    kubectl logs -n production "$POD" --tail=50 2>&1
else
    echo "No pods found"
fi

echo ""
echo "8️⃣ Describing deployment (if exists):"
kubectl describe deployment clerk-stripe-starter -n production 2>&1 | tail -30

echo ""
echo "📝 Common issues to check:"
echo "- GITEA_TOKEN secret exists in repository"
echo "- All environment variables are set as secrets"
echo "- Docker image was built and pushed successfully"
echo "- Kubeconfig has correct permissions"
echo ""
echo "🔗 Check CI logs at: https://ci.gmac.io/mackieg/clerk-stripe-starter/actions"