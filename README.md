# Simple Expressions

Parses and evaluates a limited expression language in the context of a json-like environment.

## Motivation

Often, user-facing apps could benefit from slightly personalized behavior that doesn't justify truly custom code. For example, a status dashboard may cover more use cases if each user can choose which information they wish to see and in which order. Rules engines may be effective means of customization, but are often very heavyweight and may expect to hook into a database. This library intends to performa a similar job in a much more direct and streamlined fashion by providing tools to evaluate very simple expressions in a very limited language without placing many requirements on the context.

Particularly, it focuses on handling data in a json-like format through expression language based on familiar C-family syntax.
