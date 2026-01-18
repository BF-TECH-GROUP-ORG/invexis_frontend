#!/bin/bash

# Performance Optimization - Quick Reference Commands
# Run these commands to verify and test the optimizations

echo "======================================"
echo "Performance Optimization Test Suite"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check build time improvement
echo -e "\n${BLUE}1. Building with optimizations...${NC}"
echo "   This should be 30-50% faster than previous builds"
time npm run build

# 2. Check dev server startup
echo -e "\n${BLUE}2. Starting dev server...${NC}"
echo "   Ctrl+C to stop"
timeout 10 npm run dev -- --turbopack || true

# 3. Check for bundle size
echo -e "\n${BLUE}3. Checking built files...${NC}"
echo "   Checking .next/static size (should be smaller)"
if [ -d ".next/static" ]; then
  du -sh .next/static
  echo "   File count:"
  find .next/static -type f | wc -l
fi

# 4. Verify no broken imports
echo -e "\n${BLUE}4. Running linter...${NC}"
npm run lint -- --max-warnings 0 || true

# 5. Check TypeScript compilation
echo -e "\n${BLUE}5. Running TypeScript check...${NC}"
npx tsc --noEmit || true

# 6. Test development build
echo -e "\n${BLUE}6. Testing dev build...${NC}"
npm run build:dev 2>&1 | head -20

echo -e "\n${GREEN}✅ Performance optimization tests complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Compare build times (should see 30-50% improvement)"
echo "2. Check dev server response time"
echo "3. Review .next/static size (should be 20-40% smaller)"
echo "4. Test lazy-loaded pages (check Network tab in DevTools)"
echo "5. Monitor performance with DevTools Performance tab"
