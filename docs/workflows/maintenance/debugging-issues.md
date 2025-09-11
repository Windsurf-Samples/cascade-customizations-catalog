---
description: Systematic debugging workflow for identifying and resolving software issues
---

This workflow provides a structured approach to debugging issues, from initial problem identification to resolution and prevention.

## Phase 1: Problem Definition

1. **Reproduce the issue consistently**
```bash
# Document exact steps to reproduce
# Note: environment, browser, OS, versions
# Record any error messages or unexpected behavior
```

2. **Gather initial information**
- What was the expected behavior?
- What actually happened?
- When did this start occurring?
- Has this worked before?
- What changed recently?

3. **Check obvious causes first**
```bash
# Verify service status
curl -I https://your-api.com/health

# Check recent deployments
git log --oneline -10

# Review recent configuration changes
git diff HEAD~5 -- config/
```

## Phase 2: Information Gathering

4. **Collect relevant logs**
```bash
# Application logs
tail -f logs/application.log | grep ERROR

# System logs (Linux)
sudo journalctl -f -u your-service

# Database logs
tail -f /var/log/postgresql/postgresql.log

# Web server logs
tail -f /var/log/nginx/error.log
```

5. **Check system resources**
```bash
# CPU and memory usage
top
htop

# Disk space
df -h

# Network connectivity
ping external-service.com
netstat -tulpn | grep :3000
```

6. **Review monitoring dashboards**
- Application performance metrics
- Error rates and response times
- Database query performance
- Infrastructure health

## Phase 3: Hypothesis Formation

7. **Analyze the data collected**
- Look for patterns in logs
- Correlate timing with deployments/changes
- Identify common factors across failures

8. **Form testable hypotheses**
- Start with the most likely causes
- Consider recent changes first
- Think about external dependencies

## Phase 4: Systematic Testing

9. **Test hypotheses one by one**
```bash
# Test in isolation
# Create minimal reproduction case
# Use debugging tools specific to your stack

# Node.js debugging
node --inspect-brk app.js
# Then connect Chrome DevTools

# Python debugging
python -m pdb script.py

# Database query analysis
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

10. **Use debugging tools effectively**
```bash
# Network debugging
curl -v https://api.example.com/endpoint
tcpdump -i any port 80

# Process debugging
strace -p <process_id>
lsof -p <process_id>

# Memory debugging
valgrind --tool=memcheck ./your-program
```

## Phase 5: Binary Search Approach

11. **Isolate the problem area**
```bash
# Git bisect for regression issues
git bisect start
git bisect bad HEAD
git bisect good v1.2.0
# Git will guide you through the process

# Comment out code sections
# Add debug statements
# Use feature flags to isolate components
```

12. **Narrow down to specific components**
- Test individual functions/modules
- Mock external dependencies
- Use unit tests to isolate behavior

## Phase 6: Deep Dive Investigation

13. **Add comprehensive logging**
```javascript
// Add structured logging
console.log('DEBUG: Processing user', { 
  userId, 
  timestamp: new Date().toISOString(),
  requestId: req.id 
});

// Log function entry/exit
function processPayment(amount, userId) {
  console.log('ENTER processPayment', { amount, userId });
  try {
    // ... function logic
    console.log('EXIT processPayment SUCCESS');
    return result;
  } catch (error) {
    console.log('EXIT processPayment ERROR', { error: error.message });
    throw error;
  }
}
```

14. **Use profiling tools**
```bash
# Node.js profiling
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# Python profiling
python -m cProfile -o profile.stats script.py
```

## Phase 7: Solution Implementation

15. **Implement the fix**
```bash
# Create a branch for the fix
git checkout -b fix/issue-description

# Make minimal changes to fix the issue
# Add tests to prevent regression
# Update documentation if needed
```

16. **Test the solution thoroughly**
```bash
# Run existing tests
npm test

# Test the specific issue scenario
# Test edge cases
# Test in staging environment

# Performance testing if relevant
ab -n 1000 -c 10 http://localhost:3000/api/endpoint
```

## Phase 8: Documentation and Prevention

17. **Document the issue and solution**
```markdown
## Issue: [Brief Description]
**Date**: 2024-01-15
**Severity**: High
**Affected**: User authentication system

### Root Cause
Database connection pool exhaustion due to unclosed connections

### Solution
- Added proper connection cleanup in error handlers
- Implemented connection pool monitoring
- Added alerts for connection pool usage > 80%

### Prevention
- Added unit tests for connection cleanup
- Updated code review checklist
- Implemented automated connection leak detection
```

18. **Implement preventive measures**
```bash
# Add monitoring/alerts
# Create automated tests
# Update deployment procedures
# Share learnings with team

# Add to CI/CD pipeline
echo "npm run test:connections" >> .github/workflows/ci.yml
```

## Phase 9: Post-Resolution

19. **Monitor for recurrence**
- Set up alerts for similar patterns
- Track related metrics
- Schedule follow-up reviews

20. **Share knowledge**
- Update team documentation
- Conduct post-mortem if significant
- Add to debugging playbook
- Update monitoring dashboards

Remember: The goal is not just to fix the immediate issue, but to understand why it happened and prevent similar issues in the future.
