# Conditional Workflow and Compensation Control

The SNB evaluates typed nested facts without `eval`, selects exactly one task branch, and adds it through the Mission Engine's transactional DAG mutation. Numeric comparisons enforce numeric operands. Compensation plans traverse completed tasks in reverse order and create serial `compensate:*` tasks carrying original outputs. Conditional selection and compensation are auditable mission mutations; compensation execution still uses normal workers, policies and approvals.
