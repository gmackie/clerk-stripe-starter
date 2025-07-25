#!/bin/bash
# Watch deployment progress

echo "👀 Watching Clerk-Stripe Starter Deployment"
echo "=========================================="
echo ""
echo "🔗 CI/CD Pipeline: https://ci.gmac.io/mackieg/clerk-stripe-starter/actions"
echo ""

# Setup kubeconfig
KUBECONFIG_FILE="/Volumes/dev/gmac-io-ci/k3s-kubeconfig.yaml"
export KUBECONFIG="$KUBECONFIG_FILE"

echo "Press Ctrl+C to stop watching..."
echo ""

# Function to check deployment
check_deployment() {
    echo -e "\n📊 Current Status ($(date '+%H:%M:%S')):"
    echo "-----------------------------------"
    
    # Check if deployment exists
    if kubectl get deployment clerk-stripe-starter -n production &>/dev/null; then
        echo "✅ Deployment exists"
        
        # Get deployment status
        kubectl get deployment clerk-stripe-starter -n production
        
        echo -e "\n🔄 Pods:"
        kubectl get pods -n production -l app=clerk-stripe-starter
        
        # Check latest events
        echo -e "\n📋 Recent events:"
        kubectl get events -n production --field-selector involvedObject.name=clerk-stripe-starter --sort-by='.lastTimestamp' | tail -5
        
        # Check if any pods are running
        RUNNING_PODS=$(kubectl get pods -n production -l app=clerk-stripe-starter -o jsonpath='{.items[*].status.phase}' | grep -c "Running" || echo "0")
        if [ "$RUNNING_PODS" -gt 0 ]; then
            echo -e "\n✅ $RUNNING_PODS pod(s) running!"
            echo -e "\n🌐 Site should be available at: https://starter.gmac.io"
            return 0
        fi
    else
        echo "⏳ Deployment not yet created..."
        echo "   (CI/CD pipeline may still be building the Docker image)"
    fi
    
    return 1
}

# Watch loop
while true; do
    check_deployment
    if [ $? -eq 0 ]; then
        echo -e "\n🎉 Deployment successful! Your app is running."
        echo "🔗 Visit: https://starter.gmac.io"
        break
    fi
    sleep 10
done