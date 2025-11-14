#!/bin/bash

echo "=============================================="
echo "🔍 TESTING THE FIX"
echo "=============================================="

echo ""
echo "📋 Summary of the issue:"
echo "   - server.js was calling fetch() without importing node-fetch"
echo "   - This caused /api/build-smart-contract to crash immediately"
echo "   - It wasn't a timeout - it was a ReferenceError!"
echo ""

echo "✅ Fix applied:"
echo "   - Added node-fetch import at top of server.js"
echo "   - Added safety checks before fetch() calls"
echo ""

echo "=============================================="
echo "🧪 Test 1: Check if backend is ready"
echo "=============================================="
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
    if [ -f "backend/compiled/metadata.json" ]; then
        echo "✅ Backend metadata exists"
        cat backend/compiled/metadata.json | head -20
    else
        echo "❌ Backend metadata missing!"
    fi
else
    echo "❌ Backend directory missing!"
fi

echo ""
echo "=============================================="
echo "🧪 Test 2: Check if frontend imports are correct"
echo "=============================================="
grep -n "node-fetch" server.js | head -5

echo ""
echo "=============================================="
echo "📝 To test the full flow:"
echo "=============================================="
echo "Terminal 1: cd backend && npm start"
echo "Terminal 2: npm run dev"
echo "Browser: http://localhost:3002"
echo ""
echo "Expected: Compilation should complete in <1 second"
echo "=============================================="
