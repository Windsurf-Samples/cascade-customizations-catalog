---
trigger: glob

globs: "*.java"
---

Java Coding Guidelines

Code Style and Formatting
Consistent Indentation: Use 4 spaces for indentation rather than tabs.

Line Length: Limit lines to 100-120 characters maximum.

Naming Conventions:

Classes: Use PascalCase (e.g., RuleEngine)
Methods and variables: Use camelCase (e.g., validateRule())

Constants: Use UPPER_SNAKE_CASE (e.g., MAX_RULE_COUNT)

Packages: Use lowercase with dots (e.g., com.company.rules)


Code Organization

Class Structure: Organize class members in a logical order:
Static variables
Instance variables
Constructors
Methods

Inner classes
Method Length: Keep methods short and focused on a single responsibility.

Best Practices
Immutability: Make rule objects immutable when possible to prevent unexpected changes.

Validation: Validate all inputs to rule methods, especially when accepting external data.
Exception Handling: Use specific exceptions rather than generic ones and provide meaningful error messages.

Documentation: Document all public APIs with Javadoc comments.
Rule-Specific Guidelines

Rule Design:
Implement rules as separate classes that implement a common interface.

Consider using the Strategy pattern for different rule implementations.

Rule Evaluation:
Make rule evaluation logic clear and explicit.
Avoid complex nested conditions; break them down into smaller, named methods.

Rule Composition:
Design rules to be composable (can be combined with other rules).
Consider using the Composite pattern for rule groups.
Testing
Test Coverage: Aim for high test coverage of rule logic.
Edge Cases: Test boundary conditions and edge cases explicitly.
Readability: Write test names that clearly describe what is being tested.
Performance Considerations
Lazy Evaluation: Use lazy evaluation for expensive rule calculations.
Caching: Cache rule evaluation results when appropriate.
Avoid Premature Optimization: Focus on correctness first, then optimize if needed.

