# Codebase Mapping module

## Goal

The aim of this module is to detect functional regressions in a codebase introduced by a code change ie bugs.

We aim to do this:

- build a mapping of a whole codebase
- update a mapping based on a diff
- search for relevant code snippets from a function name/path

Outcomes: a python class which has methods to do the above and script with command line interface to do it.

### Use case

Proposed Code review flow.

1. Look at PR, see which files are changed.
2. Rebuild the mapping for those files.
3. For each diff chunk see what functions have changed.
4. Find relevant snippets in the codebase where those functions are used (downstream)
5. Ask the LLM to review the change using the context.

This module will allow you to do 2,3 and 4.

#### Other

This code mapping should also be pretty useful if asking the llm about refactoring or building new things.

### Data Structure

For each file changed file we should output a summary of the file and which files it depends on and which depend on it.

For example, if we have a file `a.ts` which imports `b.ts` and `c.ts` and is used in `d.ts`, the output should be something like:

```
{
  1: {
    doMaths: {
      imported_by: [main@4],
      summary: takes three numbers. The first 2 it adds together using the add function, the result is used in the subtract function along with the third number. The result is then multiplied by random.
    },
  },
  2: {
    add: {
      imported_by: [doMaths@1],
      summary: takes two numbers and adds them together
    },
  },
  3: {
    subtract: {
      imported_by: [doMaths@1],
      summary: takes two numbers and subtracts the first one from the second
    },
  },
  4: {
    main: {
      imports: [doMaths@1],
      summary: prints the result of doMaths
    }
  }
}
```

Optimisation: make the file path an alias so it is much shorter in the json/prompt

[ src/a.ts: 1, src/b.ts: 2, src/c.ts: 3, src/d.ts: 4 ]

### Search

Deterministic search to find all the downstream functions of the changed function.

(+ optional semantic search of the summary)

Find context:

1. Find the name of a changed function in the diff
2. Look up the file path to get alias
3. Look up the func_name@alias in the json to get the downstream functions and their summaries. Go like 5 layers deep max.

### Prompt formatting

When looking through the diff it makes most sense to go as far back as possible with the change.

For example if the `doMaths` has changed above but `add` has also changed it makes sense to start with add take that as the root. Include doMaths as context and then other context below.

Maybe we need a previous_image and a current_image for summary and arguments to make this easier.

So if the functions changed were: doMaths, add. Example prompt:

```
<instructions>
some instructions: review the changed functions: `add`, `doMaths`. Their impact on the codebase has been added for completeness.
</instructions>

<function>
  add
</function>
<path>
  2
</path>
<diff_chunk>
  diff chunk of add
</diff_chunk>
<imported_by>
  doMaths@1
</imported_by>
<downstream>
  <function>
    doMaths
  </function>
  <path>
    1
  </path>
  <diff_chunk>
    diff chunk of doMaths
  </diff_chunk>
  <imported_by>
    main@4
  </imported_by>
  <downstream>
    <function>
      main
    </function>
    <path>
      4
    </path>
    <unchanged_summary>
      prints the result of doMaths
    </unchanged_summary>
  </downstream>
</downstream>

<semantically_similar>
  <function>
    subtract
  </function>
  <path>
    3
  </path>
  <unchanged_summary>
    takes two numbers and subtracts the first one from the second
  </unchanged_summary>
  <used_in>
    doMaths@1
  </used_in>
</semantically_similar>
```

Expected output:

```
{
  tools_call: {
    reviews: [
      {
        function_name: add,
        review: <review of changes to add>
        suspected_regression: <boolean>
      },
      {
        function_name: doMaths,
        review: <review of changes to doMaths>
        suspected_regression: <boolean>
      },
    ]
  }
}
```

or

```
{
  tools_call: {
    read_files: [ 2, 4 ]
  }
}
```
