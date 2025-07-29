import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a test error request
    const searchParams = request.nextUrl.searchParams;
    const shouldError = searchParams.get('error') === 'true';
    
    if (shouldError) {
      // Capture a test error
      const testError = new Error('Test Sentry error - this is intentional!');
      Sentry.captureException(testError, {
        tags: {
          test: true,
          endpoint: '/api/test-sentry',
        },
        extra: {
          timestamp: new Date().toISOString(),
          query: Object.fromEntries(searchParams.entries()),
        },
      });
      
      throw testError;
    }
    
    // Test various Sentry features
    
    // 1. Capture a message
    Sentry.captureMessage('Sentry test message', 'info');
    
    // 2. Add breadcrumb
    Sentry.addBreadcrumb({
      message: 'Testing Sentry integration',
      category: 'test',
      level: 'info',
      data: {
        endpoint: '/api/test-sentry',
      },
    });
    
    // 3. Set custom context
    Sentry.setContext('test_context', {
      testing: true,
      timestamp: new Date().toISOString(),
    });
    
    // 4. Track a custom transaction
    const transaction = Sentry.startTransaction({
      op: 'test',
      name: 'Test Sentry Transaction',
    });
    
    Sentry.getCurrentScope().setSpan(transaction);
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    transaction.finish();
    
    return NextResponse.json({
      success: true,
      message: 'Sentry test completed successfully',
      features: {
        message: 'Captured test message',
        breadcrumb: 'Added test breadcrumb',
        context: 'Set custom context',
        transaction: 'Tracked test transaction',
      },
      instructions: {
        testError: 'Add ?error=true to the URL to trigger a test error',
        checkDashboard: 'Check your Sentry dashboard for the captured events',
      },
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: 'Test error triggered successfully',
        message: error instanceof Error ? error.message : 'Unknown error',
        sentryReported: true,
      },
      { status: 500 }
    );
  }
}