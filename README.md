# Plastic-IO Graph Editor

![plastic-io](https://avatars1.githubusercontent.com/u/60668496?s=200&v=4)

[Public CDN Graph Editor Application](https://plastic-io.github.io/graph-editor/graphs)

_Note: LocalStorage only by default._

# Installation

1. Install the AWS based [Plastic-IO Graph Server](https://github.com/plastic-io/graph-server)
2. Install the Graph Editor, this repository, or use the [public version](https://plastic-io.github.io/graph-editor/graphs).
3. Configure the Graph Editor to use your server.
4. Open your graph editor and start making graphs.

_Note: You can use the graph editor and export to other systems even without a graph server.  However you cannot host HTTP web sites without the graph server._

# .env

You can automatically fill out the values of your users preferences by setting an `.env` file with the following values:

  VUE_APP_GRAPH_HTTP_SERVER=https://7hcv242f49.execute-api.us-east-1.amazonaws.com/dev/
  VUE_APP_GRAPH_WSS_SERVER=wss://w84525agw3.execute-api.us-east-1.amazonaws.com/dev
  VUE_APP_AUTH_PROVIDER_NAME=auth0
  VUE_APP_AUTH_DOMAIN=dev-32-g55ap.us.auth0.com
  VUE_APP_AUTH_CLIENT_ID=V352372k7efF4asfsJyizdfasasUKl
  VUE_APP_AUTH_AUDIENCE=plastic-io-graph-server
  VUE_APP_FORCE_SERVER=false

# What is Plastic-IO?

## Overview

Visual programming using a graph interface.  If you can hook up a cable box, you can write programs in Plastic-IO.  Click and drag vectors into your graph, then connect them together and run it.

## What is Plastic-IO for?

Plastic-IO is a general purpose graph programming language.  It can be used to create any sort of program in any domain.  Here's a few ideas:

* Build your entire microservice architecture as reuseable graphs and vectors.
* Build an entire front facing web site, code and views on the same graph.
* Create a highly mailable services facade to control the shape and flow of your existing APIs.
* Create your massively parallel CLI build pipeline.

Declarative graph programming is great for parallel and asynchronous tasks and generally runs faster and can be built in less time than imperative programming.

## What's so cool about Plastic-IO?

* Build your components in the same interface where you build your graph.
* Pure serverless environment.  Plastic-IO only uses lambdas and CDN based client applications.
* Event Sourced Graph Database ensures you can rewind or fast-forward changes made to your graph.
* Multiuser debug environment for server side _and_ client side programming.
* See the actual animated server data flow in your program _live_ via web sockets.
* Typescript Graph Scheduling Engine built on promises from the ground up.
* Distributed graph schema allows for in-line or runtime side loaded resources to optimize performance.
* Immutable artifact system allows for instant safe reuse of components in other graphs.
* Public and private registries for cataloging and sharing graph components.
* Graph Design and Presentation views allow for live editing of highly complex asynchronous web sites.

## Where can I run Plastic-IO?

Plastic-IO graphs are domain agnostic.  If it can run JavaScript, it can run a Plastic-IO graph.  Just like JavaScript, Plastic-IO vectors and graphs can run in mixed domains, although some are dedicated to a specific domain, for example, a vector that reads files from the file system will likely not work in the browser domain, but will work in the server or CLI domains.  Vectors and graphs are tagged with which domains they work in, so you can make sure you're using the right kind.

## How does this work?

If you use the Graph-Editor and Graph-Server together all of this is abstracted from you and you can concentrate on graph programming.  However if you want to use the scheduling engine directly, it is very easy to do.

Plastic-IO uses a number of code build and analysis tools to build and execute code held in graphs or side loaded in via registries and CDNs.  Compiled code executes through the graph scheduling engine.

To get started, a graph is built then passed to the scheduler.

`const scheduler = new Scheduler(graph, {}, {}, console);`

Next, let the scheduler know which vector to invoke first by using the vector's URL.

`scheduler.url('my-vectors-url');`

And that's it!  The code within the graph's vectors takes care of the rest.

You can hook into a variety of events listed in the scheduling engine documentation if you want to log or react to different events and changes that occur during the runtime of the graph.

# Graph Programming in Plastic-IO

## Core Concepts

In this integrated development environment (IDE), you can create and share graph programs.  Graph programs consist of 4 major parts:

* Graph
* Vectors
* View
* Bus

### Graph

Graphs in Plastic-IO are classed as "hypergraphs".  This means your graph can be imported into another graph where it will show up as a vector.  Graphs are made up of a collection of vectors.  Graphs have an explicit URL.  You can publish and share graphs.  Graphs can be executed on the client, or server, or both.  Graphs are domain agnostic.  It can execute anywhere JavaScript can execute.

### Vectors

Vectors are points on the graph.  Vectors in Plastic-IO are classed as "hypervectors".  This means your vector can have multiple sets of "edges" that connect your vector to other points on the graph.  Additionally, each edge can be shared with multiple other vector's edges at the same time.  These "hyper edges" are called "connectors".  The relationship between the vectors, edges and connectors controls the flow of your graph program.

### View

Each vector has a "view".  When you view the graph, you can see the view of each vector on the graph.  You can edit the view of the vector directly in the IDE.  Vectors have an explicit URL.  You can publish and share vectors.  Although the Plastic-IO execution engine is rendering engine agnostic, this view on the graph editor uses Vue and Vuetify to render views.  It is currently not possible to use rendering engines other than Vue.

### Bus

Each vector has a "set" function. This set function dictates how data flows through the graph.  You can edit the set function of the vector directly in the IDE.  The flow of data through the graph is called "the bus".  Data always flows in one direction, left to right.  This meams data always "comes out" of the right hand side of a vector and "goes into" the left side a vector.

# What are Plastic-IO Graphs?

Plastic-IO graphs are a high level graph programming language built on top of JavaScript and executed with the [Plastic-IO Scheduling Engine](https://github.com/plastic-io/plastic-io).  Plastic-IO graphs are stored as JSON files.  The GUI for Plastic-IO is the [Plastic-IO Graph Editor IDE](https://github.com/plastic-io/graph-editor).

## Executing Graphs on the browser

Graph can be executed directly in the design view of the editor, however you can also set your graph to "Presentation Mode".
In presentation mode, connectors not marked "Visible in Presentation" will be hidden.  Additionally, vectors will by default stack into a flex-grid.  You can set your graph to "Start in Presentation Mode" which will allow you to then distribute your graph program to anyone with a Plastic-IO graph host.

When a vector's set function is being invoked, the `this` object contains a few helpful properties:

| Property     | Description                         |
| ------------ | ----------------------------------- |
| props        | Vue Component props of this vector. |
| component    | Vue Component instance.             |


## Executing Graphs on the Graph Server

When you installed your server, you took note of the endpoint beginning with `ANY - https://`.  This is where your graphs can be executed from.  Where you see `<root>` below is where you would put your HTTP server.

    ANY - https://4bc4u834549.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

Your graph URL goes where you see {proxy+}

_Note: In production `/dev/` is not present at the end of the `ANY` URL._

You can execute graphs on the server by subscribing events to the lambda "DefaultRoute" in this project.  By default, all unbound HTTP traffic to the domain will come to the graph route.  What graph gets executed is based on the URL.

    <root>/<graph.url>.<graph.vector[].url>


    Example:
    The following URL would run vector "html" on graph "home"

    https://mysite.com/home.html

Graphs are stored by their URL.  Once the graph is looked up, the scheduler is invoked with the matching vector's URL.

If no vector URL is specified, the vector URL "index" is assumed.  Similarity, if no graph URL is specified, the graph "index" is assumed.  That makes the default route to the server "/" the graph "index" and the vector "index".

When a vector's set function is being invoked, the `this` object contains a few helpful properties:

| Property     | Description                                                                              |
| ------------ | ---------------------------------------------------------------------------------------- |
| event        | The AWS request event.                                                                   |
| context      | The AWS request context.                                                                 |
| callback     | The AWS request HTTP callback.                                                           |
| AWS          | The AWS library.                                                                         |
| console      | Web socket console transmitter.  Sends log data to the client side Graph Editor IDE.     |

    // example callback
    this.callback(null, {
        statusCode: 200,
        body: "Hello World!"
    });

This is quite literally the AWS callback method passed to the lambda.  If you do not call it within 30 seconds, it will automatically be called and a timeout will be logged.  Your lambda can run for longer than 30 seconds, but API gateway requires all HTTP responses end within 30 seconds.

## Environments and Publishing

When you publish a graph, that graph becomes available in the production environment.  Changes to the graph will not take effect until you publish the graph once again.  You can still test your graph in the development environment after each change.

## Sharing Vectors and Graphs

When you publish your vector or graph, it becomes available to other users of your Graph Database.  These published versions are immutable and free of dependency issues.  Once a graph or vector is published, users of that artifact can be sure it will never change.  Past versions are listed right next to current versions and clearly labeled.

You can also share your graphs and vectors by downloading them via links provided in the IDE and then clicking and dragging the files onto other graphs.  Unlike using published graphs and vectors, importing this way causes the imported artifact to originate on the graph you are currently editing, where published vectors and graphs are linked and can potentially have their data side loaded.

### Infrastructure as a Graph

Because you can share the parts of the graph, and entire hypergraphs, Plastic-IO server allows you to build your entire infrastructure using first "low level" JavaScript and then higher level graphical programming, all within the multiuser [Plastic-IO IDE](https://github.com/plastic-io/graph-editor).

### Maximize Code Reuse

Because each vector and graph in Plastic-IO are implicitly modular, this makes it so you can reuse the artifacts you create in other graphs very easily.  Plastic-IO graph server provides a marketplace of graphs and vectors for developers to choose from, safely and securely.

See https://github.com/plastic-io/graph-editor for for the GUI client for this server.


## Client Server Sequence Diagram

    +-----------+ +------------------+ +-----------------------------+       +----------------+
    |           | |                  | |                             |       |                |
    |  Browser  | |   Local Graph    | |   Local Remote Graph Copy   |       |  Remote Graph  |
    |           | |                  | |                             |       |                |
    +-----+-----+ +--------+---------+ +-------------+---------------+       +--------+-------+
          |                |                         |                                |
          |               +++                        |                               +++
          +----Change---> | | +----Diff Calc----------------Change sent to Server--> | |
          |               | |                        |                               | |
          |               | |                       +++                              | |
          |               | |                       | |                              | |
          |               | | <----Diff Calc------+ | | <---Change Sent to Client--+ | |
          |               +++                       +++                              +++
          |                |                         |                                |
          |                |                         |                                |


## Going Deeper

Scheduling engine documentation: [Scheduler](https://plastic-io.github.io/plastic-io/classes/_scheduler_.scheduler.html)

# Installing development Graph Editor
 
Uses local storage

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Unit tests
```
npm run test:unit
```

### E2E tests
```
npm run test:e2e
```

