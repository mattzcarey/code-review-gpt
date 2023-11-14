# Aspects

Aspects are a way to apply an operation to all constructs in a given scope.

## RemovalPolicyAspect

The RemovalPolicyAspect forces all removal policies of **out of production** constructs to Destroy. This makes it so deleting a stack cleans up all objects created by the stack, even the stateful objects like Buckets, as long as it is done out of production.
