# [WIP] Temme: A Concise and Convenient Way to Extract JSON from HTML

This article will introduce a tool that extracts JSON from HTML. I will use the HTML from StackOverflow to illustrate the usage of temme. This article will use CSS selectors extensively. You can refer to [MDN](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Introduction_to_CSS/Selectors).

[TODO] Give an informal definition for *item* and *node* in this article.

Recent days, I spend a lot of time on Node web crawlers. I use [cheerio](https://github.com/cheeriojs/cheerio) (You can think that it is a server-side jQuery.) to parse HTML. Cheerio implements various functions from core jQuery. Temme provides a lot APIs that query/edit/delete/add nodes to manipulate the HTML document. However, as more and more HTML document are crawled, the code that uses cheerio to parse HTML becomes complex and intractable. A web crawler only uses a small subset of APIs that extracts data from HTML, and a web crawler have some common patterns to extract data from HTML which do not fit well with cheerio. Here are common patterns that appear in a web crawler:

![StackOverflow Index Page](./imgs/top-questions.jpg)

The following examples assumes that we are crawling a list of top questions from StackOverflow as the above figure shows.

1. Different items need to be extracted on the same node/subtree. For example, every question has a title, a link, a list of tags, and counts for votes/answers/views. All these items is stored in a `div.question-summary`.
2. The target of crawling is an array of items (even an array of array of items). A list of top questions is just a good examples.
3. Simple but frequent formatting, like converting type of views count from `String` to `Number`, or converting the link from relative to absolute.

Temme is a tool that I have developed mainly for dealing with these common patterns. Temme adds some extra grammar on CSS selectors to extract JSON from HTML.

1. Supports multiple selectors; Supports extracting multiple items;
2. Supports extracting a list of items;
3. Supports formatting.

## Installation

```bash
# Command line tool prefers global installation
yarn global add temme

# Basic usage
temme <selector> <html>

# Use html from stdin; --format to format the output
temme <selector> --format

# Use selector from a file
temme <path-to-a-selector-file>

# Pipe html from `curl` to `temme`
curl -s <url> | temme <selector>
```

Temme offers an [online version](https://temme.js.org) in which the editor supports syntax highlighting. The remaining parts of this article can also be run in the online version. Note that the HTML needs to be copies manually.

## Example-1: Extract Items of the First Question

The selector to extract items of the first question is as follows:

![Temme-Selector for the First Question](./imgs/first-question-selector.jpg)

```bash
curl -s https://stackoverflow.com/?tab=week | temme '.question-hyperlink[href=$link]{$title}; .votes span[title=$votes];' --format
# output
# {
#   "link": "/questions/47702220/what-made-i-i-1-legal-in-c17",
#   "title": "What made i = i++ + 1; legal in C++17?",
#   "votes": "107 votes"
# }
```

The temme-selector above is very like CSS selector. The differences are that temme-selector contains syntax constructs like `[foo=$bar]` and `${buzz}`. Syntax construct `[foo=$bar]` is called **attribute-capture** and it means that *put the value of attribute `foo` into the field `bar` in result*; Syntax construct `${buzz}` is called **content-capture** and it means that *put the text content of the node into field `.buzz` in result*.

The above temme-selector contains two attribute-captures and one content-capture. It extracts three different items all at once. The above temme-selector also contains two sub-selectors, each ends with a semicolon.

If you are familiar with [emmet](https://emmet.io/), you can figure out that the behavior of temme is the reverse of emmet. [More details here](https://github.com/shinima/temme#inspiration).

## Example-2: Simple Formatting

In example-1, we have captured three items of the first question. Item `votes` is `'107 votes'` of type string. If we call `votes.replace(' votes', '')` then we can get `'107'`. In temme, we can use **filters** to format the output (We do not capture other items this time):

```bash
curl -s https://stackoverflow.com/?tab=week | temme '.votes span[title=$votes|replace(" votes", "")];' --format
# output
# {
#   "votes": "107"
# }
```

Filters can be simply chained so we now use filter `Number` to convert `'107'` to a number.

```bash
curl -s https://stackoverflow.com/?tab=week | temme '.votes span[title=$votes|replace(" votes", "")|Number];' --format
# output:
# {
#   "votes": 107
# }
```

In this example, all we capture is a single item `votes`. We can omit `votes` in `$votes` and make a **default-capture**:

```bash
curl -s https://stackoverflow.com/?tab=week | temme '.votes span[title=$|replace(" votes", "")|Number];' --format
# output: 107
```

The meaning of default-capture is simple: If we omit `xxx` in `$xxx`, then the structure of result will change from `{ xxx: yyy }` to `yyy`.

## Example-3: The List of Top Questions

Every question in the list of top questions corresponds to a node matching CSS selector `div.question-summary`. Example-1 only extracts items of the first question. Here we use `@` to make an array-capture that extracts the entire list of questions. The selector is as follows:

![The List of Top Questions](./imgs/top-questions-selector.jpg)

```bash
curl -s https://stackoverflow.com/?tab=week | temme 'div.question-summary@topQuestions { .question-hyperlink[href=$link]{$title}; .votes span[title=$votes]; }' --format
# output
# {
#   "topQuestions": [
#     {
#       "link": "/questions/47702220/what-made-i-i-1-legal-in-c17",
#       "title": "What made i = i++ + 1; legal in C++17?",
#       "votes": "107 votes"
#     },
#     {
#       "link": "/questions/47698476/is-1-correct-for-using-as-maximum-value-of-an-unsigned-integer",
#       "title": "Is `-1` correct for using as maximum value of an unsigned integer? [on hold]",
#       "votes": "33 votes"
#     },
#     ......
#   ]
# }
```

The meaning of the selector: Every question corresponds to a node matching `div.question-summary` and we place `@` after the selector that means we are going to capture an array of items. The following `topQuestions` gives the field name that the question list will be in the final result. Then we copy the selectors in example-1 within the curly braces to capture the items of individual question. The selector extracts the list of top questions all at all in a concise way.

Here we can omit `topQuestions` in `@topQuestions` and make a default-capture as in example-1, then the result will just be the list of top questions.

The array-capture can be nested, and the nested array-capture can extract an array of array of items. For example, in the question page on StackOverflow, a question has several answers, and each answer has several comments. We can use the following selector to extract an array of array of comments:

```bash
curl -s https://stackoverflow.com/questions/1014861/is-there-a-css-parent-selector | temme '.answer@{ .comment@{ .comment-body{$|trim}; }; };'
```

## Example-4 TODO
